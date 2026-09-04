"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    if (!confirm("Remove this listing? This can't be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
  };

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="text-sm text-[#C96450] hover:text-[#DB7A65] transition-colors disabled:opacity-60"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}
