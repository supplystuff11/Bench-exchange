"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({
  orderId,
  role,
  label,
}: {
  orderId: string;
  role: "SELLER" | "BUYER";
  label: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError("");
    if (rating === 0) {
      setError("Pick a star rating.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, role, rating, comment }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Couldn't submit review");
      return;
    }
    setDone(true);
    router.refresh();
  };

  if (done) return <p className="text-sm text-[var(--success-text)]">Review submitted — thanks!</p>;

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 flex flex-col gap-3 bg-[var(--bg-0)]">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={n <= (hover || rating) ? "text-[var(--gold-fill)]" : "text-[var(--border)]"}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Optional comment"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-[var(--bg-1)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-fill)] transition-colors"
      />
      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting}
        className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-4 py-2 rounded-md text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 self-start"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}
