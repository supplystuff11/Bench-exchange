"use client";

import { useEffect, useRef, useState } from "react";

export function IntroSplash() {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const FADE_DISTANCE = 450; // px of scroll over which the intro fully fades

    const update = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE));
      setProgress(p);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Fixed-height wrapper (never changes) so scrolling stays perfectly stable —
    // only the sticky inner content fades/scales via transform+opacity, which
    // the browser can animate smoothly without recalculating page layout.
    <div style={{ height: "100vh" }} className="relative">
      <div
        className="sticky top-0 h-screen flex flex-col items-center justify-center"
        style={{
          opacity: 1 - progress,
          transform: `scale(${1 - progress * 0.1})`,
          pointerEvents: progress > 0.5 ? "none" : "auto",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, var(--accent-soft-bg) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-col items-center">
          <svg viewBox="0 0 24 24" className="w-28 h-28 sm:w-36 sm:h-36 mb-4">
            <path d="M12 2L7 13L11 13L10 22Z" fill="var(--gold-fill)" />
            <path d="M12 2L17 13L13 13L10 22Z" fill="var(--text-1)" />
          </svg>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-[var(--text-1)]">
            Voltra
          </h1>
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-24 flex flex-col items-center gap-1.5"
          style={{ opacity: 1 - progress * 2.5 }}
        >
          <span className="text-xs font-medium tracking-wide text-[var(--text-3)]">
            scroll to explore
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5 text-[var(--text-3)] animate-bounce">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
