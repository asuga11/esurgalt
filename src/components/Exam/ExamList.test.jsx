import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";
import MainContext from "../../Context/MainContext";
import ExamList from "./ExamList";

vi.mock("../Tests/TestList", () => ({ default: ({ questionToEdit }) => questionToEdit && <p>Засах асуулт {questionToEdit}</p> }));
vi.mock("../Suragch/ShalgaltList", () => ({ default: () => null }));

test("checks current questions before allowing a teacher to activate an exam", async () => {
  const exam = { _id: "exam-1", name: "Математик", examTime: 10, examType: "ЭЕШ-ын сорил", aimag: [], isActive: false };
  const updateExam = vi.fn();
  const fetchExamDetails = vi.fn().mockResolvedValue({ shalgalt: exam, listTests: [
    { _id: "q1", owner_id: "teacher-1", question: "2 + 2 хэд вэ?", testType: "Нэг сонголттой", answers: [] },
    { question: "", testType: "Нөхөх", answers: [] },
  ] });
  function TeacherContext() {
    const [shalgaltOne, setShalgaltOne] = useState({ shalgalt: null, listTests: [] });
    return (
      <MainContext.Provider value={{
        user: { id: "teacher-1", role: "bagsh" },
        getExams: () => {}, getShalgaltList: () => {},
        examState: { success: true, shalgalt: [exam] },
        shalgaltOne, setShalgaltOne, addressState: { address: [] },
        dunAllState: { shalgaltdun: [] },
        fetchExamDetails, updateExam,
      }}><ExamList /></MainContext.Provider>
    );
  }
  render(<MemoryRouter><TeacherContext /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Математик сорилыг засах" }));

  const form = within(await screen.findByRole("dialog"));
  fireEvent.click(form.getByRole("checkbox", { name: "Эхлүүлэх" }));
  fireEvent.click(form.getByRole("button", { name: "Хадгалах", exact: true }));
  expect(await form.findByRole("alert")).toHaveTextContent("Дараах алдааг зассаны дараа");
  expect(form.getByText("1-р даалгавар. Хариулт нэмнэ үү.")).toBeInTheDocument();
  expect(form.getByText("2-р даалгавар. Асуултын агуулгыг оруулна уу.")).toBeInTheDocument();
  expect(fetchExamDetails).toHaveBeenCalledWith("exam-1");
  expect(updateExam).not.toHaveBeenCalled();
  fireEvent.click(form.getByRole("button", { name: "1-р даалгаврыг засах" }));
  expect(form.getByText("Засах асуулт q1")).toBeInTheDocument();
});
