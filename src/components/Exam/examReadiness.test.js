import { expect, test } from "vitest";
import { getExamIssues, getQuestionWarning } from "./examReadiness";

const choice = (answers) => ({ question: "2 + 2 хэд вэ?", testType: "Нэг сонголттой", answers });
const getExamWarning = (questions) => getExamIssues(questions)[0]?.message || "";

test("requires a real question and identifies the incomplete question in an exam", () => {
  expect(getExamWarning([])).toContain("дор хаяж нэг");
  expect(getExamWarning([{ testType: "Текст", question: "Заавар" }])).toContain("дор хаяж нэг");
  expect(getExamWarning([{ ...choice([]), question: "<p>&nbsp;<br></p>" }])).toMatch(/^1-р.*Асуултын агуулгыг/);
  expect(getExamWarning([choice([])])).toContain("Хариулт нэмнэ");
});

test("checks blank answer options and requires exactly one correct answer for a single-choice question", () => {
  expect(getQuestionWarning(choice([{ answer: "<p><br></p>", correct: true }]))).toContain("Хариултаа оруулна");
  expect(getQuestionWarning(choice([{ answer: "3" }]))).toContain("Зөв хариултаа");
  expect(getQuestionWarning(choice([{ answer: "3", correct: true }, { answer: "4", correct: true }]))).toContain("Нэг зөв");
  expect(getExamWarning([choice([{ answer: "3" }, { answer: "4", correct: true }])])).toBe("");
});

test("supports image questions, essay guidance, and zero-valued open answers", () => {
  expect(getQuestionWarning({ question: '<img src="/question.png">', testType: "Текст" })).toBe("");
  expect(getQuestionWarning({ question: "Эсээ бичнэ үү.", testType: "Эсээ" })).toContain("үнэлэх заавар");
  expect(getQuestionWarning({ question: "Эсээ бичнэ үү.", testType: "Эсээ", guidance: "Гол санааг үнэлнэ." })).toBe("");
  expect(getQuestionWarning({ question: "Тэгийг бичнэ үү.", testType: "Задгай даалгавар", answers: [{ answer: "а", value: 0 }] })).toBe("");
});
