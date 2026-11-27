export function numericScore(value) {
  if (value == null || !["string", "number"].includes(typeof value) || String(value).trim() === "") return null;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 ? score : null;
}

export function buildQuestionStats(results) {
  const counts = new Map();
  for (const questions of results) {
    const seen = new Set();
    for (const item of questions) {
      const question = item?.testsan_id;
      const points = numericScore(question?.points);
      const score = numericScore(item?.onoo);
      if (!question?._id || question.testType === "Текст" || !points || score === null || seen.has(question._id)) continue;
      seen.add(question._id);
      const count = counts.get(question._id) || { id: question._id, question: question.question, total: 0, correct: 0 };
      count.total += 1;
      if (score >= points) count.correct += 1;
      counts.set(question._id, count);
    }
  }
  return [...counts.values()].sort((a, b) => a.correct / a.total - b.correct / b.total);
}

export function makeExamCsv(rows) {
  const csvCell = (value) => {
    const text = String(value ?? "");
    const safe = /^\s*[=+\-@]|^[\t\r\n]/u.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return "\uFEFF" + [["Нэр", "Сургууль", "Анги", "Авсан оноо"], ...rows.map((row) => [
    row.member_name, row.member_school, row.member_class, numericScore(row.onooZuvHariu),
  ])].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
