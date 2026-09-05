"use client";

import { useState } from "react";

export default function SaveSearchButton({
  category,
  brand,
  search,
  minPrice,
  maxPrice,
}: {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, brand, search, minPrice, maxPrice }),
    });
    setLoading(false);
    if (res.ok) setSaved(true);
  };

  if (saved) {
    return <span className="text-xs text-[var(--success-text)]">Saved — we'll notify you of new matches</span>;
  }

  return (
    <button
      onClick={save}
      disabled={loading}
      className="text-xs text-[var(--teal-fill)] hover:text-[var(--teal-hover)] transition-colors disabled:opacity-60"
    >
      {loading ? "Saving..." : "Save this search"}
    </button>
  );
}
