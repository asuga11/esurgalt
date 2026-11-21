import DOMPurify from "dompurify";
import parse from "html-react-parser";

export function sanitizeRichText(html) {
  return typeof html === "string" ? DOMPurify.sanitize(html) : "";
}

export default function renderRichText(html) {
  return parse(sanitizeRichText(html));
}
