import { Link, useLocation } from "react-router-dom";
import { ArrowUpRightIcon, CalendarDaysIcon, ClockIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import Timer from "../Exam/Timer";
import { examMinutes, examSchedule } from "./examPresentation";

export default function ExamCard({ exam, enroll, pendingExam, onResults, headingLevel: Heading = "h3" }) {
  const { pathname, search } = useLocation();
  const minutes = examMinutes(exam);

  return (
    <article className="app-panel flex min-w-0 flex-col gap-4 p-4 transition hover:border-orange-300 sm:p-5 dark:hover:border-orange-800">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-900 dark:bg-orange-950/70 dark:text-orange-300">
          <DocumentCheckIcon aria-hidden="true" className="size-5" />
        </span>
        {exam.isOpenAnswer && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Дүн гарсан</span>}
      </div>
      <div>
        {exam.lessonName && <p className="mb-1 text-xs font-bold text-slate-600 dark:text-slate-300">{exam.lessonName}</p>}
        <Heading className="text-lg font-extrabold leading-snug [overflow-wrap:anywhere]">
          <Link to={`/e/${encodeURIComponent(exam._id)}`} state={{ examCatalog: pathname + search }}
            className="inline-flex items-start gap-2 rounded-sm hover:text-orange-800 hover:underline dark:hover:text-orange-300">
            {exam.name || "Сорил"}<ArrowUpRightIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-orange-700 dark:text-orange-300" />
          </Link>
        </Heading>
      </div>
      <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/55 dark:text-slate-300">
        <p className="flex items-start gap-2"><CalendarDaysIcon aria-hidden="true" className="size-5 shrink-0" />{examSchedule(exam)}</p>
        {minutes && <p className="flex items-center gap-2"><ClockIcon aria-hidden="true" className="size-5 shrink-0" />{minutes}</p>}
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
