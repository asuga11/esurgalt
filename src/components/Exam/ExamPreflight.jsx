import { decode } from "html-entities";
import renderRichText from "../../renderRichText";

export function ExamIssues({ issues, onEdit, userId }) {
  if (!issues.length) return null;
  return (
    <ul className="mb-2 list-disc space-y-2 pl-5 text-sm font-semibold text-amber-800 dark:text-amber-300">
      {issues.map(({ question, index, message }) => (
        <li key={index ?? "no-questions"}>
          {message}{" "}
          {question?._id && question.owner_id === userId && (
            <button type="button" className="min-h-8 font-bold underline" onClick={() => onEdit(question._id)}>
              {index + 1}-р даалгаврыг засах
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ExamStudentPreview({ questions }) {
  if (!Array.isArray(questions) || !questions.length) return <p className="text-sm">Урьдчилан харах даалгавар алга.</p>;
  return (
    <ol className="space-y-3">
      {questions.map((question, index) => {
        if (!question) return null;
        const options = ["Нэг сонголттой", "Олон сонголттой"].includes(question.testType) && Array.isArray(question.answers)
          ? question.answers : [];
        const isWritten = ["Нөхөх", "Задгай даалгавар", "Эсээ"].includes(question.testType);
        return (
          <li key={question._id || index} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-1 text-sm font-bold">{index + 1}-р даалгавар · {question.testType || "Төрөл сонгоогүй"}</p>
            <div className="break-words [&_img]:max-w-full">{renderRichText(decode(question.question || ""))}</div>
            {options.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5">{options.map((answer, optionIndex) => (
              <li key={answer?._id || optionIndex}>{renderRichText(decode(answer?.answer || ""))}</li>
            ))}</ul>}
            {isWritten && <p className="mt-2 rounded-lg border border-slate-200 p-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">Сурагчийн хариулт бичих хэсэг</p>}
          </li>
        );
      })}
    </ol>
  );
}
