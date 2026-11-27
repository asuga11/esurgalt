import { useContext, useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MainContext from "../../Context/MainContext";
import { hasSavedAnswer } from "./examAnswers";
import ExamReport from "./ExamReport";

const statuses = {
  "Хуваарилсан": "Эхлээгүй",
  "Ажиллаж байна": "Өгч байгаа",
  "Дууссан": "Дуусгасан",
};
const formatTime = new Intl.DateTimeFormat("mn-MN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const normalize = (value) => String(value ?? "").normalize("NFKC").toLocaleLowerCase("mn");

function MemberAnswers({ examId, memberId, refreshedAt }) {
  const { fetchExamAttempt } = useContext(MainContext);
  const [count, setCount] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetchExamAttempt(examId, memberId, controller.signal).then((attempt) => {
      if (!Array.isArray(attempt.shalgaltdun)) throw new Error("Missing answer progress");
      if (!controller.signal.aborted) {
        const questions = attempt.shalgaltdun.filter((question) => question && question.testsan_id?.testType !== "Текст");
        setCount(`${questions.filter(hasSavedAnswer).length} / ${questions.length}`);
        setError(false);
      }
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [examId, memberId, refreshedAt, fetchExamAttempt]);
  return <p role="status" className="mt-1 text-sm">{error
    ? count ? `${count} хариулт хадгалагдсан (сүүлд авсан)` : "Хариултын явцыг ачаалж чадсангүй."
    : count ? `${count} хариулт хадгалагдсан` : "Хариултыг тоолж байна…"}</p>;
}

export default function ExamProgress({ exam, onClose }) {
  const { fetchExamDetails } = useContext(MainContext);
  const [members, setMembers] = useState(null);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function load() {
      setLoading(true);
      try {
        const { shalgalt } = await fetchExamDetails(exam._id, controller.signal);
        if (!Array.isArray(shalgalt.listMembers)) throw new Error("Missing participant list");
        if (!controller.signal.aborted) {
          setMembers(shalgalt.listMembers.filter(Boolean));
          setRefreshedAt(new Date());
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          timer = window.setTimeout(load, 15_000);
        }
      }
    }
    load();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [exam._id, fetchExamDetails, refresh]);

  const totals = { "Эхлээгүй": 0, "Өгч байгаа": 0, "Дуусгасан": 0, "Төлөв тодорхойгүй": 0 };
  const rows = (members || []).map((member) => {
    const rawStatus = member.examStatus ?? member.info?.examStatus;
    const status = Object.hasOwn(statuses, rawStatus) ? statuses[rawStatus] : "Төлөв тодорхойгүй";
    totals[status] += 1;
    return { member, status };
  });
  const searchTerms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const visible = rows.filter(({ member, status }) => (!filter || status === filter) &&
    searchTerms.every((term) => [member.member_name, member.member_school, member.member_class].some((value) => normalize(value).includes(term))));

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/55" />
      <div className="fixed inset-0 overflow-auto p-4 sm:p-6">
        <DialogPanel className="app-panel mx-auto my-4 w-full max-w-3xl space-y-5 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-xl font-extrabold">Сорилын явц</DialogTitle>
              <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{exam.name}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Хаах" className="app-icon-button"><XMarkIcon className="size-5" /></button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="app-button-secondary" disabled={loading} onClick={() => setRefresh((value) => value + 1)}>Шинэчлэх</button>
            <button type="button" className="app-button-secondary" aria-expanded={showReport} onClick={() => setShowReport((value) => !value)}>Дүнгийн тайлан</button>
            {refreshedAt && <p className="text-sm text-slate-600 dark:text-slate-300">Сүүлд шинэчилсэн <time dateTime={refreshedAt.toISOString()}>{formatTime.format(refreshedAt)}</time></p>}
            {loading && !members && <p role="status">Оролцогчдын явцыг ачаалж байна…</p>}
            {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{members ? "Шинэчилж чадсангүй. Сүүлд авсан мэдээллийг харуулж байна." : "Сорилын явцыг ачаалж чадсангүй."}</p>}
          </div>
          {showReport && <ExamReport exam={exam} />}
          {members && (
            <>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[["Нийт бүртгүүлсэн", rows.length], ...Object.entries(totals).filter(([status, count]) => status !== "Төлөв тодорхойгүй" || count > 0)].map(([label, count]) => (
                  <div key={label} className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                    <dt className="text-sm font-semibold">{label}</dt>
                    <dd className="text-2xl font-extrabold tabular-nums">{count}</dd>
                  </div>
                ))}
              </dl>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-bold">
                  Нэр, сургууль, ангиар хайх
                  <input type="search" className="app-field mt-1" value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                <label className="block text-sm font-bold">
                  Төлөвөөр шүүх
                  <select className="app-field mt-1" value={filter} onChange={(event) => setFilter(event.target.value)}>
                    <option value="">Бүгд</option>
                    {Object.keys(totals).map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              </div>
              {visible.length ? (
                <div role="region" aria-label="Оролцогчдын явц" tabIndex={0} className="app-table-scroll max-h-[45dvh]">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                      <tr>{["Нэр", "Сургууль, анги", "Төлөв"].map((heading) => <th key={heading} scope="col" className="p-3">{heading}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {visible.map(({ member, status }, index) => (
                        <tr key={member.member_id || member._id || index}>
                          <th scope="row" className="p-3 font-semibold">{member.member_name || "Нэр байхгүй"}</th>
                          <td className="p-3">{[member.member_school, member.member_class].filter(Boolean).join(" · ") || "—"}</td>
                          <td className="p-3">
                            {status}
                            {member.member_id && (status === "Өгч байгаа" || status === "Дуусгасан") && (
                              <>
                                <button type="button" className="ml-2 font-bold text-brand-700 underline dark:text-sky-300"
                                  aria-label={`${member.member_name || "Оролцогч"} хадгалсан хариултын тоо`}
                                  aria-expanded={selectedMember === member.member_id}
                                  onClick={() => setSelectedMember((current) => current === member.member_id ? null : member.member_id)}>
                                  Хариултын тоо
                                </button>
                                {selectedMember === member.member_id && <MemberAnswers examId={exam._id} memberId={member.member_id} refreshedAt={refreshedAt} />}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>{rows.length ? "Хайлт, шүүлтүүрт тохирох оролцогч алга." : "Одоогоор бүртгүүлсэн оролцогч алга."}</p>}
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
