import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainContext from "../../Context/MainContext";
import CollectionState from "../General/CollectionState";
import ExamCard from "./ExamCard";
import useExamEnrollment from "./useExamEnrollment";

export default function SorilHome() {
  const { getFeaturedExams, sorilType } = useContext(MainContext);
  const { enroll, pendingExam } = useExamEnrollment();
  const examType = sorilType?.content?.[0]?.examType || "ЭЕШ-ын сорил";
  const examLink = `/soril/${encodeURIComponent(examType)}`;
  const [status, setStatus] = useState("loading");
  const [exams, setExams] = useState([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getFeaturedExams(controller.signal).then(({ data }) => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(data?.shalgalt)) throw new Error("Invalid exam list");
      setExams(data.shalgalt);
      setStatus("ready");
    }).catch(() => {
      if (!controller.signal.aborted) setStatus("error");
    });
    return () => controller.abort();
  }, [attempt, getFeaturedExams]);

  return (
    <section aria-labelledby="active-exams" className="border-t border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="app-container py-9 sm:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
          <h2 id="active-exams" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Идэвхтэй сорилууд</h2>
          <Link to={examLink} className="app-button-secondary">Бүх сорил</Link>
        </div>
        {status === "error" ? (
          <CollectionState state="error" title="Сорилуудыг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={() => setAttempt((value) => value + 1)} />
        ) : status === "loading" ? (
          <CollectionState state="loading" title="Сорилуудыг ачаалж байна…" />
        ) : exams.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {exams.slice(0, 6).map((exam) => <ExamCard key={exam._id} exam={exam} enroll={enroll} pendingExam={pendingExam} />)}
          </div>
        ) : (
          <CollectionState state="empty" title="Одоогоор идэвхтэй сорил алга" detail="Бүх сорил хэсгээс хичээлээр сонгон бэлдээрэй." />
        )}
      </div>
    </section>
  );
}
