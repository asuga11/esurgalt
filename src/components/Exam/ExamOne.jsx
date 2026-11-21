import { useContext, useEffect, useState } from "react";
import { CalendarDaysIcon, ClockIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import MainContext from "../../Context/MainContext";
import CollectionState from "../General/CollectionState";
import useExamEnrollment from "../Soril/useExamEnrollment";
import Timer from "./Timer";

export default function ExamOne() {
  const { eid } = useParams();
  const { shalgaltOne, getShalgalt, user, sorilType } = useContext(MainContext);
  const { enroll, pendingExam } = useExamEnrollment(true);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const exam = shalgaltOne?.shalgalt?._id === eid ? shalgaltOne.shalgalt : null;

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getShalgalt(eid, controller.signal).then((success) => {
      if (!controller.signal.aborted) setStatus(success ? "ready" : "error");
    });
    return () => controller.abort();
  }, [eid, attempt]);

  const examType = exam?.examType || sorilType?.content?.[0]?.examType || "ЭЕШ-ын сорил";
  const backTo = `/soril/${encodeURIComponent(examType)}`;
  const date = exam?.examDate && moment(exam.examDate);
  const schedule = exam?.isStartTime
    ? (date && date.isValid() ? date.format("YYYY-MM-DD HH:mm") : "Эхлэх цаг тодорхойгүй")
    : "Хэзээ ч өгөх боломжтой";

  return (
    <section className="app-container py-7 sm:py-12" aria-label="Шалгалтад бүртгүүлэх">
      <div className="mx-auto max-w-3xl">
        <Link to={backTo} className="app-button-secondary mb-4">Сорилын жагсаалт</Link>
        {status === "loading" ? (
          <CollectionState state="loading" title="Шалгалтын мэдээллийг ачаалж байна…" />
        ) : status === "error" || !exam ? (
          <CollectionState state="error" title="Шалгалтын мэдээллийг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={() => setAttempt((value) => value + 1)} />
        ) : (
          <article className="app-panel p-5 sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300">
              <DocumentCheckIcon aria-hidden="true" className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight break-words sm:text-3xl">{exam.name}</h1>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <dt className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <CalendarDaysIcon aria-hidden="true" className="size-5" /> Эхлэх цаг
                </dt>
                <dd className="mt-2 font-extrabold">{schedule}</dd>
                {exam.isStartTime && Number(exam.shalgaltHugatsaa) > 0 && (
                  <dd className="mt-1"><Timer exDate={exam.shalgaltHugatsaa} css="font-bold tabular-nums text-orange-800 dark:text-orange-300" /></dd>
                )}
              </div>
              {exam.examTime != null && (
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <dt className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <ClockIcon aria-hidden="true" className="size-5" /> Үргэлжлэх хугацаа
                  </dt>
                  <dd className="mt-2 font-extrabold">{exam.examTime} минут</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {user ? `Оролцогч: ${user.name || "Хэрэглэгч"}` : "Бүртгүүлэхийн тулд нэвтэрнэ үү."}
              </p>
              <button type="button" onClick={() => enroll(exam)} disabled={Boolean(pendingExam)} className="app-button-primary w-full sm:w-auto">
                {pendingExam ? "Бүртгэж байна…" : user ? "Бүртгүүлэх" : "Нэвтрэх"}
              </button>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
