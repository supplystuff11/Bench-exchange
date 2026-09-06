"use client";

import { useState } from "react";

type Rate = { cents: number; provider: string; serviceLevel: string };

export default function BuyButton({
  listingId,
  shipsAvailable,
}: {
  listingId: string;
  shipsAvailable?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ship, setShip] = useState(false);
  const [zip, setZip] = useState("");
  const [rate, setRate] = useState<Rate | null>(null);
  const [quoting, setQuoting] = useState(false);

  const getQuote = async () => {
    setError("");
    setRate(null);
    if (!/^\d{5}$/.test(zip)) {
      setError("Enter a valid 5-digit ZIP code.");
      return;
    }
    setQuoting(true);
    try {
      const res = await fetch("/api/shipping/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, toZip: zip }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't get a rate");
      setRate(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setQuoting(false);
    }
  };

  const buy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, ship: ship && !!rate, toZip: ship ? zip : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const readyToBuy = !ship || !!rate;

  return (
    <div>
      {shipsAvailable && (
        <div className="flex gap-2 mb-3 text-sm">
          <button
            type="button"
            onClick={() => {
              setShip(false);
              setRate(null);
            }}
            className={`flex-1 border rounded-md px-3 py-2 transition-colors ${
              !ship
                ? "border-[var(--accent-fill)] text-[var(--text-1)]"
                : "border-[var(--border)] text-[var(--text-3)]"
            }`}
          >
            Local pickup
          </button>
          <button
            type="button"
            onClick={() => setShip(true)}
            className={`flex-1 border rounded-md px-3 py-2 transition-colors ${
              ship
                ? "border-[var(--accent-fill)] text-[var(--text-1)]"
                : "border-[var(--border)] text-[var(--text-3)]"
            }`}
          >
            Ship it
          </button>
        </div>
      )}

      {ship && !rate && (
        <div className="flex gap-2 mb-3">
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="Your ZIP code"
            className="flex-1 bg-[var(--bg-1)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-fill)] transition-colors"
          />
          <button
            type="button"
            onClick={getQuote}
            disabled={quoting}
            className="border border-[var(--border)] text-sm font-medium px-3 py-2 rounded-md hover:border-[var(--border-strong)] transition-colors disabled:opacity-60"
          >
            {quoting ? "Checking..." : "Get rate"}
          </button>
        </div>
      )}

      {ship && rate && (
        <p className="text-sm text-[var(--text-3)] mb-3 bg-[var(--bg-2)] rounded-md px-3 py-2">
          {rate.provider} {rate.serviceLevel} — ${(rate.cents / 100).toFixed(2)} to {zip}
        </p>
      )}

      {error && <p className="text-sm text-[var(--danger-text)] mb-3">{error}</p>}

      <button
        onClick={buy}
        disabled={loading || !readyToBuy}
        className="w-full bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-6 py-3 rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
      >
        {loading ? "Redirecting to checkout..." : "Buy now"}
      </button>
    </div>
  );
}
