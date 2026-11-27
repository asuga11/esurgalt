import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import MainContext from "../../Context/MainContext";
import ExamReport from "./ExamReport";
import { makeExamCsv } from "./examReportData";

test("scores the selected class and reports full-credit questions from available results", async () => {
  const fetchExamResults = vi.fn().mockResolvedValue({ shalgaltdun: [
    { member_name: "Ану", member_id: "a", member_class: "12А", onooZuvHariu: 8 },
    { member_name: "Бат", member_id: "b", member_class: "12Б", onooZuvHariu: 2 },
    { member_name: "Болд", member_id: "c", member_class: "12Б", onooZuvHariu: 4 },
  ] });
  const question = { _id: "q1", question: "Нэгдүгээр асуулт", points: 4 };
  const fetchExamMemberResult = vi.fn(async (_, member) => ({ shalgaltdun: { contentQuiz: [
    { testsan_id: question, onoo: member === "b" ? 2 : 4 },
  ] } }));
  render(<MainContext.Provider value={{ fetchExamResults, fetchExamMemberResult }}><ExamReport exam={{ _id: "exam" }} /></MainContext.Provider>);

  fireEvent.change(await screen.findByRole("combobox", { name: "Тайлангийн анги" }), { target: { value: "12Б" } });
  expect(screen.getByText(/Дундаж оноо 3$/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Асуултын тайлан тооцох" }));
  expect(await screen.findByText(/50\s*% \(1\/2\)/)).toBeInTheDocument();
  expect(fetchExamMemberResult.mock.calls.map(([, id]) => id)).toEqual(["b", "c"]);
});

test("escapes CSV delimiters, and keeps formula-like names as text", () => {
  const result = makeExamCsv([{ member_name: "=1+1", member_school: 'А, "Б"', member_class: "12А", onooZuvHariu: 0 }]);
  expect(result.endsWith(`"'=1+1","А, ""Б""","12А","0"`)).toBe(true);
});
