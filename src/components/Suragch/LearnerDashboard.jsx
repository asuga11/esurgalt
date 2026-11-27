import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon, ArrowTrendingUpIcon, BookOpenIcon, CheckCircleIcon,
  ClockIcon, PlayCircleIcon,
} from "@heroicons/react/24/outline";
import MainContext from "../../Context/MainContext";
import { uploadBaseUrl } from "../../config";
import { numericScore } from "../Exam/examReportData";

const hovdTime = { timeZone: "Asia/Hovd" };
const dateLabel = new Intl.DateTimeFormat("mn-MN", { ...hovdTime, month: "long", day: "numeric", weekday: "long" });
const examDate = new Intl.DateTimeFormat("mn-MN", { ...hovdTime, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const hourLabel = new Intl.DateTimeFormat("en-GB", { ...hovdTime, hour: "2-digit", hourCycle: "h23" });
const waitingStatuses = new Set(["Хуваарилсан", "Ажиллаж байна"]);
const examUrl = (id) => `/control/soril/${encodeURIComponent(id)}`;
const courseUrl = (id) => `/control/learn/${encodeURIComponent(id)}`;
const initial = { status: "loading", items: [] };

function hasSavedLesson(memberId, courseId) {
  try {
    const key = `esurgalt.learn:${[memberId, courseId].map(encodeURIComponent).join(":")}`;
    return Boolean(JSON.parse(localStorage.getItem(key))?.last);
  } catch {
    return false;
  }
}

function dateValue(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return Date.parse(value) || 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 1e11 && numeric <= 8.64e15 ? numeric : 0;
}

function splitExams(entries) {
  const unique = new Map();
  for (const { shalgalt, info } of entries.filter(Boolean)) {
    const id = shalgalt?._id ?? shalgalt?.id;
    const status = String(info?.examStatus ?? "").trim();
    if (!id || (!waitingStatuses.has(status) && status !== "Дууссан")) continue;
    const item = { id: String(id), name: shalgalt.name || "Сорил", status,
      starts: shalgalt.isStartTime ? dateValue(shalgalt.examDate) : 0,
      timestamp: dateValue(info.endTime) || dateValue(shalgalt.examDate) || dateValue(shalgalt.createdAt),
      score: numericScore(info?.unelgee?.dun),
    };
    const existing = unique.get(item.id);
    if (!existing || (status === "Дууссан" && (existing.status !== "Дууссан" || item.timestamp > existing.timestamp))) unique.set(item.id, item);
  }
  const list = [...unique.values()];
  return {
    waiting: list.filter(({ status }) => waitingStatuses.has(status)).sort((a, b) =>
      Number(b.status === "Ажиллаж байна") - Number(a.status === "Ажиллаж байна") || (a.starts || Infinity) - (b.starts || Infinity)),
    completed: list.filter(({ status }) => status === "Дууссан").sort((a, b) => b.timestamp - a.timestamp),
  };
}

function useOverview(memberId) {
  const { getShalgaltMember, fetchExamMemberResult, getSuragchSurgalt } = useContext(MainContext);
  const [exams, setExams] = useState({ status: "loading", waiting: [], completed: [] });
  const [courses, setCourses] = useState(initial);
  const [results, setResults] = useState(initial);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setExams({ status: "loading", waiting: [], completed: [] });
    setResults(initial);
    setCourses(initial);
    getShalgaltMember(memberId, signal).then(async (entries) => {
      if (signal.aborted) return;
      const info = splitExams(entries);
      setExams({ status: "ready", ...info });
      const recent = await Promise.all(info.completed.slice(0, 5).map(async (item) => {
        if (item.score !== null) return item;
        try {
          const result = await fetchExamMemberResult(item.id, memberId, signal);
          const score = result?.success === false ? null : numericScore(result?.shalgaltdun?.unelgee?.dun);
          return { ...item, score };
        } catch {
          return item;
        }
      }));
      if (!signal.aborted) setResults({ status: "ready", items: recent });
    }).catch(() => {
      if (!signal.aborted) {
        setExams({ status: "error", waiting: [], completed: [] });
        setResults({ status: "error", items: [] });
      }
    });
    getSuragchSurgalt(signal).then((entries) => {
      const available = new Map(entries.filter(({ surgalt, suraltsagch }) => surgalt.isTulbur === false ||
        String(suraltsagch?.status ?? "").trim() === "Худалдаж авсан").map(({ surgalt }) => [surgalt._id, surgalt]));
      if (!signal.aborted) setCourses({ status: "ready", items: [...available.values()] });
    }).catch(() => {
      if (!signal.aborted) setCourses({ status: "error", items: [] });
    });
    return () => controller.abort();
  }, [attempt, memberId, fetchExamMemberResult, getShalgaltMember, getSuragchSurgalt]);

  return { exams, courses, results, reload: () => setAttempt((value) => value + 1) };
}

function Panel({ title, href, action, children, className = "" }) {
  return (
    <section className={`app-panel min-w-0 overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800 sm:px-5">
        <h2 className="text-base font-extrabold sm:text-lg">{title}</h2>
        <Link to={href} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-orange-800 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-950">
          {action}<ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function PanelState({ status = "ready", empty, failure, reload, action }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-3 px-4 py-7 text-center text-sm text-slate-600 dark:text-slate-300">
      <p role={status === "error" ? "alert" : "status"}>{status === "loading" ? "Ачаалж байна…" : status === "error" ? failure : empty}</p>
      {status === "error" ? <button type="button" onClick={reload} className="app-button-secondary">Дахин ачаалах</button> : status === "ready" ? action : null}
    </div>
  );
}

function LearningCourse({ course }) {
  const [imageError, setImageError] = useState(false);
  return (
    <Link to={courseUrl(course._id)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-400">
      <div className="relative grid aspect-[2/1] place-items-center overflow-hidden bg-orange-50 dark:bg-orange-950">
        <BookOpenIcon aria-hidden="true" className="size-9 text-orange-600 dark:text-orange-300" />
        {course.photo && !imageError && <img src={`${uploadBaseUrl}/lms/${encodeURIComponent(course.photo)}`} alt="" loading="lazy"
          onError={() => setImageError(true)} className="absolute inset-0 size-full object-cover" />}
      </div>
      <div className="flex min-h-20 items-center justify-between gap-3 p-3 sm:p-4">
        <div className="min-w-0">
          <h3 className="font-extrabold break-words">{course.name || "Сургалт"}</h3>
          {course.info?.countLesson != null && <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{course.info.countLesson} хичээл</p>}
        </div>
        <ArrowRightIcon aria-hidden="true" className="size-5 shrink-0 text-orange-700 dark:text-orange-300" />
      </div>
    </Link>
  );
}

function Dashboard({ user, memberId }) {
  const { exams, courses, results, reload } = useOverview(memberId);
  const date = new Date();
  const hour = Number(hourLabel.format(date));
  const greeting = hour < 12 ? "Өглөөний мэнд" : hour < 18 ? "Өдрийн мэнд" : "Оройн мэнд";
  const activeExam = exams.waiting.find(({ status }) => status === "Ажиллаж байна");
  const startedCourse = courses.items.find((course) => hasSavedLesson(memberId, course._id));
  const nextCourse = startedCourse ?? courses.items[0];
  const scores = results.items.map(({ score }) => score).filter((score) => score !== null);
  const average = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null;
  const stats = [
    ["Хүлээгдэж буй сорил", exams.status === "ready" ? exams.waiting.length : "—", ClockIcon],
    ["Дууссан сорил", exams.status === "ready" ? exams.completed.length : "—", CheckCircleIcon],
    ["Сүүлийн дүнгийн дундаж", average === null ? "—" : `${average}%`, ArrowTrendingUpIcon],
    ["Үзэх эрхтэй сургалт", courses.status === "ready" ? courses.items.length : "—", BookOpenIcon],
  ];

  return (
    <div className="mx-auto grid max-w-[82rem] gap-5 sm:gap-6">
      <section className="app-banner px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-orange-100">{dateLabel.format(date)} · {user.role === "Student" ? "Оюутан" : "Сурагч"}</p>
            <h2 className="max-w-3xl text-2xl leading-tight font-extrabold break-words sm:text-4xl">{greeting}{user.name ? `, ${user.name}` : ""}!</h2>
          </div>
          <Link to={activeExam ? examUrl(activeExam.id) : nextCourse ? courseUrl(nextCourse._id) : "/control/soril"}
            className="app-button-primary">
            {activeExam ? "Сорилоо үргэлжлүүлэх" : startedCourse ? "Сургалтаа үргэлжлүүлэх" : nextCourse ? "Сургалтаа нээх" : "Миний сорилууд"}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => <div key={label} className="app-panel flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 p-3 sm:p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"><Icon aria-hidden="true" className="size-5" /></span>
          <div className="min-w-0"><dt className="text-xs leading-4 font-bold text-slate-600 dark:text-slate-300 sm:text-sm">{label}</dt>
            <dd className="mt-0.5 text-2xl font-extrabold tabular-nums">{value}</dd></div>
        </div>)}
      </dl>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] sm:gap-5">
        <Panel title="Хүлээгдэж буй сорилууд" href="/control/soril" action="Бүх сорил">
          {exams.waiting.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {exams.waiting.slice(0, 5).map((item) => <li key={item.id}>
              <Link to={examUrl(item.id)} className="flex items-center gap-3 px-4 py-4 hover:bg-orange-50 dark:hover:bg-orange-950/40 sm:px-5">
                <PlayCircleIcon aria-hidden="true" className="size-6 shrink-0 text-orange-700 dark:text-orange-300" />
                <div className="min-w-0 flex-1"><p className="font-bold break-words">{item.name}</p><p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{item.starts ? examDate.format(item.starts) : item.status}</p></div>
                <span className="text-xs font-extrabold text-orange-800 dark:text-orange-300">{item.status === "Ажиллаж байна" ? "Үргэлжлүүлэх" : "Нээх"}</span>
              </Link>
            </li>)}
          </ul> : <PanelState status={exams.status} empty="Хүлээгдэж буй сорил алга." failure="Сорилын жагсаалт ачаалагдсангүй." reload={reload} />}
        </Panel>

        <Panel title="Сүүлийн дүн" href="/control/soril?status=completed" action="Бүх дүн">
          {results.items.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {results.items.map((item) => <li key={item.id}>
              <Link to={examUrl(item.id)} className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-950/40 sm:px-5">
                <div className="min-w-0"><p className="text-sm font-bold break-words">{item.name}</p>
                  {item.score !== null && <progress aria-label={`Гүйцэтгэл · ${item.name}`} max={100} value={Math.min(item.score, 100)} className="mt-2 block h-1.5 w-full accent-orange-700 dark:accent-orange-400" />}</div>
                <span className="text-right text-sm font-extrabold tabular-nums">{item.score === null ? "—" : `${item.score}%`}</span>
              </Link>
            </li>)}
          </ul> : <PanelState status={results.status} empty="Одоогоор дүн гараагүй байна." failure="Дүнгийн мэдээлэл ачаалагдсангүй." reload={reload} />}
        </Panel>
      </div>

      <Panel title="Миний сургалтууд" href="/control/training" action="Бүх сургалт">
        {courses.items.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
          {courses.items.slice(0, 3).map((course) => <LearningCourse key={course._id} course={course} />)}
        </div> : <PanelState status={courses.status} empty="Үзэх эрхтэй сургалт алга." failure="Сургалтын жагсаалт ачаалагдсангүй." reload={reload}
          action={<Link to="/training" className="app-button-secondary">Сургалт хайх</Link>} />}
      </Panel>
    </div>
  );
}

export default function LearnerDashboard() {
  const { user } = useContext(MainContext);
  const memberId = user?.id ?? user?._id ?? user?.sub;
  return memberId ? <Dashboard key={memberId} user={user} memberId={memberId} /> : (
    <PanelState empty="Хэрэглэгчийн мэдээлэл олдсонгүй." />
  );
}
