"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

type SavedSearch = {
  id: string;
  category: string | null;
  brand: string | null;
  search: string | null;
  minPrice: number | null;
  maxPrice: number | null;
};

function describe(s: SavedSearch) {
  const parts: string[] = [];
  if (s.search) parts.push(`"${s.search}"`);
  if (s.category) parts.push(s.category);
  if (s.brand) parts.push(s.brand);
  if (s.minPrice != null || s.maxPrice != null) {
    const min = s.minPrice != null ? s.minPrice / 100 : 0;
    const max = s.maxPrice != null ? s.maxPrice / 100 : "∞";
    parts.push(`$${min}–${max}`);
  }
  return parts.length ? parts.join(" · ") : "All listings";
}

function browseHref(s: SavedSearch) {
  const qs = new URLSearchParams();
  if (s.category) qs.set("category", s.category);
  if (s.brand) qs.set("brand", s.brand);
  if (s.search) qs.set("search", s.search);
  if (s.minPrice != null) qs.set("minPrice", String(s.minPrice / 100));
  if (s.maxPrice != null) qs.set("maxPrice", String(s.maxPrice / 100));
  const q = qs.toString();
  return q ? `/browse?${q}` : "/browse";
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/saved-searches")
      .then((r) => r.json())
      .then((d) => setSearches(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: string) => {
    const res = await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-6">Saved searches</h1>

        {loading ? (
          <p className="text-sm text-[#736C5F]">Loading...</p>
        ) : searches.length === 0 ? (
          <p className="text-sm text-[#736C5F]">
            No saved searches yet — on the{" "}
            <Link href="/browse" className="text-[#DD8A3E] hover:text-[#E9974F] transition-colors">
              Browse page
            </Link>
            , filter for what you want and tap "Save this search."
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {searches.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 bg-[#211F1B] border border-[#3A362F] rounded-xl p-3.5"
              >
                <Link href={browseHref(s)} className="text-sm hover:text-[#DD8A3E] transition-colors">
                  {describe(s)}
                </Link>
                <button
                  onClick={() => remove(s.id)}
                  className="text-xs text-[#C96450] hover:text-[#DB7A65] transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
