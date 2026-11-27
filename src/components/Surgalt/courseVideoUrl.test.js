import { expect, test } from "vitest";
import { apiBaseUrl, uploadBaseUrl } from "../../config";
import { courseVideoUrl } from "./courseVideoUrl";

test("routes local API and legacy school-hosted uploads through the local origin", () => {
  expect(new URL(apiBaseUrl, window.location.href).origin).toBe(window.location.origin);
  const expected = new URL(`${uploadBaseUrl}/surgalt/videos/lesson%201.mp4?key=abc`, window.location.href).href;
  for (const input of [
    "lesson 1.mp4?key=abc",
    "surgalt/videos/lesson%201.mp4?key=abc",
    "/upload/surgalt/videos/lesson%201.mp4?key=abc",
    "http://west.edu.mn:3000/upload/surgalt/videos/lesson%201.mp4?key=abc",
    "https://west.edu.mn/upload/surgalt/videos/lesson%201.mp4?key=abc",
    "https://e-surgalt.west.edu.mn/upload/surgalt/videos/lesson%201.mp4?key=abc",
  ]) expect(courseVideoUrl(input, false)).toBe(expected);
});

test("keeps videos hosted outside the school on their original domains", () => {
  for (const url of ["https://www.youtube.com/watch?v=TJnNbOfcBM4", "https://example.test/upload/surgalt/videos/example.mp4"]) {
    expect(courseVideoUrl(url, true)).toBe(url);
  }
});
