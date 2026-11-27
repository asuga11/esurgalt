import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import CollectionState from "../General/CollectionState";
import CourseLessonViewer from "./CourseLessonViewer";

export default function CourseWatchDialog({ course, loadCourse, onClose }) {
  const [request, setRequest] = useState({ status: "loading", details: null });
  const [attempt, setAttempt] = useState(0);
  const courseId = course._id;

  useEffect(() => {
    if (!loadCourse) return;
    const controller = new AbortController();
    setRequest({ status: "loading", details: null });
    loadCourse(courseId, controller.signal).then((details) => {
      if (controller.signal.aborted) return;
      if (String(details?._id) !== String(courseId)) throw new Error("Сургалт олдсонгүй.");
      setRequest({ status: "ready", details });
    }).catch(() => {
      if (!controller.signal.aborted) setRequest({ status: "error", details: null });
    });
    return () => controller.abort();
  }, [courseId, loadCourse, attempt]);

  const details = request.details ? { ...course, ...request.details } : course;
  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div aria-hidden="true" className="fixed inset-0 bg-slate-950/70" />
      <div className="fixed inset-0 overflow-y-auto overscroll-contain p-2 sm:p-4">
        <DialogPanel className="mx-auto flex min-h-full w-full max-w-[100rem] flex-col rounded-2xl bg-white p-3 shadow-2xl sm:p-5 dark:bg-slate-900 dark:text-white">
          <div className="mb-3 flex items-center justify-between gap-3">
            <DialogTitle className="min-w-0 text-lg font-extrabold break-words sm:text-2xl">{course.name}</DialogTitle>
            <button type="button" aria-label="Сургалтыг хаах" className="app-icon-button" onClick={onClose}>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          {loadCourse && request.status === "loading" ? (
            <CollectionState state="loading" title="Хичээлүүдийг ачаалж байна…" />
          ) : (
            <>
              {loadCourse && request.status === "error" && (
                <CollectionState state="error" title="Хичээлийн мэдээлэл ачаалж чадсангүй" actionLabel="Дахин оролдох" action={() => setAttempt((count) => count + 1)} />
              )}
              <CourseLessonViewer course={details} preferLesson />
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
