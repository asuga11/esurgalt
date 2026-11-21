import { useContext } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import MainContext from "../../Context/MainContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(MainContext);
  const dark = theme === "dark";
  const label = dark ? "Гэрэлтэй горимд шилжих" : "Харанхуй горимд шилжих";
  const Icon = dark ? SunIcon : MoonIcon;

  return (
    <button type="button" className="app-icon-button fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 size-12 rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] dark:border-slate-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:border-orange-400 dark:hover:bg-slate-800 print:hidden" aria-label={label} title={label} onClick={() => {
      const next = dark ? "light" : "dark";
      localStorage.setItem("theme", next);
      setTheme(next);
    }}>
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}
