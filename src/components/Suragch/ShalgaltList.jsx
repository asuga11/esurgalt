import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRightIcon, CalendarDaysIcon, ClipboardDocumentCheckIcon, ClockIcon, MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import MainContext from "../../Context/MainContext";
import CollectionState from "../General/CollectionState";
import { examMinutes, examSchedule, memberExamActions } from "../Soril/examPresentation";

const filters = [
  ["", "Бүгд"],
  ["working", "Үргэлжлүүлэх", "Ажиллаж байна"],
  ["assigned", "Бүртгүүлсэн", "Хуваарилсан"],
  ["completed", "Дууссан", "Дууссан"],
];
const normalize = (value) => String(value ?? "").normalize("NFKC").toLocaleLowerCase("mn").trim();
const memberStatus = (item) => String(item.info?.examStatus ?? "").trim();

export default function ShalgaltList() {
  const navigate = useNavigate();
  const { sid } = useParams();
  const { getShalgaltMember, user, sorilType } = useContext(MainContext);
  const isSchool = user?.role === "surguuli";
  const memberId = isSchool ? sid : user?.id ?? user?._id ?? user?.sub;
  const [list, setList] = useState({ memberId: null, status: "loading", exams: [] });
  const [attempt, setAttempt] = useState(0);
  const [params, setParams] = useSearchParams();
  const filter = filters.find(([key]) => key === params.get("status")) || filters[0];
  const query = params.get("q") || "";
  const listCategory = Array.isArray(sorilType?.content) ? sorilType.content.find((item) => item?.examType)?.examType : null;
  const catalog = `/soril/${encodeURIComponent(listCategory || "ЭЕШ-ын сорил")}`;

  useEffect(() => {
    if (!memberId) return;
    const controller = new AbortController();
    setList({ memberId, status: "loading", exams: [] });
    getShalgaltMember(memberId, controller.signal).then((exams) => {
      if (!controller.signal.aborted) setList({ memberId, status: "ready", exams });
    }).catch(() => {
      if (!controller.signal.aborted) setList({ memberId, status: "error", exams: [] });
    });
    return () => controller.abort();
  }, [attempt, getShalgaltMember, memberId]);

  const status = list.memberId === memberId ? list.status : "loading";
  const exams = list.memberId === memberId ? list.exams.filter((item) => item?.shalgalt?._id) : [];
  const visible = exams.filter((item) => (!filter[2] || memberStatus(item) === filter[2]) &&
    normalize(`${item.shalgalt.name || ""} ${item.shalgalt.lessonName || ""}`).includes(normalize(query)));
  const update = (key, value) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  }, { replace: true });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="app-banner flex flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-7">
        <div>
          <h2 className="text-xl font-extrabold sm:text-2xl">{isSchool ? "Сурагчийн сорилууд" : "Миний сорилууд"}</h2>
          {status === "ready" && <p className="mt-1 text-sm font-semibold text-orange-100">Нийт {exams.length} сорил</p>}
        </div>
        {!isSchool && <Link to={catalog} className="app-button-primary">Сорилын сан</Link>}
      </header>
      {exams.length > 0 && (
        <div className="app-panel grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,20rem)] lg:items-center">
          <div role="group" aria-label="Сорилын төлөв" className="flex flex-wrap gap-1.5">
            {filters.map(([key, label, value]) => (
              <button key={key} type="button" aria-pressed={key === filter[0]} onClick={() => update("status", key)}
                className="app-filter-chip">
                {label} <span className="tabular-nums opacity-80">{value ? exams.filter((item) => memberStatus(item) === value).length : exams.length}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input aria-label="Миний сорилоос хайх" type="search" className="app-field w-full pl-10" placeholder="Нэр эсвэл хичээлээр хайх"
              value={query} onChange={(event) => update("q", event.target.value)} />
          </div>
        </div>
      )}
      {!memberId ? <CollectionState state="empty" title="Оролцогчийн мэдээлэл олдсонгүй" /> : status === "loading" ? (
        <CollectionState state="loading" title="Сорилуудыг ачаалж байна…" />
      ) : status === "error" ? (
        <CollectionState state="error" title="Сорилын жагсаалт ачаалагдсангүй" action={() => setAttempt((value) => value + 1)} />
      ) : !visible.length ? (
        <CollectionState state="empty" title={exams.length ? "Шүүлтүүрт тохирох сорил алга" : "Оролцсон сорил алга"}
          actionLabel="Шүүлтүүр арилгах" action={exams.length ? () => setParams({}, { replace: true }) : undefined} />
      ) : (
        <ul className="grid gap-3" aria-label="Оролцсон сорилууд">
          {visible.map((item) => {
            const exam = item.shalgalt;
            const state = memberStatus(item);
            const completed = state === "Дууссан";
            const href = `/control/soril/${encodeURIComponent(exam._id)}${isSchool ? `/${encodeURIComponent(memberId)}` : ""}`;
            const action = Object.hasOwn(memberExamActions, state) ? memberExamActions[state] : "Сорил нээх";
            return (
              <li key={exam._id} className="app-panel flex flex-wrap items-center gap-3 p-4 sm:gap-4 sm:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300">
                  <ClipboardDocumentCheckIcon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <h3 className="font-extrabold break-words">{exam.name || "Сорил"}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1"><CalendarDaysIcon aria-hidden="true" className="size-4" />{examSchedule(exam)}</span>
                    {examMinutes(exam) && <span className="inline-flex items-center gap-1"><ClockIcon aria-hidden="true" className="size-4" />{examMinutes(exam)}</span>}
                  </div>
                </div>
                {state && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{state}</span>}
                {(!isSchool || completed) && <button type="button" aria-label={completed ? "Сорилын үр дүн" : undefined}
                  className="app-button-secondary gap-2" onClick={() => navigate(href)}>{action}<ArrowRightIcon aria-hidden="true" className="size-4" /></button>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
