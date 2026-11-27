import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import MainContext from "../../Context/MainContext";
import ExamProgress from "./ExamProgress";

test("counts participant statuses and filters the roster without changing the totals", async () => {
  const fetchExamDetails = vi.fn().mockResolvedValue({ shalgalt: { listMembers: [
    { member_id: "a", member_name: "Ану", examStatus: "Хуваарилсан" },
    { member_id: "b", member_name: "Бат", member_class: "12А", examStatus: "Ажиллаж байна" },
    { member_id: "c", member_name: "Сараа", examStatus: "Дууссан" },
    { member_id: "d", member_name: "Туяа", examStatus: "Дууссан" },
  ] } });
  const fetchExamAttempt = vi.fn().mockResolvedValue({ shalgaltdun: [
    { testsan_id: { testType: "Нэг сонголттой" }, studAnswers: [{ _id: "option" }] },
    { testsan_id: { testType: "Нөхөх" }, studAnswers: [{ value: "" }] },
    { testsan_id: { testType: "Текст" }, studAnswers: [] },
  ] });
  render(
    <MainContext.Provider value={{ fetchExamDetails, fetchExamAttempt }}>
      <ExamProgress exam={{ _id: "exam-1", name: "Математик" }} onClose={() => {}} />
    </MainContext.Provider>
  );

  const roster = within(await screen.findByRole("table"));
  expect(roster.getAllByRole("rowheader")).toHaveLength(4);
  expect(screen.getByText(/Сүүлд шинэчилсэн/).querySelector("time")).toHaveAttribute("datetime");
  const search = screen.getByRole("searchbox", { name: "Нэр, сургууль, ангиар хайх" });
  fireEvent.change(search, { target: { value: "бат 12а" } });
  expect(roster.getAllByRole("rowheader")).toHaveLength(1);
  fireEvent.click(roster.getByRole("button", { name: "Бат хадгалсан хариултын тоо" }));
  expect(await roster.findByText("1 / 2 хариулт хадгалагдсан")).toBeInTheDocument();
  fireEvent.change(search, { target: { value: "" } });
  expect(screen.getByText("Дуусгасан", { selector: "dt" }).nextElementSibling).toHaveTextContent("2");
  fireEvent.change(screen.getByRole("combobox", { name: "Төлөвөөр шүүх" }), { target: { value: "Дуусгасан" } });
  expect(roster.getAllByRole("rowheader").map((row) => row.textContent)).toEqual(["Сараа", "Туяа"]);
  expect(screen.getByText("Нийт бүртгүүлсэн").nextElementSibling).toHaveTextContent("4");
});

test("keeps the last successful roster and update time after a failed refresh", async () => {
  const fetchExamDetails = vi.fn()
    .mockResolvedValueOnce({ shalgalt: { listMembers: [{ member_id: "a", member_name: "Ану" }] } })
    .mockRejectedValueOnce(new Error("Network disconnected"));
  render(<MainContext.Provider value={{ fetchExamDetails }}><ExamProgress exam={{ _id: "exam-1" }} onClose={() => {}} /></MainContext.Provider>);

  await screen.findByRole("rowheader", { name: "Ану" });
  const timestamp = screen.getByText(/Сүүлд шинэчилсэн/).querySelector("time").dateTime;
  fireEvent.click(screen.getByRole("button", { name: "Шинэчлэх", exact: true }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Сүүлд авсан мэдээллийг харуулж байна.");
  expect(screen.getByRole("rowheader", { name: "Ану" })).toBeInTheDocument();
  expect(screen.getByText(/Сүүлд шинэчилсэн/).querySelector("time").dateTime).toBe(timestamp);
});
