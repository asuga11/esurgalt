import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import TimerMember from "./TimerMember";

afterEach(() => vi.useRealTimers());

test("uses elapsed time after a backgrounded tab and expires once", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  const onExpire = vi.fn();
  render(<TimerMember exDate={62000} onExpire={onExpire} />);
  expect(screen.getByText("00:01:02")).toBeInTheDocument();

  act(() => {
    vi.setSystemTime(new Date("2025-01-01T00:01:04Z"));
    document.dispatchEvent(new Event("visibilitychange"));
    document.dispatchEvent(new Event("visibilitychange"));
  });

  expect(screen.getByText("00:00:00")).toBeInTheDocument();
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test("does not submit when the duration is missing", () => {
  const onExpire = vi.fn();
  render(<TimerMember exDate={null} onExpire={onExpire} />);
  expect(screen.getByText("Хугацаа тодорхойгүй")).toBeInTheDocument();
  expect(onExpire).not.toHaveBeenCalled();
});
