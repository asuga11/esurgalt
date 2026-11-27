import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import CourseLessonViewer from "./CourseLessonViewer";

vi.mock("react-player", () => ({
  default: ({ src, config }) => <video aria-label="Хичээлийн видео" src={src} data-youtube-origin={config.youtube.origin} />,
}));

const course = {
  name: "Математик",
  video: "https://example.test/preview.mp4",
  lessons: [
    { _id: "third", number: 3, lessonName: "Гуравдугаар хичээл", url: "https://example.test/third.mp4" },
    { _id: "first", number: 1, lessonName: "Нэгдүгээр хичээл", url: "https://example.test/first.mp4" },
    { _id: "locked", number: 2, lessonName: "Түгжээтэй хичээл" },
  ],
};

test("keeps the same video mounted when expanding and closing the fallback fullscreen", () => {
  render(<CourseLessonViewer course={course} />);
  const player = screen.getByLabelText("Хичээлийн видео");
  fireEvent.click(screen.getByRole("button", { name: "Бүтэн дэлгэцээр үзэх" }));
  expect(screen.getByRole("button", { name: "Бүтэн дэлгэцээс гарах" })).toBeInTheDocument();
  expect(screen.getByLabelText("Хичээлийн видео")).toBe(player);

  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.getByRole("button", { name: "Бүтэн дэлгэцээр үзэх" })).toBeInTheDocument();
  expect(screen.getByLabelText("Хичээлийн видео")).toBe(player);
});

test("passes the current website origin to the YouTube player", () => {
  render(<CourseLessonViewer course={{ name: "Хичээл", video: "https://www.youtube.com/watch?v=TJnNbOfcBM4" }} />);
  expect(screen.getByLabelText("Хичээлийн видео")).toHaveAttribute("data-youtube-origin", window.location.origin);
});

test("starts the purchased course on the first available lesson and skips locked lessons", () => {
  render(<CourseLessonViewer course={course} preferLesson />);
  expect(screen.getByRole("button", { name: "Нэгдүгээр хичээл" })).toHaveAttribute("aria-current", "true");
  expect(screen.getByRole("button", { name: "Түгжээтэй хичээл" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Дараагийн хичээл" }));
  expect(screen.getByLabelText("Хичээлийн видео")).toHaveAttribute("src", "https://example.test/third.mp4");
  fireEvent.click(screen.getByRole("button", { name: "Өмнөх хичээл" }));
  expect(screen.getByLabelText("Хичээлийн видео")).toHaveAttribute("src", "https://example.test/first.mp4");
});

test("opens material-only lessons and keeps locked material out of the viewer", () => {
  const resourceCourse = { ...course, lessons: [
    { _id: "notes", lessonName: "Унших материал", materials: [{ url: "/handout.pdf", title: "Хичээлийн файл" }] },
    { _id: "closed", lessonName: "Хаалттай материал", locked: true, materials: [{ url: "/private.pdf", title: "Хаалттай файл" }] },
  ] };
  render(<CourseLessonViewer course={resourceCourse} progressKey="test-course-progress" preferLesson />);
  expect(screen.getByRole("button", { name: "Унших материал" })).toHaveAttribute("aria-current", "true");
  expect(screen.queryByLabelText("Хичээлийн видео")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Хаалттай материал/ })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Материал" }));
  expect(screen.getByRole("link", { name: "Хичээлийн файл" })).toHaveAttribute("href", new URL("/handout.pdf", window.location.href).href);
  expect(screen.queryByRole("link", { name: "Хаалттай файл" })).not.toBeInTheDocument();
});
