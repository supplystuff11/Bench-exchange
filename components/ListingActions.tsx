"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ListingActions({
  listingId,
  status,
  featured,
}: {
  listingId: string;
  status: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const setStatus = async (next: string) => {
    setLoading(next);
    const res = await fetch(`/api/listings/${listingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
  };

  const feature = async () => {
    setLoading("feature");
    try {
      const res = await fetch("/api/feature/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't start checkout");
      window.location.href = data.url;
    } catch (e) {
      setLoading(null);
    }
  };

  const btnClass =
    "text-xs font-medium px-2 py-1 rounded-md border border-[#3A362F] text-[#B8B1A3] hover:border-[#544E44] hover:text-[#F0EBE1] transition-colors disabled:opacity-50";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status === "active" && (
        <>
          <button onClick={() => setStatus("pending")} disabled={!!loading} className={btnClass}>
            {loading === "pending" ? "..." : "Mark pending"}
          </button>
          <button onClick={() => setStatus("sold")} disabled={!!loading} className={btnClass}>
            {loading === "sold" ? "..." : "Mark sold"}
          </button>
          {!featured && (
            <button onClick={feature} disabled={!!loading} className={btnClass}>
              {loading === "feature" ? "Redirecting..." : "Feature ($5 / 7 days)"}
            </button>
          )}
        </>
      )}
      {status === "pending" && (
        <>
          <button onClick={() => setStatus("active")} disabled={!!loading} className={btnClass}>
            {loading === "active" ? "..." : "Reactivate"}
          </button>
          <button onClick={() => setStatus("sold")} disabled={!!loading} className={btnClass}>
            {loading === "sold" ? "..." : "Mark sold"}
          </button>
        </>
      )}
      {status === "sold" && (
        <button onClick={() => setStatus("active")} disabled={!!loading} className={btnClass}>
          {loading === "active" ? "..." : "Relist"}
        </button>
      )}
    </div>
  );
}
