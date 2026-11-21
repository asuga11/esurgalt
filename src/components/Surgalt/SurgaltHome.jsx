import { Link } from "react-router-dom";
import CollectionState from "../General/CollectionState";
import CourseCard from "./CourseCard";
import useCourseCatalog from "./useCourseCatalog";

function isExamPrep(course) {
  const name = `${course.name || ""} ${course.angilal_id?.name || ""}`.normalize("NFC").toLocaleLowerCase("mn-MN");
  return name.includes("эеш") || name.includes("элсэлтийн ерөнхий шалгалт");
}

export default function SurgaltHome() {
  const { courses, status, retry } = useCourseCatalog();
  const featured = [...courses.filter(isExamPrep), ...courses.filter((course) => !isExamPrep(course))].slice(0, 6);

  return (
    <section aria-labelledby="featured-courses" className="app-container py-9 sm:py-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <h2 id="featured-courses" tabIndex={-1} className="text-2xl font-extrabold tracking-tight sm:text-3xl">Онцлох сургалтууд</h2>
        <Link to="/training" className="app-button-secondary">Бүх сургалт</Link>
      </div>
      {status === "loading" ? (
        <CollectionState state="loading" title="Сургалтуудыг ачаалж байна…" />
      ) : status === "error" ? (
        <CollectionState state="error" title="Сургалтуудыг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={retry} />
      ) : featured.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {featured.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>
      ) : (
        <CollectionState state="empty" title="Сургалт одоогоор алга" />
      )}
    </section>
  );
}
