"use client";

import { useEffect, useState } from "react";
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

export default function InboxPage() {
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
    pending: "bg-[#2B2822] text-[#DD8A3E]",
    accepted: "bg-[#1F3A2E] text-[#6FCF97]",
    declined: "bg-[#3A2320] text-[#C96450]",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-6">Inbox</h1>

        <div className="flex gap-4 mb-6 text-sm">
          <button
            onClick={() => router.push("/inbox?box=received")}
            className={box === "received" ? "font-semibold border-b-2 border-[#DD8A3E] pb-1" : "text-[#736C5F] pb-1"}
          >
            Offers received
          </button>
          <button
            onClick={() => router.push("/inbox?box=sent")}
            className={box === "sent" ? "font-semibold border-b-2 border-[#DD8A3E] pb-1" : "text-[#736C5F] pb-1"}
          >
            Offers sent
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#736C5F]">Loading...</p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-[#736C5F]">No offers here yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((o) => (
              <div key={o.id} className="border border-[#3A362F] rounded-xl p-4 bg-[#211F1B]">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/listing/${o.listing.id}`} className="font-semibold hover:text-[#DD8A3E] transition-colors">
                    {o.listing.title}
                  </Link>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${statusClass[o.status] || ""}`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-[#B8B1A3] mb-1">
                  List price {money(o.listing.priceCents)} · Offer {money(o.amountCents)}
                  {box === "received" && o.buyer?.name ? ` · from ${o.buyer.name}` : ""}
                </p>
                {o.message && <p className="text-sm text-[#736C5F] italic mb-2">"{o.message}"</p>}

                {box === "received" && o.status === "pending" && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => act(o.id, "accept")}
                      className="bg-[#4FBFB0] text-[#0F2925] text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-[#5FD3C3] transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => act(o.id, "decline")}
                      className="bg-[#3A2320] text-[#C96450] text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-[#472A26] transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {box === "sent" && o.status === "accepted" && (
                  <Link
                    href={`/listing/${o.listing.id}?offerId=${o.id}`}
                    className="inline-block mt-3 bg-[#4FBFB0] text-[#0F2925] text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-[#5FD3C3] transition-colors"
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
