import { useEffect, useEffectEvent, useState } from "react";

function readDuration(value) {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") {
    return null;
  }
  const duration = Number(value);
  return Number.isFinite(duration) ? Math.max(0, duration) : null;
}

export default function TimerMember({ exDate, css, onExpire }) {
  const duration = readDuration(exDate);
  const [remaining, setRemaining] = useState(() => Math.ceil((duration ?? 0) / 1000));
  const expire = useEffectEvent(onExpire);

  useEffect(() => {
    if (duration === null) return;

    const deadline = Date.now() + duration;
    let expired = false;
    const update = () => {
      if (expired) return;
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        expired = true;
        expire();
      }
    };

    update();
    if (expired) return;
    const interval = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [duration]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");

  return <div className={css}>{duration === null ? "Хугацаа тодорхойгүй" : time}</div>;
}
