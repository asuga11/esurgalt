import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { expect, test } from "vitest";
import MainContext from "../Context/MainContext";
import Nav from "./Nav";

function ExamCategory() {
  const { stype } = useParams();
  return <main aria-labelledby="page-title" data-category={stype} />;
}

function renderNav(content) {
  render(
    <MemoryRouter>
      <MainContext.Provider value={{ sorilType: { content } }}>
        <Nav />
        <Routes>
          <Route path="/" element={<h1>Нүүр</h1>} />
          <Route path="/soril/:stype" element={<ExamCategory />} />
        </Routes>
      </MainContext.Provider>
    </MemoryRouter>
  );
}

test("lists ЭЕШ and server categories in one desktop exam menu", async () => {
  renderNav([{ examType: "Олимпиад" }, { examType: "ЭЕШ-ын сорил" }]);

  const button = within(screen.getByRole("navigation", { name: "Үндсэн цэс" })).getByRole("button", { name: "Сорил" });
  fireEvent.click(button);
  const menu = within(await screen.findByRole("menu"));
  expect(menu.getAllByRole("menuitem").map((item) => item.textContent)).toEqual(["ЭЕШ-ын сорил", "Олимпиад"]);
  fireEvent.click(menu.getByRole("menuitem", { name: "Олимпиад" }));
  expect(await within(screen.getByRole("banner")).findByRole("heading", { name: "Олимпиад" })).toBeInTheDocument();
  expect(screen.getByRole("main", { name: "Олимпиад" })).toHaveAttribute("data-category", "Олимпиад");
  expect(within(screen.getByRole("main")).queryByRole("heading")).toBeNull();

  fireEvent.click(button);
  fireEvent.click(await screen.findByRole("menuitem", { name: "ЭЕШ-ын сорил" }));
  expect(await screen.findByRole("heading", { name: "ЭЕШ-ын сорил" })).toBeInTheDocument();
});

test("opens ЭЕШ from the mobile exam menu before server categories arrive", async () => {
  renderNav([]);

  fireEvent.click(screen.getByRole("button", { name: "Үндсэн цэс нээх" }));
  const drawer = within(await screen.findByRole("dialog"));
  fireEvent.click(drawer.getByRole("button", { name: "Сорил" }));
  fireEvent.click(drawer.getByRole("link", { name: "ЭЕШ-ын сорил" }));
  expect(await screen.findByRole("heading", { name: "ЭЕШ-ын сорил" })).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
