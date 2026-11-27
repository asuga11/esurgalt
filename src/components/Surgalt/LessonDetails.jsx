import { useState } from "react";
import renderRichText from "../../renderRichText";
import { courseVideoUrl } from "./courseVideoUrl";

const tabs = [["description", "Тайлбар"], ["materials", "Материал"], ["notes", "Миний тэмдэглэл"]];

export default function LessonDetails({ lesson, note, onSaveNote }) {
  const [tab, setTab] = useState("description");
  const [draft, setDraft] = useState(note);
  const [saved, setSaved] = useState(false);
  const materials = (Array.isArray(lesson.materials) ? lesson.materials : []).flatMap((entry, index) => {
    const href = courseVideoUrl(typeof entry === "string" ? entry : entry?.url, true);
    return href ? [{ href, title: entry?.title || entry?.name || `Материал ${index + 1}` }] : [];
  });

  return (
    <div className="app-panel p-4 sm:p-5">
      <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" aria-label="Хичээлийн мэдээлэл">
        {tabs.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={key === tab} onClick={() => setTab(key)}
            className="min-h-10 rounded-lg px-3 text-sm font-extrabold text-slate-600 hover:text-orange-800 aria-pressed:bg-white aria-pressed:text-orange-800 aria-pressed:shadow-sm dark:text-slate-300 dark:aria-pressed:bg-slate-900 dark:aria-pressed:text-orange-300">
            {label}
          </button>
        ))}
      </div>
      {tab === "description" && <div className="prose prose-slate mt-4 max-w-none break-words dark:prose-invert">
        {lesson.description ? renderRichText(lesson.description) : <p>Энэ хичээлд тайлбар нэмээгүй байна.</p>}
      </div>}
      {tab === "materials" && (materials.length ? (
        <ul className="mt-4 grid gap-2">
          {materials.map(({ href, title }, index) => <li key={`${href}:${index}`}><a href={href} target="_blank" rel="noopener noreferrer" className="app-button-secondary justify-start break-all">{title}</a></li>)}
        </ul>
      ) : <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Энэ хичээлд материал хавсаргаагүй байна.</p>)}
      {tab === "notes" && (
        <form className="mt-4" onSubmit={(event) => {
          event.preventDefault();
          setSaved(onSaveNote(draft));
        }}>
          <label htmlFor="lesson-note" className="mb-2 block text-sm font-bold">Хувийн тэмдэглэл</label>
          <textarea id="lesson-note" className="app-field min-h-28 w-full resize-y" value={draft} maxLength={4000}
            onChange={(event) => { setDraft(event.target.value); setSaved(false); }} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span role="status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">{saved ? "Тэмдэглэл хадгалагдлаа." : "Энэ хөтөч дээр хадгална."}</span>
            <button type="submit" disabled={draft === note} className="app-button-primary disabled:opacity-50">Хадгалах</button>
          </div>
        </form>
      )}
    </div>
  );
}
