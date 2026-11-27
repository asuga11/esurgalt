export function hasSavedAnswer(question) {
  const type = question?.testsan_id?.testType;
  return type !== "Текст" && Boolean(question?.studAnswers?.some((answer) =>
    type === "Нэг сонголттой" || type === "Олон сонголттой" || Boolean(String(answer?.value ?? "").trim())
  ));
}
