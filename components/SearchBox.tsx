"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bench-exchange-recent-searches";
const MAX_RECENTS = 6;

export default function SearchBox({
  initialSearch,
  activeCategory,
  brand,
  minPrice,
  maxPrice,
  conditions,
}: {
  initialSearch?: string;
  activeCategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  conditions: string[];
}) {
  const [value, setValue] = useState(initialSearch ?? "");
  const [recents, setRecents] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const remember = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recents.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(
      0,
      MAX_RECENTS
    );
    setRecents(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const clearRecents = () => {
    setRecents([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const pickRecent = (term: string) => {
    setValue(term);
    setOpen(false);
    remember(term);
    formRef.current?.requestSubmit();
  };

  return (
    <form
      ref={formRef}
      action="/browse"
      method="GET"
      className="flex-1 min-w-0 max-w-md relative"
      onSubmit={() => remember(value)}
    >
      <div ref={wrapRef} className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-4)]"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          name="search"
          placeholder="Search parts, brand, specs..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          className="w-full bg-[var(--bg-1)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--accent-fill)] transition-colors"
        />
        {open && recents.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-[var(--bg-1)] border border-[var(--border)] rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--bg-2)]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-4)]">
                Recent searches
              </span>
              <button
                type="button"
                onClick={clearRecents}
                className="text-[10px] text-[var(--text-4)] hover:text-[var(--danger-text)] transition-colors"
              >
                Clear
              </button>
            </div>
            {recents.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => pickRecent(r)}
                className="w-full text-left px-3 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-0)] transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeCategory && activeCategory !== "All" && (
        <input type="hidden" name="category" value={activeCategory} />
      )}
      {brand && <input type="hidden" name="brand" value={brand} />}
      {minPrice !== undefined && <input type="hidden" name="minPrice" value={minPrice} />}
      {maxPrice !== undefined && <input type="hidden" name="maxPrice" value={maxPrice} />}
      {conditions.map((c) => (
        <input key={c} type="hidden" name="condition" value={c} />
      ))}
    </form>
  );
}
