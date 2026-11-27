import { useEffect, useEffectEvent, useRef, useState } from "react";

function readDuration(value) {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") {
    return null;
  }
  const duration = Number(value);
  return Number.isFinite(duration) ? Math.max(0, duration) : null;
}

export default function TimerMember({ exDate, css, onExpire, storageKey }) {
  const duration = readDuration(exDate);
  const [remaining, setRemaining] = useState(() => Math.ceil((duration ?? 0) / 1000));
  const deadline = useRef(null);
  const expired = useRef(false);
  const expire = useEffectEvent(onExpire);

  useEffect(() => {
    if (duration === null) return;

    const reportedDeadline = Date.now() + duration;
    let savedDeadline;
    if (storageKey) {
      try {
        const saved = Number(sessionStorage.getItem(storageKey));
        if (Number.isFinite(saved) && saved > 0) savedDeadline = saved;
      } catch { /* The live timer still works when storage is blocked. */ }
    }
    deadline.current = Math.min(deadline.current ?? reportedDeadline, savedDeadline ?? reportedDeadline, reportedDeadline);
    if (storageKey) {
      try { sessionStorage.setItem(storageKey, String(deadline.current)); } catch { /* Use the in-memory deadline. */ }
    }
    const update = () => {
      if (expired.current) return;
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        expired.current = true;
        expire();
      }
    };

    update();
    if (expired.current) return;
    const interval = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [duration, storageKey]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");

  return <div className={css}>{duration === null ? "Хугацаа тодорхойгүй" : time}</div>;
}
