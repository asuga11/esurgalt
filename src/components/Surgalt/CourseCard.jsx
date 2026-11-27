import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenIcon, ClockIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { uploadBaseUrl } from "../../config";
import { coursePrice } from "./coursePrice";

export default function CourseCard({ course }) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const { current, previous, discount } = coursePrice(course);
  const action = course.isTulbur === false ? "Үзэх" : "Дэлгэрэнгүй";

  return (
    <article className="app-panel flex min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/training/${course._id}`} aria-label={`${course.name} сургалт · ${action}`} className="group flex h-full min-w-0 flex-col rounded-2xl focus-visible:outline-offset-[-3px]">
        <div className="relative grid aspect-video place-items-center overflow-hidden bg-gradient-to-br from-slate-200 to-orange-100 dark:from-slate-900 dark:to-slate-800">
          <BookOpenIcon aria-hidden="true" className="size-12 text-slate-400 dark:text-slate-500" />
          {course.photo && failedPhoto !== course.photo && (
            <img
              src={`${uploadBaseUrl}/lms/${course.photo}`}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setFailedPhoto(course.photo)}
              className="absolute inset-0 size-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.035]"
            />
          )}
          {discount > 0 && current !== "Үнэгүй" && <span className="absolute top-3 right-3 rounded-full bg-red-700 px-2.5 py-1 text-xs font-extrabold text-white">−{discount}%</span>}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          {course.angilal_id?.name && <p className="text-sm font-bold text-orange-800 dark:text-orange-300">{course.angilal_id.name}</p>}
          <h3 className="text-lg leading-snug font-extrabold break-words group-hover:text-orange-800 dark:group-hover:text-orange-300">{course.name}</h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {course.info?.countLesson != null && (
              <li className="inline-flex items-center gap-1.5"><VideoCameraIcon aria-hidden="true" className="size-4 shrink-0" />{course.info.countLesson} хичээл</li>
            )}
            {course.info?.lessonTime && (
              <li className="inline-flex items-center gap-1.5"><ClockIcon aria-hidden="true" className="size-4 shrink-0" />{course.info.lessonTime}</li>
            )}
          </ul>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t border-slate-200 pt-3 dark:border-slate-700">
            <div className="text-sm">
              {previous && <del className="block text-slate-500 dark:text-slate-400">{previous}</del>}
              <span className="font-extrabold text-orange-800 dark:text-orange-300">{current}</span>
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:underline dark:text-slate-300">{action}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
