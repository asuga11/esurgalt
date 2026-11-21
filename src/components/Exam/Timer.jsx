import { useEffect, useState } from "react";

const secondsFrom = (duration) => Math.max(0, Math.ceil((Number(duration) || 0) / 1000));
const pad = (value) => String(value).padStart(2, "0");

export default function Timer({ exDate, css }) {
  const [remaining, setRemaining] = useState(() => secondsFrom(exDate));

  useEffect(() => {
    const duration = Number(exDate);
    const seconds = Number.isFinite(duration) ? secondsFrom(duration) : 0;
    setRemaining(seconds);
    if (!seconds) return;

    const deadline = Date.now() + duration;
    const timer = window.setInterval(() => {
      const next = secondsFrom(deadline - Date.now());
      setRemaining(next);
      if (!next) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [exDate]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const time = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return <div className={css}>{days > 0 && `${days} өдөр `}{time}</div>;
}
