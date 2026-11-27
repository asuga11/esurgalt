import { useEffect, useRef, useState } from "react";
import {
  ArrowsPointingInIcon, ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckCircleIcon, DocumentTextIcon, LockClosedIcon, PlayCircleIcon, VideoCameraIcon,
} from "@heroicons/react/24/outline";
import ReactPlayer from "react-player";
import { courseVideoUrl } from "./courseVideoUrl";
import { coursePlayerConfig } from "./coursePlayerConfig";
import LessonDetails from "./LessonDetails";

function VideoStage({ src, title }) {
  const stage = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!expanded) return;

    const element = stage.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let entered = document.fullscreenElement === element;
    const sync = () => {
      if (document.fullscreenElement === element) entered = true;
      else if (entered) setExpanded(false);
    };
    const onEscape = (event) => {
      if (event.key !== "Escape" || document.fullscreenElement) return;
      event.preventDefault();
      event.stopPropagation();
      setExpanded(false);
    };

    document.addEventListener("fullscreenchange", sync);
    window.addEventListener("keydown", onEscape, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("fullscreenchange", sync);
      window.removeEventListener("keydown", onEscape, true);
      if (document.fullscreenElement === element) document.exitFullscreen()?.catch(() => {});
    };
  }, [expanded]);

  const toggleFullscreen = () => {
    if (expanded) setExpanded(false);
    else {
      setExpanded(true);
      stage.current?.requestFullscreen?.()?.catch(() => {});
    }
  };
  const ExpandIcon = expanded ? ArrowsPointingInIcon : ArrowsPointingOutIcon;
  const expandLabel = expanded ? "Бүтэн дэлгэцээс гарах" : "Бүтэн дэлгэцээр үзэх";

  return (
    <div className="min-w-0">
      <div ref={stage} className={`flex flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${expanded ? "fixed inset-0 z-[80] h-dvh w-full" : "rounded-2xl border border-slate-200 dark:border-slate-800"}`}>
        <div className="flex min-h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:px-4">
          <h2 className="min-w-0 py-2 text-sm font-extrabold break-words sm:text-base">{title}</h2>
          {src && (
            <button type="button" onClick={toggleFullscreen} title={expandLabel} aria-label={expandLabel}
              className="my-1 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-2 text-sm font-bold text-orange-900 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900">
              <ExpandIcon aria-hidden="true" className="size-5" />
              <span className="hidden sm:inline">{expandLabel}</span>
            </button>
          )}
        </div>
        <div className={`relative grid min-h-0 place-items-center [container-type:size] ${expanded ? "flex-1" : "aspect-video max-h-[76dvh] w-full"}`}>
          {src && !error ? (
            <ReactPlayer key={retry} src={src} controls playsInline width="100%" height="100%" config={coursePlayerConfig}
              className="absolute inset-0 m-auto [&:not(video)]:max-h-[56.25cqw] [&:not(video)]:max-w-[177.778cqh]"
              style={{ objectFit: "contain" }}
              fallback={<p role="status" className="p-4 text-sm text-slate-600 dark:text-slate-300">Видео ачаалж байна…</p>}
              onError={() => setError(true)} />
          ) : (
            <div className="max-w-md p-4 text-center">
              <VideoCameraIcon aria-hidden="true" className="mx-auto mb-2 size-7 text-orange-700 dark:text-orange-300" />
              <p role={error ? "alert" : undefined} className="text-sm font-bold">
                {error ? "Видеог тоглуулж чадсангүй." : "Үзэх боломжтой видео алга."}
              </p>
              {error && <div className="mt-2 flex flex-wrap justify-center gap-x-4">
                <button type="button" className="min-h-11 text-sm font-bold underline" onClick={() => { setError(false); setRetry((count) => count + 1); }}>Дахин ачаалах</button>
                <a className="inline-flex min-h-11 items-center text-sm font-bold underline" href={src} target="_blank" rel="noopener noreferrer">Холбоосоор нээх</a>
              </div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const emptyProgress = { last: null, done: [], notes: {} };

function readProgress(key) {
  if (!key) return emptyProgress;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return { last: saved?.last ?? null, done: Array.isArray(saved?.done) ? saved.done : [], notes: saved?.notes ?? {} };
  } catch {
    return emptyProgress;
  }
}

export default function CourseLessonViewer({ course, preferLesson = false, requestedLesson, initialLesson, onLessonChange, progressKey }) {
  const courseLessons = Array.isArray(course.lessons) ? course.lessons : [];
  const lessons = courseLessons.filter((lesson) => lesson && (!progressKey || lesson.isActive !== false)).sort((a, b) => Number(a.number) - Number(b.number)).map((lesson, index) => ({
    key: String(lesson._id ?? lesson.id ?? `lesson-${index}`),
    title: lesson.lessonName || lesson.name || `Хичээл ${index + 1}`,
    duration: lesson.lessonTime,
    locked: lesson.locked === true,
    src: lesson.locked === true ? null : courseVideoUrl(lesson.url, lesson.lessonType),
    description: lesson.locked === true ? null : lesson.introduction || lesson.description,
    materials: lesson.locked === true ? [] : lesson.materials,
  }));
  const preview = courseVideoUrl(course.video, true);
  const playable = lessons.filter((lesson) => lesson.src ||
    (progressKey && !lesson.locked && (lesson.description || lesson.materials?.length)));
  const [progress, setProgress] = useState(() => readProgress(progressKey));
  const available = (key) => playable.find((lesson) => lesson.key === key);
  const [selection, setSelection] = useState(() => available(requestedLesson)?.key ?? available(progress.last)?.key ?? available(initialLesson)?.key ?? (preferLesson || !preview ? playable[0]?.key : null));
  const [storageError, setStorageError] = useState(false);
  const stageTop = useRef(null);
  const current = available(requestedLesson) ?? available(selection);
  const selectedIndex = playable.indexOf(current);
  const previous = playable[selectedIndex - 1];
  const next = playable[selectedIndex + 1];
  const src = current ? current.src : preview;
  const title = current?.title || (preview ? "Сургалтын танилцуулга" : course.name || "Хичээл");
  const completed = playable.filter((lesson) => progress.done.includes(lesson.key)).length;
  const percent = playable.length ? Math.round(completed / playable.length * 100) : 0;
  const saveProgress = (nextProgress) => {
    if (!progressKey) return false;
    try {
      localStorage.setItem(progressKey, JSON.stringify(nextProgress));
      setProgress(nextProgress);
      setStorageError(false);
      return true;
    } catch {
      setStorageError(true);
      return false;
    }
  };
  const chooseLesson = (key) => {
    setSelection(key);
    onLessonChange?.(key);
    if (progressKey && key != null) saveProgress({ ...progress, last: key });
    const element = stageTop.current;
    if (element && element.getBoundingClientRect().top < 0) element.scrollIntoView({ block: "start" });
  };
  const isDone = current && progress.done.includes(current.key);

  return (
    <div className={`grid min-w-0 items-start gap-4 ${lessons.length ? (progressKey ? "lg:grid-cols-[minmax(0,1fr)_minmax(14rem,28%)]" : "xl:grid-cols-[minmax(0,1fr)_17rem]") : ""}`}>
      {progressKey && <header className="lg:col-span-2">
        <h1 className="mb-2 text-xl font-extrabold break-words sm:text-2xl">{course.name || "Сургалт"}</h1>
        {playable.length > 0 && <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <progress aria-label="Сургалтын ахиц" className="h-2 w-36 accent-orange-600" max={playable.length} value={completed} />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{completed}/{playable.length} · {percent}%</span>
        </div>}
        {storageError && <p role="status" className="mt-2 text-sm text-rose-700 dark:text-rose-300">Энэ хөтөч дээр ахиц, тэмдэглэл хадгалж чадсангүй.</p>}
      </header>}
      <div ref={stageTop} className="min-w-0 scroll-mt-20">
        <VideoStage key={current?.key ?? "preview"} src={src} title={title} />
        {(previous || next || (progressKey && current)) && <div className="mt-3 flex flex-wrap items-center gap-2">
          {previous && <button type="button" className="app-button-secondary gap-2" onClick={() => chooseLesson(previous.key)}>
            <ChevronLeftIcon aria-hidden="true" className="size-4" /> Өмнөх хичээл
          </button>}
          {progressKey && current && <button type="button" aria-pressed={!!isDone} className="app-button-secondary gap-2 text-orange-800 dark:text-orange-300"
            onClick={() => saveProgress({ ...progress, last: current.key, done: isDone ? progress.done.filter((key) => key !== current.key) : [...progress.done, current.key] })}>
            <CheckCircleIcon aria-hidden="true" className="size-5" /> {isDone ? "Үзсэн" : "Үзсэнээр тэмдэглэх"}
          </button>}
          {next && <button type="button" className="app-button-secondary ml-auto gap-2" onClick={() => chooseLesson(next.key)}>
            {current ? "Дараагийн хичээл" : "Эхний хичээл"} <ChevronRightIcon aria-hidden="true" className="size-4" />
          </button>}
        </div>}
      </div>
      {!!lessons.length && <section aria-label="Хичээлийн жагсаалт" className={`app-panel min-w-0 p-3 sm:p-4 ${progressKey ? "lg:col-start-2 lg:row-start-2 lg:row-span-2" : ""}`}>
        <h2 className="px-1 text-base font-extrabold">{progressKey ? "Сургалтын агуулга" : "Хичээлүүд"} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">({lessons.length})</span></h2>
        <ul className="mt-2 grid max-h-[44dvh] gap-1.5 overflow-y-auto lg:max-h-[68dvh]">
          {preview && <li><button type="button" aria-current={!current ? "true" : undefined} onClick={() => chooseLesson(null)} className="app-nav-link w-full text-left aria-[current=true]:bg-orange-100 aria-[current=true]:text-orange-900 dark:aria-[current=true]:bg-orange-950 dark:aria-[current=true]:text-orange-200">
            <PlayCircleIcon aria-hidden="true" className="size-5 shrink-0" /> Танилцуулга
          </button></li>}
          {lessons.map((lesson) => {
            const done = progress.done.includes(lesson.key);
            const available = playable.includes(lesson);
            const Icon = done ? CheckCircleIcon : lesson.src ? PlayCircleIcon : lesson.locked ? LockClosedIcon : DocumentTextIcon;
            return (
              <li key={lesson.key}>
                <button type="button" disabled={!available} aria-current={current === lesson ? "true" : undefined}
                  onClick={() => chooseLesson(lesson.key)} className="app-nav-link w-full text-left aria-[current=true]:bg-orange-100 aria-[current=true]:text-orange-900 disabled:opacity-55 dark:aria-[current=true]:bg-orange-950 dark:aria-[current=true]:text-orange-200">
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  {done && <span className="sr-only">Үзсэн </span>}
                  <span className="min-w-0 break-words">{lesson.title}{lesson.duration != null && lesson.duration !== "" && <span className="block text-xs font-semibold opacity-75">{lesson.duration}</span>}</span>
                  {lesson.locked && <span className="sr-only"> · Үзэх эрх шаардлагатай</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </section>}
      {progressKey && current && <LessonDetails key={current.key} lesson={current}
        note={typeof progress.notes[current.key] === "string" ? progress.notes[current.key] : ""}
        onSaveNote={(note) => saveProgress({ ...progress, last: current.key, notes: { ...progress.notes, [current.key]: note } })} />}
    </div>
  );
}
