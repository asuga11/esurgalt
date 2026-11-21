import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "./Loader";

test("renders the loading message", () => {
  render(<Loader />);

  expect(screen.getByText("Боловсруулж байна")).toBeInTheDocument();
  expect(screen.getByText("Түр хүлээнэ үү ...")).toBeInTheDocument();
});
