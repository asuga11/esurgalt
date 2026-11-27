import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import MainContext from "../../Context/MainContext";
import TestList from "./TestList";

vi.mock("jodit-react", () => ({
  default: ({ ref, value, onBlur }) => <textarea ref={ref} aria-label="Редактор" defaultValue={value} onBlur={(event) => onBlur(event.target.value)} />,
}));

test("warns about missing question and answer without creating a blank question", async () => {
  const addTest = vi.fn();
  function TeacherTestBank() {
    const [testOnestate, setTestOneState] = useState(null);
    return <MainContext.Provider value={{
      user: { id: "teacher-1" },
      getTestHicheel: () => {}, getTestSan: () => {},
      testSanState: { testsan: [] }, hicheelState: { content: [] },
      testOnestate, setTestOneState, addTest,
    }}><TestList /></MainContext.Provider>;
  }
  render(<TeacherTestBank />);
  fireEvent.click(screen.getByRole("button", { name: "Тест нэмэх" }));

  const editor = within(await screen.findByRole("dialog"));
  const save = editor.getByRole("button", { name: "Хадгалах", exact: true });
  fireEvent.click(save);
  expect(editor.getByRole("alert")).toHaveTextContent("Асуултын агуулгыг оруулна уу.");

  fireEvent.change(editor.getByRole("textbox", { name: "Редактор" }), { target: { value: "2 + 2 хэд вэ?" } });
  fireEvent.click(save);
  expect(editor.getByRole("alert")).toHaveTextContent("Хариулт нэмнэ үү.");
  expect(addTest).not.toHaveBeenCalled();
});

test("offers subject and topic filters and resets them when switching banks", async () => {
  const getTestSan = vi.fn(async () => true);
  const getTestHicheel = vi.fn(async () => true);
  render(<MainContext.Provider value={{
    user: { id: "teacher-1" },
    getTestSan, getTestHicheel,
    testSanState: { testsan: [] },
    hicheelState: { content: [{ hicheel_name: "Математик", aguulga_name: ["Бутархай"] }] },
  }}><TestList /></MainContext.Provider>);

  await screen.findByText("Асуулт олдсонгүй");
  fireEvent.change(screen.getByRole("combobox", { name: "Хичээл" }), { target: { value: "Математик" } });
  fireEvent.change(screen.getByRole("combobox", { name: "Сэдэв" }), { target: { value: "Бутархай" } });
  expect(getTestSan).toHaveBeenLastCalledWith("teacher-1", "Математик", "Бутархай", 5, 1, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole("button", { name: "ЭЕШ-ийн сан" }));
  expect(getTestHicheel).toHaveBeenLastCalledWith("", expect.any(AbortSignal));
  expect(getTestSan).toHaveBeenLastCalledWith("", "", "", 5, 1, expect.any(AbortSignal));
  expect(screen.getByRole("combobox", { name: "Сэдэв" })).toBeDisabled();
  await screen.findByText("Асуулт олдсонгүй");
});
