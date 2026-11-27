import { useState } from "react";
import { decode } from "html-entities";
import renderRichText from "../../../renderRichText";
import { hasSavedAnswer } from "../../Exam/examAnswers";
import { numericScore } from "../../Exam/examReportData";

const statuses = {
  full: ["Бүтэн оноо", "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"],
  partial: ["Хэсэгчилсэн оноо", "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"],
  zero: ["Оноо аваагүй", "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200"],
  scored: ["Оноо бүртгэгдсэн", "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"],
  empty: ["Хариулаагүй", "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"],
  pending: ["Оноо гараагүй", "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"],
};

const format = new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 2 });
const scoreLabel = (score) => score === null ? "—" : format.format(score);
const rich = (value) => typeof value === "string" ? renderRichText(decode(value)) : null;

function readQuestion(item, index) {
  const template = item.testsan_id || {};
  const submitted = Array.isArray(item.studAnswers) ? item.studAnswers.filter(Boolean) : [];
  const options = Array.isArray(template.answers) ? template.answers.filter(Boolean) : [];
  const earned = numericScore(item.onoo);
  const possible = numericScore(template.points);
  const info = template.testType === "Текст";
  const answered = hasSavedAnswer({ ...item, studAnswers: submitted });
  let status = null;
  if (!info) {
    if (earned > 0) status = possible > 0 ? (earned >= possible ? "full" : "partial") : "scored";
    else if (!answered) status = "empty";
    else status = earned === 0 ? "zero" : "pending";
  }
  return { id: item._id ?? index, index, template, submitted, options, earned, possible, answered, status };
}

function AnswerDetails({ question }) {
  const { options, submitted, template, answered } = question;
  const choice = ["Нэг сонголттой", "Олон сонголттой"].includes(template.testType);
  const keyed = template.testType === "Задгай даалгавар";
  const selected = new Set(submitted.map((answer) => String(answer._id ?? "")).filter(Boolean));
  const written = submitted.filter(({ value }) => String(value ?? "").trim());
  const correct = options.filter((option) => option.correct === true);

  if (choice && options.length) return (
    <ul className="mt-4 grid gap-2" aria-label="Хариултын сонголтууд">
      {options.map((option, index) => {
        const chosen = selected.has(String(option._id ?? ""));
        return (
          <li key={option._id ?? index} className={`rounded-xl border p-3 ${option.correct === true
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60"
            : chosen ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40" : "border-slate-200 dark:border-slate-800"}`}>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-extrabold">
              <span>Сонголт {index + 1}</span>
              {chosen && <span>Таны сонголт</span>}
              {option.correct === true && <span className="text-emerald-800 dark:text-emerald-200">Зөв хариулт</span>}
            </div>
            <div className="prose prose-slate mt-1 max-w-none break-words dark:prose-invert">{rich(option.answer)}</div>
          </li>
        );
      })}
      {!answered && <li className="text-sm text-slate-600 dark:text-slate-300">Та сонголт хийгээгүй.</li>}
      {answered && !options.some((option) => selected.has(String(option._id ?? ""))) && (
        <li className="text-sm text-slate-600 dark:text-slate-300">Хадгалсан сонголтын мэдээлэл олдсонгүй.</li>
      )}
    </ul>
  );

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
        <h4 className="mb-2 text-sm font-extrabold">Таны хариулт</h4>
        {written.length ? <ul className="grid gap-3">{written.map((answer, index) => {
          const label = keyed ? answer.answer : null;
          return <li key={answer._id ?? index}>
            {label && <div className="mb-1 text-xs font-bold text-slate-600 dark:text-slate-300">{rich(label)}</div>}
            <p className="text-sm break-words whitespace-pre-wrap">{String(answer.value)}</p>
          </li>;
        })}</ul> : <p className="text-sm text-slate-600 dark:text-slate-300">{answered ? "Хадгалсан хариултын мэдээлэл олдсонгүй." : "Хариулаагүй."}</p>}
      </section>
      {correct.length > 0 && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/60">
        <h4 className="mb-2 text-sm font-extrabold text-emerald-900 dark:text-emerald-200">Зөв хариулт</h4>
        <ul className="grid gap-2">{correct.map((answer, index) => (
          <li key={answer._id ?? index} className="text-sm break-words">
            {rich(answer.answer)}
            {keyed && String(answer.value ?? "").trim() && <p className="whitespace-pre-wrap">{String(answer.value)}</p>}
          </li>
        ))}</ul>
      </section>}
    </div>
  );
}

export default function ExamResultDetails({ result, examName, showAnswers }) {
  const [filter, setFilter] = useState("all");
  const total = numericScore(result?.onooNiitTest);
  const earned = numericScore(result?.onooZuvHariu);
  const percent = numericScore(result?.unelgee?.dun) ?? (total > 0 && earned !== null ? earned / total * 100 : null);
  const summary = [["Авсан оноо", earned], ["Нийт оноо", total], ["Зөв хариулсан", numericScore(result?.tooZuvHariu)], ["Нийт даалгавар", numericScore(result?.niitTest)]];
  const questions = showAnswers && Array.isArray(result?.contentQuiz) ? result.contentQuiz.filter(Boolean).map(readQuestion) : [];
  const visible = questions.filter(({ status }) => filter === "all" || status === filter);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 select-text">
      <section className="app-banner p-5 sm:p-7" aria-label="Нийт гүйцэтгэл">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {examName && <p className="mb-1 text-sm font-bold text-orange-200">{examName}</p>}
            <h1 className="text-2xl font-extrabold sm:text-3xl">Таны гүйцэтгэл</h1>
          </div>
          <p className="text-3xl font-extrabold tabular-nums sm:text-4xl">{percent === null ? "—" : `${scoreLabel(percent)}%`}</p>
        </div>
        {percent !== null && <progress aria-label="Нийт гүйцэтгэлийн хувь" className="mt-4 block h-2 w-full accent-orange-400" max={100} value={Math.min(percent, 100)} />}
      </section>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map(([label, value]) => <div key={label} className="app-panel p-3 sm:p-4">
          <dt className="text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">{label}</dt>
          <dd className="mt-1 text-xl font-extrabold tabular-nums">{scoreLabel(value)}</dd>
        </div>)}
      </dl>
      {!showAnswers ? <p className="app-panel p-4 text-sm text-slate-600 dark:text-slate-300">Даалгаврын хариултууд нийтлэгдээгүй байна.</p> : (
        <section aria-labelledby="exam-result-questions" className="grid gap-3">
          <h2 id="exam-result-questions" className="text-xl font-extrabold">Даалгавар бүрийн дүн</h2>
          {questions.length > 0 && <div role="group" aria-label="Даалгавар шүүх" className="app-panel flex flex-wrap gap-2 p-2">
            {["all", ...Object.keys(statuses)].map((key) => {
              const count = key === "all" ? questions.length : questions.filter(({ status }) => status === key).length;
              return count > 0 && <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}
                className="app-filter-chip">
                {key === "all" ? "Бүгд" : statuses[key][0]} ({count})
              </button>;
            })}
          </div>}
          {questions.length ? <ol className="grid gap-3">
            {visible.map((question) => <li key={`${question.id}:${question.index}`} className="app-panel min-w-0 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="font-extrabold">Даалгавар {question.index + 1}</h3>
                  {question.template.testType && <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{question.template.testType}</p>}</div>
                {question.status && <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                  <span className={`rounded-full px-2.5 py-1 ${statuses[question.status][1]}`}>{statuses[question.status][0]}</span>
                  <span className="tabular-nums">{scoreLabel(question.earned)} / {scoreLabel(question.possible)} оноо</span>
                </div>}
              </div>
              <div className="prose prose-slate max-w-none break-words [&_img]:max-w-full dark:prose-invert">
                {question.template.question ? rich(question.template.question) : "Даалгаврын агуулга олдсонгүй."}
              </div>
              {question.status && <AnswerDetails question={question} />}
            </li>)}
          </ol> : <p className="app-panel p-4 text-sm text-slate-600 dark:text-slate-300">Даалгаврын дэлгэрэнгүй мэдээлэл ирээгүй байна.</p>}
        </section>
      )}
    </div>
  );
}
