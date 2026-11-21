import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import renderRichText from "./renderRichText";

test("preserves formatted course content and removes embedded frames", () => {
  const { container } = render(<div>{renderRichText('<p>Тайлбар <strong>жишээ</strong></p><iframe title="Frame"></iframe>')}</div>);
  expect(screen.getByText("жишээ").tagName).toBe("STRONG");
  expect(container.querySelector("iframe")).toBeNull();
});
