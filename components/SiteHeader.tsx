"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/my-listings", label: "My listings" },
  { href: "/inbox", label: "Inbox" },
  { href: "/messages", label: "Messages" },
  { href: "/favorites", label: "Favorites" },
  { href: "/saved-searches", label: "Saved searches" },
  { href: "/orders", label: "Orders" },
];

export function SiteHeader({ search }: { search?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-[var(--bg-0)]/95 backdrop-blur border-b border-[var(--bg-2)] px-4 sm:px-6 py-3.5 flex items-center gap-4 sm:gap-6">
      {/* Mobile hamburger — only shown below sm, since the link row is hidden there */}
      <div className="sm:hidden relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open menu"
          className="text-[var(--text-1)] p-1 -ml-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-[var(--bg-1)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-[var(--text-2)] hover:bg-[var(--bg-0)] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="w-7 h-7 rounded-md bg-[var(--accent-fill)] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M12 2L7 13L11 13L10 22Z" fill="#C9A227" />
            <path d="M12 2L17 13L13 13L10 22Z" fill="#F0E6C8" />
          </svg>
        </span>
        <span className="font-bold text-[15px] tracking-tight text-[var(--text-1)]">Voltra</span>
      </Link>

      {NAV_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors hidden sm:inline shrink-0"
        >
          {l.label}
        </Link>
      ))}

      {search}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto shrink-0">
        <NotificationBell />
        <ThemeToggle />
        <AuthButton />
        <Link
          href="/sell"
          className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">Sell a part</span>
          <span className="sm:hidden">Sell</span>
        </Link>
      </div>
    </header>
  );
}
