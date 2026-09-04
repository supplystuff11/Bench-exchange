"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function FavoriteButton({
  listingId,
  initialFavorited = false,
  className = "",
}: {
  listingId: string;
  initialFavorited?: boolean;
  className?: string;
}) {
  const { status } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // don't trigger a parent <Link> (cards are fully clickable)
    e.stopPropagation();
    if (status !== "authenticated") return;
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites/${listingId}`, { method: "POST" });
      const data = await res.json();
      setFavorited(data.favorited);
    } finally {
      setLoading(false);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      className={`leading-none hover:scale-110 transition-transform ${
        favorited ? "text-[#C96450]" : "text-[#B8B1A3]"
      } ${className}`}
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
