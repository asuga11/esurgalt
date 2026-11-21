import moment from "moment";
import { Link } from "react-router-dom";
import { CalendarDaysIcon, ClockIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import Timer from "../Exam/Timer";

export default function ExamCard({ exam, enroll, pendingExam, onResults, headingLevel: Heading = "h3" }) {
  const date = exam.examDate && moment(exam.examDate);
  const schedule = exam.isStartTime
    ? (date && date.isValid() ? date.format("YYYY-MM-DD HH:mm") : "Эхлэх цаг тодорхойгүй")
    : "Хэзээ ч өгөх боломжтой";

  return (
    <article className="app-panel flex min-w-0 flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300">
          <DocumentCheckIcon aria-hidden="true" className="size-5" />
        </span>
        {exam.lessonName && <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{exam.lessonName}</p>}
      </div>
      <Heading className="text-lg font-extrabold leading-snug [overflow-wrap:anywhere]">
        <Link to={`/e/${exam._id}`} className="rounded-sm hover:text-orange-800 hover:underline dark:hover:text-orange-300">{exam.name}</Link>
      </Heading>
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <p className="flex items-center gap-2"><CalendarDaysIcon aria-hidden="true" className="size-5 shrink-0" />{schedule}</p>
        {exam.examTime != null && <p className="flex items-center gap-2"><ClockIcon aria-hidden="true" className="size-5 shrink-0" />{exam.examTime} минут</p>}
        {exam.isStartTime && Number(exam.shalgaltHugatsaa) > 0 && (
          <Timer exDate={exam.shalgaltHugatsaa} css="font-bold tabular-nums text-orange-800 dark:text-orange-300" />
        )}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <button type="button" disabled={Boolean(pendingExam)} onClick={() => enroll(exam)} className="app-button-primary flex-1">
          {pendingExam === exam._id ? "Бүртгэж байна…" : "Бүртгүүлэх"}
        </button>
        {onResults && (
          <button type="button" disabled={!exam.isOpenAnswer} onClick={() => onResults(exam)} className="app-button-secondary flex-1">
            Үр дүн
          </button>
        )}
      </div>
    </article>
  );
}
