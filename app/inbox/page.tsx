"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

type Offer = {
  id: string;
  amountCents: number;
  message: string | null;
  status: string;
  createdAt: string;
  listing: { id: string; title: string; priceCents: number; status: string };
  buyer?: { id: string; name: string | null };
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

// useSearchParams() requires a Suspense boundary at build time (next build
// enforces this even though next dev doesn't), so the real page content
// lives in this inner component and the default export below just wraps it.
function InboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const box = searchParams.get("box") === "sent" ? "sent" : "received";

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/offers?box=${box}`)
      .then((r) => r.json())
      .then((d) => setOffers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [box]);

  const act = async (id: string, action: "accept" | "decline") => {
    const res = await fetch(`/api/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) load();
  };

  const statusClass: Record<string, string> = {
    pending: "bg-[var(--bg-2)] text-[var(--accent-fill)]",
    accepted: "bg-[var(--success-soft-bg)] text-[var(--success-text)]",
    declined: "bg-[var(--danger-soft-bg)] text-[var(--danger-text)]",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-6 text-[var(--text-1)]">Inbox</h1>

        <div className="flex gap-4 mb-6 text-sm">
          <button
            onClick={() => router.push("/inbox?box=received")}
            className={box === "received" ? "font-semibold border-b-2 border-[var(--accent-fill)] pb-1" : "text-[var(--text-4)] pb-1"}
          >
            Offers received
          </button>
          <button
            onClick={() => router.push("/inbox?box=sent")}
            className={box === "sent" ? "font-semibold border-b-2 border-[var(--accent-fill)] pb-1" : "text-[var(--text-4)] pb-1"}
          >
            Offers sent
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--text-4)]">Loading...</p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-[var(--text-4)]">No offers here yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((o) => (
              <div key={o.id} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--bg-1)]">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/listing/${o.listing.id}`} className="font-semibold hover:text-[var(--accent-fill)] transition-colors">
                    {o.listing.title}
                  </Link>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${statusClass[o.status] || ""}`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-3)] mb-1">
                  List price {money(o.listing.priceCents)} · Offer {money(o.amountCents)}
                  {box === "received" && o.buyer?.name ? ` · from ${o.buyer.name}` : ""}
                </p>
                {o.message && <p className="text-sm text-[var(--text-4)] italic mb-2">"{o.message}"</p>}

                {box === "received" && o.status === "pending" && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => act(o.id, "accept")}
                      className="bg-[var(--teal-fill)] text-[var(--teal-on)] text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-[var(--teal-hover)] transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => act(o.id, "decline")}
                      className="bg-[var(--danger-soft-bg)] text-[var(--danger-text)] text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-[var(--danger-soft-bg-hover)] transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {box === "sent" && o.status === "accepted" && (
                  <Link
                    href={`/listing/${o.listing.id}?offerId=${o.id}`}
                    className="inline-block mt-3 bg-[var(--teal-fill)] text-[var(--teal-on)] text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-[var(--teal-hover)] transition-colors"
                  >
                    Complete purchase
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={null}>
      <InboxContent />
    </Suspense>
  );
}
