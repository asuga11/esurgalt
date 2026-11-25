import { useContext, useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useParams, useSearchParams } from "react-router-dom";
import MainContext from "../../Context/MainContext";
import CollectionState from "../General/CollectionState";
import ExamCard from "./ExamCard";
import useExamEnrollment from "./useExamEnrollment";

function ResultsDialog({ exam, onClose }) {
  const { getOpenDun, openDunState, getExamMemberResult, dunMember, user } = useContext(MainContext);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getOpenDun(exam._id, controller.signal).then((success) => {
      if (!controller.signal.aborted) setStatus(success ? "ready" : "error");
    });
    if (user?.id) getExamMemberResult(exam._id, user.id, controller.signal);
    return () => controller.abort();
  }, [attempt, exam._id, getExamMemberResult, getOpenDun, user?.id]);

  const personal = user && dunMember.success ? dunMember.shalgaltdun : null;
  const results = openDunState.shalgaltduns || [];

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm" />
      <div className="fixed inset-0 grid place-items-center overflow-auto p-4">
        <DialogPanel className="app-panel w-full max-w-lg p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-xl font-extrabold">Үр дүнгийн мэдээлэл</DialogTitle>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{exam.name}</p>
            </div>
            <button type="button" aria-label="Хаах" onClick={onClose} className="app-icon-button">
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          {personal && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-orange-50 p-3 text-sm dark:bg-orange-950/45">
              <div className="min-w-0"><p className="font-extrabold">{personal.member_name}</p><p>{personal.member_school}</p></div>
              <p className="shrink-0 font-extrabold text-orange-800 dark:text-orange-300">{personal.onooZuvHariu} оноо</p>
            </div>
          )}
          <div className="mt-5">
            {status === "loading" ? (
              <CollectionState state="loading" title="Үр дүнг ачаалж байна…" />
            ) : status === "error" ? (
              <CollectionState state="error" title="Үр дүнг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={() => setAttempt((value) => value + 1)} />
            ) : results.length ? (
              <>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-extrabold">Оролцогчид</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{openDunState.oroltsogchToo ?? results.length}</p>
                </div>
                <ul className="max-h-[42dvh] divide-y divide-slate-200 overflow-auto dark:divide-slate-700">
                  {results.map((item, index) => (
                    <li key={item._id?._id ?? index} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-bold">{item._id?.member_name}</p>
                        <p className="text-slate-600 dark:text-slate-300">{item._id?.member_school}</p>
                      </div>
                      <p className="shrink-0 font-extrabold">{item.onoo} оноо</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <CollectionState state="empty" title="Оролцогчийн үр дүн одоогоор алга" />
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

const collator = new Intl.Collator("mn", { numeric: true });
const normalizeSearch = (text) => text.normalize("NFKC").toLocaleLowerCase("mn").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const sortByName = (a, b) => collator.compare(a.name || "", b.name || "");
const sortByNewest = (a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
const duration = (exam) => Number(exam.examTime) > 0 ? Number(exam.examTime) : Infinity;
const sortByDuration = (a, b) => duration(a) - duration(b) || sortByName(a, b);
const sorters = { newest: sortByNewest, name: sortByName, duration: sortByDuration };

export default function SorilList() {
  const { getPublicExams } = useContext(MainContext);
  const { stype } = useParams();
  const { enroll, pendingExam } = useExamEnrollment();
  const [params, setParams] = useSearchParams();
  const [request, setRequest] = useState({ status: "loading", exams: [] });
  const [attempt, setAttempt] = useState(0);
  const [resultsExam, setResultsExam] = useState(null);

  const query = params.get("q") || "";
  const subject = params.get("subject") || "";
  const requestedSort = params.get("sort");
  const sort = Object.hasOwn(sorters, requestedSort) ? requestedSort : "newest";
  const publishedOnly = params.get("results") === "1";
  const hasFilters = Boolean(query || subject || sort !== "newest" || publishedOnly);

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", exams: [] });
    getPublicExams(stype, controller.signal, (exams) => {
      setRequest({ status: "loading", exams });
    }).then((exams) => {
      if (!controller.signal.aborted) setRequest({ status: "ready", exams });
    }).catch(() => {
      if (!controller.signal.aborted) setRequest((current) => ({ ...current, status: "error" }));
    });
    return () => controller.abort();
  }, [stype, getPublicExams, attempt]);

  const subjects = [...new Set(request.exams.map((exam) => exam.lessonName?.trim()).filter(Boolean))].sort(collator.compare);
  const words = normalizeSearch(query).split(" ").filter(Boolean);
  const visibleExams = request.exams.filter((exam) => {
    if (subject && exam.lessonName?.trim() !== subject) return false;
    if (publishedOnly && !exam.isOpenAnswer) return false;
    if (!words.length) return true;
    const searchable = normalizeSearch(`${exam.name || ""} ${exam.lessonName || ""}`);
    return words.every((word) => searchable.includes(word));
  }).sort(sorters[sort]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const clearFilters = () => {
    const next = new URLSearchParams(params);
    for (const key of ["q", "subject", "sort", "results"]) next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <section className="app-container py-7 sm:py-12" aria-labelledby="exam-catalog">
      <h1 id="exam-catalog" className="text-3xl font-extrabold tracking-tight sm:text-4xl">{stype}</h1>
      <div className="app-panel mt-5 space-y-4 p-4 sm:mt-6 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <label htmlFor="exam-search" className="mb-2 block text-sm font-bold">Сорил хайх</label>
            <div className="relative">
              <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input id="exam-search" type="search" value={query} onChange={(event) => update("q", event.target.value)} className="app-field pl-11" placeholder="Сорилын нэр, хичээл, он" />
            </div>
          </div>
          <div>
            <label htmlFor="exam-subject" className="mb-2 block text-sm font-bold">Хичээл</label>
            <select id="exam-subject" className="app-field" value={subject} onChange={(event) => update("subject", event.target.value)}>
              <option value="">Бүх хичээл</option>
              {subject && !subjects.includes(subject) && <option value={subject}>{subject}</option>}
              {subjects.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="exam-sort" className="mb-2 block text-sm font-bold">Эрэмбэлэх</label>
            <select id="exam-sort" className="app-field" value={sort} onChange={(event) => update("sort", event.target.value === "newest" ? "" : event.target.value)}>
              <option value="newest">Шинэ нь эхэнд</option>
              <option value="name">Нэрээр</option>
              <option value="duration">Хугацаа багаас</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-200 pt-2 dark:border-slate-700">
          <label className="flex min-h-11 w-fit items-center gap-2.5 text-sm font-bold">
            <input type="checkbox" checked={publishedOnly} onChange={(event) => update("results", event.target.checked ? "1" : "")} className="size-4 rounded border-slate-400 text-orange-700 focus:ring-orange-600 dark:border-slate-500" />
            Үр дүн гарсан сорил
          </label>
          {hasFilters && (
            <button type="button" className="min-h-11 rounded-lg px-2 text-sm font-bold text-orange-800 hover:underline dark:text-orange-300" onClick={clearFilters}>Шүүлтүүр арилгах</button>
          )}
        </div>
      </div>

      <div className="mt-5" aria-busy={request.status === "loading"}>
        {request.status === "error" && (
          <CollectionState state="error" title="Сорилыг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={() => setAttempt((value) => value + 1)} />
        )}
        {request.status === "loading" && !request.exams.length ? (
          <CollectionState state="loading" title="Сорилуудыг ачаалж байна…" />
        ) : (request.status === "ready" || request.exams.length > 0) && (
          <>
            <p role="status" className="mb-4 text-sm font-bold text-slate-600 dark:text-slate-300">
              {request.status === "loading" ? "Үлдсэн сорилуудыг ачаалж байна…" : request.status === "error" ? "Жагсаалт бүрэн ачаалагдаагүй" : visibleExams.length === request.exams.length ? `Нийт ${request.exams.length} сорил` : `${request.exams.length} сорилоос ${visibleExams.length} таарлаа`}
            </p>
            {visibleExams.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {visibleExams.map((exam) => <ExamCard key={exam._id} exam={exam} enroll={enroll} pendingExam={pendingExam} onResults={setResultsExam} headingLevel="h2" />)}
              </div>
            ) : request.status === "ready" && (
              <CollectionState state="empty" title="Сорил олдсонгүй" detail={hasFilters ? "Өөр нэрээр хайх эсвэл шүүлтүүрээ өөрчлөөрэй." : undefined} />
            )}
          </>
        )}
      </div>
      {resultsExam && <ResultsDialog key={resultsExam._id} exam={resultsExam} onClose={() => setResultsExam(null)} />}
    </section>
  );
}
