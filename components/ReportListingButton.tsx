"use client";

import { useState } from "react";

const REASONS = ["Scam", "Fake or misleading listing", "Prohibited item", "Trying to pay outside the app", "Spam", "Other"];

export default function ReportListingButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError("");
    if (!reason) {
      setError("Pick a reason.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reason, details }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Couldn't submit report");
      return;
    }
    setSent(true);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--text-4)] hover:text-[var(--danger-text)] transition-colors"
      >
        Report this listing
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <>
                <h2 className="text-lg font-semibold mb-2 text-[var(--text-1)]">Report submitted</h2>
                <p className="text-sm text-[var(--text-3)] mb-5">Thanks — we'll take a look.</p>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full bg-[var(--bg-2)] hover:bg-[var(--bg-2-hover)] text-sm font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4 text-[var(--text-1)]">Report this listing</h2>
                <div className="flex flex-col gap-1.5 mb-3">
                  {REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-[var(--accent-fill)]"
                      />
                      {r}
                    </label>
                  ))}
                </div>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Additional details (optional)"
                  className="w-full bg-[var(--bg-0)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-fill)] transition-colors mb-3"
                />
                {error && <p className="text-sm text-[var(--danger-text)] mb-3">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-[var(--border)] text-sm font-medium px-3 py-2 rounded-md hover:border-[var(--border-strong)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="flex-1 bg-[var(--danger-text)] text-white font-semibold text-sm px-3 py-2 rounded-md hover:bg-[var(--danger-hover)] transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Submit report"}
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
