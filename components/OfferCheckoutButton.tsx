"use client";

import { useState } from "react";

export default function OfferCheckoutButton({ offerId, amountCents }: { offerId: string; amountCents: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={buy}
        disabled={loading}
        className="w-full bg-[#4FBFB0] text-[#0F2925] font-semibold px-6 py-3 rounded-md hover:bg-[#5FD3C3] transition-colors disabled:opacity-60"
      >
        {loading ? "Redirecting to checkout..." : `Complete purchase at $${(amountCents / 100).toLocaleString()}`}
      </button>
      {error && <p className="text-sm text-[#C96450] mt-3">{error}</p>}
    </div>
  );
}
