import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import TimerMember from "./TimerMember";

afterEach(() => {
  vi.useRealTimers();
  sessionStorage.clear();
});

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

test("does not extend the deadline when a later response has stale remaining time", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  const onExpire = vi.fn();
  const { rerender } = render(<TimerMember exDate={60_000} onExpire={onExpire} />);

  act(() => vi.advanceTimersByTime(15_000));
  rerender(<TimerMember exDate={55_000} onExpire={onExpire} />);
  expect(screen.getByText("00:00:45")).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(45_000));
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test("retains the original deadline after reopening the exam in the same tab", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  const onExpire = vi.fn();
  const props = { storageKey: "exam-deadline:123:abc", onExpire };
  const { unmount } = render(<TimerMember {...props} exDate={60_000} />);
  unmount();

  vi.setSystemTime(new Date("2025-01-01T00:00:30Z"));
  render(<TimerMember {...props} exDate={60_000} />);
  expect(screen.getByText("00:00:30")).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(30_000));
  expect(onExpire).toHaveBeenCalledTimes(1);
});
