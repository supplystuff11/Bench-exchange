"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageSellerButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/messages/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={start}
      disabled={loading}
      className="w-full bg-transparent border border-[#3A362F] text-[#F0EBE1] font-semibold px-6 py-3 rounded-md hover:border-[#544E44] transition-colors disabled:opacity-60"
    >
      {loading ? "Opening..." : "Message seller"}
    </button>
  );
}
