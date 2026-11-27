import { useContext, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import MainContext from "../../Context/MainContext";
import CollectionState from "../General/CollectionState";
import CourseCard from "./CourseCard";
import useCourseCatalog from "./useCourseCatalog";

const normalizeText = (text) => text.normalize("NFC").toLocaleLowerCase("mn-MN").trim();

export default function SurgaltList({ embedded = false }) {
  const { angilalState } = useContext(MainContext);
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const { courses, status, retry } = useCourseCatalog(category);
  const query = normalizeText(keyword);
  const filtered = query
    ? courses.filter((course) => normalizeText(`${course.name || ""} ${course.angilal_id?.name || ""}`).includes(query))
    : courses;

  const clearFilters = () => {
    setCategory("");
    setKeyword("");
  };

  return (
    <section className={embedded ? "mt-6" : "app-container py-7 sm:py-12"} aria-label="Бүх сургалт">
      {embedded && <h2 className="mb-3 text-xl font-extrabold">Бүх сургалт</h2>}
      <div className="app-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:p-5">
        <div className="min-w-0 flex-1">
          <label htmlFor="course-search" className="mb-2 block text-sm font-bold">Сургалт хайх</label>
          <div className="relative">
            <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-500" />
            <input id="course-search" type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="app-field pl-11" placeholder="Сургалтын нэр" />
          </div>
        </div>
        <div className="w-full sm:w-60">
          <label htmlFor="course-category" className="mb-2 block text-sm font-bold">Ангилал</label>
          <select id="course-category" value={category} onChange={(event) => setCategory(event.target.value)} className="app-field">
            <option value="">Бүх ангилал</option>
            {angilalState?.angilal?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-5" aria-busy={status === "loading"}>
        {status === "loading" ? (
          <CollectionState state="loading" title="Сургалтуудыг ачаалж байна…" />
        ) : status === "error" ? (
          <CollectionState state="error" title="Сургалтуудыг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={retry} />
        ) : filtered.length ? (
          <>
            <p className="mb-4 text-sm font-bold text-slate-600 dark:text-slate-300" role="status">{filtered.length} сургалт</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {filtered.map((course) => <CourseCard key={course._id} course={course} />)}
            </div>
          </>
        ) : (
          <CollectionState state="empty" title="Сургалт олдсонгүй" actionLabel="Шүүлтүүр арилгах" action={keyword || category ? clearFilters : undefined} />
        )}
      </div>
    </section>
  );
}
