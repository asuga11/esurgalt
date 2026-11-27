import { useContext, useEffect, useState } from "react";
import { decode } from "html-entities";
import MainContext from "../../Context/MainContext";
import renderRichText from "../../renderRichText";
import { buildQuestionStats, makeExamCsv, numericScore } from "./examReportData";

const formatter = new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat("mn-MN", { style: "percent", maximumFractionDigits: 1 });

export default function ExamReport({ exam }) {
  const { fetchExamResults, fetchExamMemberResult } = useContext(MainContext);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analysisRequest, setAnalysisRequest] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetchExamResults(exam._id, controller.signal).then(({ shalgaltdun }) => {
      if (!controller.signal.aborted) setRows(shalgaltdun.filter((row) => row && (!row.examStatus || row.examStatus === "Дууссан")));
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [exam._id, fetchExamResults, retry]);

  useEffect(() => {
    if (!analysisRequest) return;
    const controller = new AbortController();
    const { ids } = analysisRequest;
    const results = [];
    let nextIndex = 0;
    let completed = 0;

    async function worker() {
      while (!controller.signal.aborted && nextIndex < ids.length) {
        const id = ids[nextIndex++];
        try {
          const payload = await fetchExamMemberResult(exam._id, id, controller.signal);
          const items = payload?.shalgaltdun?.contentQuiz;
          if (payload?.success !== false && Array.isArray(items) && items.length) results.push(items);
        } catch {
          // Keep results already received when an individual request fails.
        }
        if (!controller.signal.aborted) {
          completed += 1;
          setAnalysis({ completed, total: ids.length });
        }
      }
    }

    Promise.all(Array.from({ length: Math.min(ids.length, 4) }, worker)).then(() => {
      if (!controller.signal.aborted) setAnalysis({ completed, total: ids.length, available: results.length, questions: buildQuestionStats(results) });
      results.length = 0;
    });
    return () => controller.abort();
  }, [analysisRequest, exam._id, fetchExamMemberResult]);

  const classes = [...new Set((rows || []).map((row) => String(row.member_class ?? "")).filter(Boolean))].sort((a, b) => a.localeCompare(b, "mn"));
  const visible = (rows || []).filter((row) => !selectedClass || String(row.member_class) === selectedClass);
  const scores = visible.map((row) => numericScore(row.onooZuvHariu)).filter((score) => score !== null);
  const average = scores.length ? formatter.format(scores.reduce((sum, score) => sum + score, 0) / scores.length) : "—";
  const memberIds = [...new Set(visible.map((row) => row.member_id).filter(Boolean))];

  function download() {
    const url = URL.createObjectURL(new Blob([makeExamCsv(visible)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `exam-${exam._id}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700" aria-label="Дүнгийн тайлан">
      <h3 className="font-extrabold">Дүнгийн тайлан</h3>
      {error ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p role="alert">Дүнгийн тайланг ачаалж чадсангүй.</p>
          <button className="app-button-secondary" type="button" onClick={() => setRetry((value) => value + 1)}>Дахин ачаалах</button>
        </div>
      ) : !rows ? <p role="status">Дүнг ачаалж байна…</p> : (
        <>
          <label className="mt-3 block max-w-xs text-sm font-bold">
            Тайлангийн анги
            <select className="app-field mt-1" value={selectedClass} onChange={(event) => {
              setSelectedClass(event.target.value);
              setAnalysisRequest(null);
              setAnalysis(null);
            }}>
              <option value="">Бүх анги</option>
              {classes.map((entry) => <option key={entry}>{entry}</option>)}
            </select>
          </label>
          <p className="mt-3">Дүнтэй оролцогч {visible.length} · Дундаж оноо {average}</p>
          {visible.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="app-button-secondary" onClick={download}>CSV татах</button>
            <button type="button" className="app-button-secondary" disabled={!memberIds.length || Boolean(analysis && !analysis.questions)} onClick={() => {
              setAnalysis({ completed: 0, total: memberIds.length });
              setAnalysisRequest({ ids: memberIds });
            }}>Асуултын тайлан тооцох</button>
          </div>}
          {analysis && (!analysis.questions ? <p role="status" className="mt-3">Дүн уншиж байна {analysis.completed} / {analysis.total}…</p> : (
            <div className="mt-3 space-y-2">
              <p role="status">{analysis.available} / {analysis.total} дүнгээс тооцлоо.</p>
              {analysis.questions.length ? (
                <div className="app-table-scroll max-h-72" tabIndex={0} role="region" aria-label="Асуулт тус бүрийн дүн">
                  <table className="w-full text-left text-sm">
                    <thead><tr><th scope="col" className="p-2">Хамгийн их алдсан асуултууд эхэнд</th><th scope="col" className="p-2">Бүтэн оноо авсан</th></tr></thead>
                    <tbody>{analysis.questions.map((row) => (
                      <tr key={row.id} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="p-2 break-words [&_img]:max-w-full">{renderRichText(decode(row.question || "Асуулт"))}</td>
                        <td className="p-2 whitespace-nowrap">{percent.format(row.correct / row.total)} ({row.correct}/{row.total})</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p>Асуулт тус бүрээр тооцох дүн олдсонгүй.</p>}
            </div>
          ))}
        </>
      )}
    </section>
  );
}
