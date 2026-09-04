"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { NotificationBell } from "@/components/NotificationBell";

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
    <header className="sticky top-0 z-10 bg-[#171512]/95 backdrop-blur border-b border-[#2B2822] px-4 sm:px-6 py-3.5 flex items-center gap-4 sm:gap-6">
      {/* Mobile hamburger — only shown below sm, since the link row is hidden there */}
      <div className="sm:hidden relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open menu"
          className="text-[#F0EBE1] p-1 -ml-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-[#211F1B] border border-[#3A362F] rounded-xl shadow-lg z-50 overflow-hidden">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-[#D9D3C7] hover:bg-[#171512] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="w-7 h-7 rounded-md bg-[#DD8A3E] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1B1305" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
            <rect x="6" y="6" width="12" height="12" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="0.5" />
            <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
          </svg>
        </span>
        <span className="font-semibold text-[15px] tracking-tight">Bench Exchange</span>
      </Link>

      {NAV_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm text-[#B8B1A3] hover:text-[#F0EBE1] transition-colors hidden sm:inline shrink-0"
        >
          {l.label}
        </Link>
      ))}

      {search}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto shrink-0">
        <NotificationBell />
        <AuthButton />
        <Link
          href="/sell"
          className="bg-[#DD8A3E] text-[#1B1305] font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#E9974F] transition-colors"
        >
          Sell a part
        </Link>
      </div>
    </header>
  );
}
