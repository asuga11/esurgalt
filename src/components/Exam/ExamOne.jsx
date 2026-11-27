import { useContext, useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, CalendarDaysIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useParams } from "react-router-dom";
import MainContext from "../../Context/MainContext";
import renderRichText from "../../renderRichText";
import CollectionState from "../General/CollectionState";
import useExamEnrollment from "../Soril/useExamEnrollment";
import { examMinutes, examSchedule, memberExamActions } from "../Soril/examPresentation";
import Timer from "./Timer";

export default function ExamOne() {
  const { eid } = useParams();
  const { state } = useLocation();
  const { shalgaltOne, getShalgalt, getShalgaltMember, user, sorilType } = useContext(MainContext);
  const { enroll, pendingExam } = useExamEnrollment(true);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [membership, setMembership] = useState(null);
  const exam = shalgaltOne?.shalgalt?._id === eid ? shalgaltOne.shalgalt : null;
  const memberId = ["suragch", "Student"].includes(user?.role) ? user.id ?? user._id ?? user.sub : null;

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getShalgalt(eid, controller.signal).then((success) => {
      if (!controller.signal.aborted) setStatus(success ? "ready" : "error");
    });
    return () => controller.abort();
  }, [eid, attempt]);

  useEffect(() => {
    if (!memberId) return;
    const controller = new AbortController();
    getShalgaltMember(memberId, controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      const matches = items.filter((item) => String(item?.shalgalt?._id) === eid);
      const statusOf = (item) => String(item?.info?.examStatus ?? "").trim();
      const current = matches.find((item) => statusOf(item) === "Дууссан") ?? matches[0];
      setMembership({ memberId, examId: eid, status: statusOf(current) });
    }).catch(() => {
      if (!controller.signal.aborted) setMembership({ memberId, examId: eid });
    });
    return () => controller.abort();
  }, [eid, getShalgaltMember, memberId]);

  const examType = exam?.examType || sorilType?.content?.[0]?.examType || "ЭЕШ-ын сорил";
  const backTo = typeof state?.examCatalog === "string" && state.examCatalog.startsWith("/soril/")
    ? state.examCatalog : `/soril/${encodeURIComponent(examType)}`;
  const memberStatus = membership?.memberId === memberId && membership?.examId === eid ? membership.status : null;
  const checkingMembership = Boolean(memberId && (membership?.memberId !== memberId || membership?.examId !== eid));
  const memberAction = Object.hasOwn(memberExamActions, memberStatus) ? memberExamActions[memberStatus] : null;
  const taskCount = shalgaltOne?.listTests?.length ?? exam?.listTests?.length;

  return (
    <section className="app-container py-7 sm:py-12" aria-label="Шалгалтад бүртгүүлэх">
      <div className="mx-auto max-w-6xl">
        <Link to={backTo} className="app-button-secondary mb-4 gap-2"><ArrowLeftIcon aria-hidden="true" className="size-4" /> Сорилын жагсаалт</Link>
        {status === "loading" ? (
          <CollectionState state="loading" title="Шалгалтын мэдээллийг ачаалж байна…" />
        ) : status === "error" || !exam ? (
          <CollectionState state="error" title="Шалгалтын мэдээллийг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={() => setAttempt((value) => value + 1)} />
        ) : (
          <>
            <header className="app-banner mb-5 px-5 py-6 sm:px-8 sm:py-8">
              <p className="mb-2 text-sm font-bold text-orange-200">{examType}</p>
              <h1 className="text-2xl font-extrabold break-words sm:text-4xl">{exam.name || "Сорил"}</h1>
              {exam.lessonName && <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-orange-100"><BookOpenIcon aria-hidden="true" className="size-5" />{exam.lessonName}</p>}
            </header>
            <div className="grid min-w-0 items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] sm:gap-5">
              <article className="app-panel min-w-0 p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-extrabold">Сорилын мэдээлэл</h2>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <ExamFact icon={CalendarDaysIcon} label="Эхлэх цаг" value={examSchedule(exam)}>
                    {exam.isStartTime && Number(exam.shalgaltHugatsaa) > 0 && <Timer exDate={exam.shalgaltHugatsaa} css="mt-1 text-sm font-bold tabular-nums text-orange-800 dark:text-orange-300" />}
                  </ExamFact>
                  {examMinutes(exam) && <ExamFact icon={ClockIcon} label="Үргэлжлэх хугацаа" value={examMinutes(exam)} />}
                  {Number(taskCount) > 0 && <ExamFact icon={DocumentTextIcon} label="Даалгаврын тоо" value={taskCount} />}
                </dl>
                {typeof exam.introduction === "string" && exam.introduction.trim() && (
                  <section className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <h3 className="mb-2 font-extrabold">Заавар</h3>
                    <div className="prose prose-slate max-w-none break-words whitespace-pre-line dark:prose-invert">{renderRichText(exam.introduction)}</div>
                  </section>
                )}
              </article>
              <aside className="app-panel p-5">
                <h2 className="text-lg font-extrabold">{memberAction ? "Миний сорил" : "Сорилын бүртгэл"}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {user ? `Оролцогч: ${user.name || "Хэрэглэгч"}` : "Бүртгүүлэхийн тулд нэвтэрнэ үү."}
                </p>
                {memberStatus && <p className="mt-3 w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-900 dark:bg-orange-950 dark:text-orange-200">{memberStatus}</p>}
                {memberAction ? <Link to={`/control/soril/${encodeURIComponent(eid)}`} className="app-button-primary mt-4 w-full gap-2">
                  {memberAction}<ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link> : <button type="button" onClick={() => enroll(exam)} disabled={Boolean(pendingExam) || checkingMembership} className="app-button-primary mt-4 w-full">
                  {pendingExam ? "Бүртгэж байна…" : checkingMembership ? "Бүртгэл шалгаж байна…" : user ? "Бүртгүүлэх" : "Нэвтрэх"}
                </button>}
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ExamFact({ icon: Icon, label, value, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
      <dt className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"><Icon aria-hidden="true" className="size-5 shrink-0 text-orange-700 dark:text-orange-300" />{label}</dt>
      <dd className="mt-2 font-extrabold">{value}{children}</dd>
    </div>
  );
}
