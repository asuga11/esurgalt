import { useContext, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import MainContext from "../../Context/MainContext";
import CollectionState from "../General/CollectionState";
import CourseLessonViewer from "./CourseLessonViewer";

function mergeCourse(details, enrollment) {
  const memberCourse = enrollment?.surgalt;
  const lessons = Array.isArray(details?.lessons) ? details.lessons.filter(Boolean) : [];
  const memberLessons = Array.isArray(memberCourse?.lessons) ? memberCourse.lessons.filter(Boolean) : [];
  const idOf = (lesson) => lesson._id ?? lesson.id;
  const byId = new Set(lessons.map(idOf).filter((id) => id != null).map(String));
  const merged = lessons.map((lesson) => {
    const id = idOf(lesson);
    const member = id == null ? null : memberLessons.find((item) => String(idOf(item)) === String(id));
    return member ? { ...member, ...lesson, url: member.url || lesson.url,
      lessonType: member.url ? member.lessonType ?? lesson.lessonType : lesson.lessonType,
      isActive: member.isActive === false || lesson.isActive === false ? false : lesson.isActive } : lesson;
  });
  return { ...memberCourse, ...details, lessons: [...merged, ...memberLessons.filter((lesson) => !byId.has(String(idOf(lesson))))] };
}

function CourseLearningPage({ courseId, memberId }) {
  const { getCourseDetails, getLearningCourse, getSuragchSurgalt } = useContext(MainContext);
  const [search, setSearch] = useSearchParams();
  const [request, setRequest] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading" });
    const { signal } = controller;
    async function load() {
      try {
        const reply = await getLearningCourse(courseId, signal);
        if (signal.aborted) return;
        const data = reply?.data ?? reply;
        if (data?.success === false || String(data?.surgalt?._id) !== courseId || !Array.isArray(data?.lessons)) {
          setRequest({ status: "error" });
          return;
        }
        const lessons = data.lessons.filter(Boolean).map((lesson) => {
          const allowed = lesson.locked === false || (lesson.locked == null && data.access?.full === true);
          return {
            ...lesson,
            locked: !allowed,
            url: allowed ? lesson.videoUrl : null,
            materials: allowed ? (lesson.files ?? lesson.materials) : [],
          };
        });
        if (data.access?.full === false && !lessons.some((lesson) => !lesson.locked && lesson.isActive !== false)) {
          setRequest({ status: "locked" });
        } else {
          setRequest({ status: "ready", course: { ...data.surgalt, video: null, lessons }, lastLesson: data.progress?.lastLesson_id });
        }
      } catch (error) {
        if (signal.aborted) return;
        if ([401, 403].includes(error.response?.status)) {
          setRequest({ status: "locked" });
          return;
        }
        if (![404, 405, 501].includes(error.response?.status)) {
          setRequest({ status: "error" });
          return;
        }

        const [details, memberships] = await Promise.allSettled([getCourseDetails(courseId, signal), getSuragchSurgalt(signal)]);
        if (signal.aborted) return;
        const course = String(details.value?._id) === courseId ? details.value : null;
        const enrollment = memberships.value?.find((entry) => String(entry.surgalt._id) === courseId);
        const owned = String(enrollment?.suraltsagch?.status ?? "").trim() === "Худалдаж авсан";
        if (course?.isTulbur === false || enrollment?.surgalt?.isTulbur === false || owned) {
          setRequest({ status: "ready", course: mergeCourse(course, enrollment) });
        } else if (details.status === "rejected" || memberships.status === "rejected") {
          setRequest({ status: "error" });
        } else {
          setRequest({ status: "locked" });
        }
      }
    }
    load();
    return () => controller.abort();
  }, [attempt, courseId, getCourseDetails, getLearningCourse, getSuragchSurgalt]);

  return (
    <div className="mx-auto max-w-[90rem]">
      <Link to="/control/training" className="app-button-secondary mb-4 gap-2">
        <ArrowLeftIcon aria-hidden="true" className="size-4" /> Миний сургалтууд
      </Link>
      {request.status === "ready" ? (
        <CourseLessonViewer course={request.course} preferLesson requestedLesson={search.get("lesson")}
          initialLesson={request.lastLesson}
          progressKey={memberId == null ? undefined : `esurgalt.learn:${[memberId, courseId].map(encodeURIComponent).join(":")}`}
          onLessonChange={(id) => setSearch((current) => {
            const next = new URLSearchParams(current);
            if (id == null) next.delete("lesson");
            else next.set("lesson", id);
            return next;
          }, { replace: true })} />
      ) : request.status === "loading" ? (
        <CollectionState state="loading" title="Хичээлүүдийг ачаалж байна…" />
      ) : request.status === "locked" ? (
        <div className="grid justify-items-center gap-3">
          <div className="w-full">
            <CollectionState state="empty" title="Сургалтын үзэх эрх идэвхгүй байна"
              actionLabel="Эрхийг дахин шалгах" action={() => setAttempt((value) => value + 1)} />
          </div>
          <Link to={`/training/${encodeURIComponent(courseId)}`} className="app-button-primary">Сургалтын дэлгэрэнгүй</Link>
        </div>
      ) : (
        <CollectionState state="error" title="Сургалтын мэдээллийг ачаалж чадсангүй"
          actionLabel="Дахин оролдох" action={() => setAttempt((value) => value + 1)} />
      )}
    </div>
  );
}

export default function CourseLearning() {
  const { courseId } = useParams();
  const { user } = useContext(MainContext);
  const memberId = user?.id ?? user?._id ?? user?.sub;
  return <CourseLearningPage key={`${memberId}:${courseId}`} courseId={courseId} memberId={memberId} />;
}
