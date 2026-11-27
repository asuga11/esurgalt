import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { uploadBaseUrl } from "../../config";
import MainContext from "../../Context/MainContext";
import CollectionState from "../General/CollectionState";
import SurgaltList from "./SurgaltList";

export default function SurgaltSuragch() {
  const { getSuragchSurgalt } = useContext(MainContext);
  const [request, setRequest] = useState({ status: "loading", courses: [], detail: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", courses: [], detail: "" });
    getSuragchSurgalt(controller.signal).then((courses) => {
      if (!controller.signal.aborted) setRequest({ status: "ready", courses, detail: "" });
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setRequest({ status: "error", courses: [], detail: error.response?.data?.error || error.message });
      }
    });
    return () => controller.abort();
  }, [getSuragchSurgalt, attempt]);

  return (
    <section aria-labelledby="my-courses-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="my-courses-title" className="text-xl font-extrabold">Миний сургалтууд</h2>
        <Link to="/training" className="app-button-secondary">Бүх сургалт үзэх</Link>
      </div>
      {request.status === "loading" && <CollectionState state="loading" title="Миний сургалтуудыг ачаалж байна…" />}
      {request.status === "error" && <CollectionState state="error" title="Миний сургалтуудыг ачаалж чадсангүй"
        detail={request.detail} actionLabel="Дахин оролдох" action={() => setAttempt((value) => value + 1)} />}
      {request.status === "ready" && request.courses.length === 0 && (
        <CollectionState state="empty" title="Бүртгүүлсэн сургалт алга" />
      )}
      {request.courses.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {request.courses.map(({ surgalt, suraltsagch }) => {
          const canWatch = surgalt.isTulbur === false || String(suraltsagch?.status ?? "").trim() === "Худалдаж авсан";
          const card = (
            <>
              {surgalt.photo && <img alt="" className="aspect-video w-full object-cover" src={`${uploadBaseUrl}/lms/${surgalt.photo}`} />}
              <span className="flex items-center justify-between gap-3 p-4">
                <span>
                  <span className="block font-extrabold">{surgalt.name}</span>
                  <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300">{canWatch ? "Үзэх" : suraltsagch?.status || "Эрх идэвхгүй"}</span>
                </span>
                {canWatch && <PlayCircleIcon aria-hidden="true" className="size-7 shrink-0 text-orange-700 dark:text-orange-300" />}
              </span>
            </>
          );
          const className = "app-panel overflow-hidden text-left hover:border-orange-400";
          return (
            canWatch
              ? <Link key={surgalt._id} to={`/control/learn/${encodeURIComponent(surgalt._id)}`} className={className}>{card}</Link>
              : <div key={surgalt._id} className="app-panel overflow-hidden">{card}</div>
          );
        })}
      </div>}
      {request.status !== "loading" && request.courses.length === 0 && <SurgaltList embedded />}
    </section>
  );
}
