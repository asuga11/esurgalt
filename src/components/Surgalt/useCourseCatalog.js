import { useContext, useEffect, useState } from "react";
import MainContext from "../../Context/MainContext";

export default function useCourseCatalog(category = "") {
  const { getPublicCourses } = useContext(MainContext);
  const [request, setRequest] = useState({ courses: [], status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ courses: [], status: "loading" });
    getPublicCourses(category, controller.signal).then(({ data }) => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(data?.surgalt)) throw new Error("Invalid course list");
      setRequest({ courses: data.surgalt, status: "ready" });
    }).catch(() => {
      if (!controller.signal.aborted) setRequest({ courses: [], status: "error" });
    });
    return () => controller.abort();
  }, [category, getPublicCourses, attempt]);

  return { ...request, retry: () => setAttempt((value) => value + 1) };
}
