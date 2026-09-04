"use client";

import { useState } from "react";

export default function MakeOfferButton({
  listingId,
  askingPriceCents,
}: {
  listingId: string;
  askingPriceCents: number;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError("");
    const amountCents = Math.round(Number(amount) * 100);
    if (!amount || amountCents <= 0) {
      setError("Enter a valid offer amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, amountCents, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send offer");
      setSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-transparent border border-[#3A362F] text-[#F0EBE1] font-semibold px-6 py-3 rounded-md hover:border-[#544E44] transition-colors"
      >
        Make an offer
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#211F1B] border border-[#3A362F] rounded-xl p-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <>
                <h2 className="text-lg font-semibold mb-2">Offer sent</h2>
                <p className="text-sm text-[#B8B1A3] mb-5">
                  The seller has been notified and can accept, decline, or reach out directly.
                  You'll get a notification when they respond.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full bg-[#2B2822] hover:bg-[#332F28] text-sm font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-1">Make an offer</h2>
                <p className="text-sm text-[#736C5F] mb-4">
                  Asking price: ${(askingPriceCents / 100).toLocaleString()}
                </p>
                <label className="text-xs text-[#B8B1A3] mb-1.5 block">Your offer (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="120"
                  className="w-full bg-[#171512] border border-[#3A362F] rounded-md px-3 py-2 text-sm outline-none focus:border-[#DD8A3E] transition-colors mb-3"
                />
                <label className="text-xs text-[#B8B1A3] mb-1.5 block">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="I can pick up this weekend..."
                  className="w-full bg-[#171512] border border-[#3A362F] rounded-md px-3 py-2 text-sm outline-none focus:border-[#DD8A3E] transition-colors mb-3"
                />
                {error && <p className="text-sm text-[#C96450] mb-3">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-[#3A362F] text-sm font-medium px-3 py-2 rounded-md hover:border-[#544E44] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="flex-1 bg-[#DD8A3E] text-[#1B1305] font-semibold text-sm px-3 py-2 rounded-md hover:bg-[#E9974F] transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send offer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
