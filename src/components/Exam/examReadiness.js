import { decode } from "html-entities";
import { sanitizeRichText } from "../../renderRichText";

export function hasQuestionContent(value) {
  if (typeof value !== "string") return false;
  const content = document.createElement("template");
  content.innerHTML = sanitizeRichText(decode(value));
  return Boolean(content.content.textContent.replace(/[\u200B-\u200D\uFEFF]/g, "").trim()) ||
    [...content.content.querySelectorAll("img[src], video[src], audio[src], video source[src], audio source[src]")]
      .some((media) => media.getAttribute("src").trim());
}

export function getAnswerWarning(type, answer) {
  if (!hasQuestionContent(answer?.answer)) return "Хариултаа оруулна уу.";
  if (type === "Задгай даалгавар" && !String(answer.value ?? "").trim()) return "Хариултын утгыг оруулна уу.";
  return "";
}

export function getQuestionWarning(question) {
  if (!hasQuestionContent(question?.question)) return "Асуултын агуулгыг оруулна уу.";
  const type = question.testType;
  if (!type) return "Асуултын төрлийг сонгоно уу.";
  if (type === "Текст") return "";
  if (type === "Эсээ") {
    return hasQuestionContent(question.guidance) || (Array.isArray(question.answers) && question.answers.some((answer) => hasQuestionContent(answer?.answer)))
      ? "" : "Эсээний үнэлэх заавар эсвэл жишиг хариулт оруулна уу.";
  }
  const answers = Array.isArray(question.answers) ? question.answers : [];
  if (!answers.length) return "Хариулт нэмнэ үү.";
  for (const answer of answers) {
    const warning = getAnswerWarning(type, answer);
    if (warning) return warning;
  }
  if (type === "Нэг сонголттой" || type === "Олон сонголттой") {
    const correctCount = answers.filter(({ correct }) => correct === true).length;
    if (!correctCount) return "Зөв хариултаа тэмдэглэнэ үү.";
    if (type === "Нэг сонголттой" && correctCount !== 1) return "Нэг зөв хариулт тэмдэглэнэ үү.";
  }
  return "";
}

export function getExamIssues(questions) {
  const list = Array.isArray(questions) ? questions : [];
  const issues = [];
  if (!list.some((question) => question && question.testType !== "Текст")) {
    issues.push({ message: "Сорилыг эхлүүлэхийн өмнө дор хаяж нэг хариулах асуулт нэмнэ үү." });
  }
  for (const [index, question] of list.entries()) {
    const warning = getQuestionWarning(question);
    if (warning) issues.push({ question, index, message: `${index + 1}-р даалгавар. ${warning}` });
  }
  return issues;
}
