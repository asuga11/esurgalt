import { useEffect, useState } from "react";

export default function ExpTimer({ exDate, logout }) {
  const [deadline] = useState(() => Date.now() + Number(exDate));
  const [remaining, setRemaining] = useState(() => Math.ceil(Number(exDate) / 1000));

  useEffect(() => {
    const update = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) logout();
    };
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [deadline, logout]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  return <span>{[hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":")}</span>;
}
