import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import MainContext from "../Context/MainContext";
import HomeHero from "./HomeHero";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function renderBanner() {
  render(
    <MemoryRouter>
      <MainContext.Provider value={{ sorilType: {} }}>
        <HomeHero />
      </MainContext.Provider>
    </MemoryRouter>
  );
}

test("rotates the original banner photos and lets the user stop rotation", () => {
  vi.useFakeTimers();
  renderBanner();

  const campus = screen.getByAltText("МУИС-ийн Баруун бүсийн сургуулийн барилга");
  const learning = screen.getByAltText("Цахим сургалтын зураг");
  expect(campus).toHaveAttribute("aria-hidden", "false");

  act(() => vi.advanceTimersByTime(6000));
  expect(learning).toHaveAttribute("aria-hidden", "false");

  fireEvent.click(screen.getByRole("button", { name: "Зураг солигдохыг түр зогсоох" }));
  act(() => vi.advanceTimersByTime(12000));
  expect(learning).toHaveAttribute("aria-hidden", "false");

  fireEvent.click(screen.getByRole("button", { name: "Өмнөх зураг" }));
  expect(campus).toHaveAttribute("aria-hidden", "false");
  fireEvent.click(screen.getByRole("button", { name: "Дараагийн зураг" }));
  expect(learning).toHaveAttribute("aria-hidden", "false");
});

test("starts with automatic rotation paused for reduced motion", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  renderBanner();

  expect(screen.getByRole("button", { name: "Зураг автоматаар солих" })).toBeInTheDocument();
});
