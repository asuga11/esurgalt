import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import MainContext from "../Context/MainContext";
import campus from "../assets/hero-alsiin.jpg";
import learning from "../assets/hero-bannar02.png";

const slides = [
  { image: campus, label: "МУИС-ийн Баруун бүсийн сургуулийн барилга", position: "object-[52%_65%] lg:object-[50%_82%]" },
  { image: learning, label: "Цахим сургалтын зураг", position: "object-center" },
];

export default function HomeHero() {
  const { sorilType } = useContext(MainContext);
  const examType = sorilType?.content?.find(({ examType }) => examType === "ЭЕШ-ын сорил")?.examType
    || sorilType?.content?.[0]?.examType
    || "ЭЕШ-ын сорил";

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!playing || hovering) return;
    const timer = window.setTimeout(() => setActive((active + 1) % slides.length), 6000);
    return () => window.clearTimeout(timer);
  }, [active, hovering, playing]);

  const togglePlayback = () => {
    if (!playing) setHovering(false);
    setPlaying(!playing);
  };

  const selectSlide = (index) => {
    setActive((index + slides.length) % slides.length);
    setPlaying(false);
  };

  const playbackLabel = playing ? "Зураг солигдохыг түр зогсоох" : "Зураг автоматаар солих";

  return (
    <section
      aria-label="Цахим сургалтын танилцуулга"
      className="relative isolate flex min-h-[min(40rem,calc(100svh-4rem))] overflow-hidden bg-slate-950 text-white md:min-h-[clamp(34rem,calc(100svh-4rem),50rem)]"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovering(true); }}
      onPointerLeave={() => setHovering(false)}
      onFocusCapture={(event) => { if (event.target.matches(":focus-visible")) setPlaying(false); }}
    >
      {slides.map(({ image, label, position }, index) => (
        <img
          key={image}
          src={image}
          alt={label}
          aria-hidden={active !== index}
          fetchPriority={index === 0 ? "high" : "low"}
          className={`pointer-events-none absolute inset-0 -z-20 size-full object-cover transition-[opacity,scale] duration-[900ms] ease-in-out motion-reduce:transition-none ${position} ${active === index ? "opacity-100 motion-safe:scale-[1.025]" : "scale-100 opacity-0"}`}
        />
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-slate-950/60 md:bg-transparent md:bg-[linear-gradient(90deg,rgba(2,6,23,0.84),rgba(2,6,23,0.62)_38%,rgba(2,6,23,0.22)_78%,rgba(2,6,23,0.34))]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/25" />

      <button
        type="button"
        onClick={togglePlayback}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded-xl focus:bg-slate-950 focus:px-4 focus:py-3 focus:text-sm focus:font-bold"
      >
        {playbackLabel}
      </button>
      <div className="app-container flex items-center pt-12 pb-32 sm:pt-16 md:px-22 md:py-16 lg:px-25 2xl:px-10">
        <div className="min-w-0 max-w-[47rem] motion-safe:animate-[hero-reveal_650ms_ease-out_both]">
          <p className="mb-5 inline-flex max-w-full items-center rounded-full border border-white/25 bg-slate-950/35 px-3.5 py-1.5 text-sm font-bold text-orange-100 backdrop-blur-sm sm:mb-7">
            МУИС · Баруун бүсийн сургууль
          </p>
          <h1 className="text-[clamp(2.25rem,5.6vw,5.5rem)] leading-[1.06] font-extrabold tracking-tight text-white">
            Цахим сургалт, сорил, шалгалт
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-100 sm:mt-5 sm:text-lg">
            Хичээлээ сонгон өөрийн хурдаар суралцаж, ЭЕШ болон бусад шалгалтад бэлдээрэй.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <Link to="/training" className="app-button-primary min-h-12 gap-2.5 bg-orange-700 px-5 max-[400px]:w-full sm:min-h-14 sm:px-6">
              <BookOpenIcon aria-hidden="true" className="size-5 shrink-0" />
              Сургалтууд үзэх
            </Link>
            <Link to={`/soril/${encodeURIComponent(examType)}`} className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-white/35 bg-slate-950/40 px-5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 max-[400px]:w-full sm:min-h-14 sm:px-6">
              <ClipboardDocumentCheckIcon aria-hidden="true" className="size-5 shrink-0" />
              Сорилууд үзэх
            </Link>
          </div>
        </div>
      </div>

      <button type="button" onClick={() => selectSlide(active - 1)} aria-label="Өмнөх зураг" className="absolute bottom-16 left-4 grid size-11 place-items-center rounded-full border border-white/25 bg-slate-950/45 backdrop-blur-sm transition hover:bg-slate-950/80 md:top-1/2 md:bottom-auto md:left-5 md:size-12 md:-translate-y-1/2 lg:left-7">
        <ChevronLeftIcon aria-hidden="true" className="size-5" />
      </button>
      <button type="button" onClick={() => selectSlide(active + 1)} aria-label="Дараагийн зураг" className="absolute right-4 bottom-16 grid size-11 place-items-center rounded-full border border-white/25 bg-slate-950/45 backdrop-blur-sm transition hover:bg-slate-950/80 md:top-1/2 md:right-5 md:bottom-auto md:size-12 md:-translate-y-1/2 lg:right-7">
        <ChevronRightIcon aria-hidden="true" className="size-5" />
      </button>
    </section>
  );
}
