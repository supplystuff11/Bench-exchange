import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { CategoryIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const recent = await prisma.listing.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-16 pb-14 border-b border-[#2B2822]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Turn your old parts into someone else's build.
          </h1>
          <p className="text-[#B8B1A3] text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Buy and sell GPUs, CPUs, and full rigs directly with other PC builders — with real
            specs, real condition, and real people, not a pile of furniture listings in the way.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/browse"
              className="bg-[#DD8A3E] text-[#1B1305] font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#E9974F] transition-colors"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="border border-[#3A362F] font-semibold px-5 py-2.5 rounded-lg text-sm hover:border-[#544E44] transition-colors"
            >
              Sell a part
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-4 sm:px-6 py-14 border-b border-[#2B2822]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="w-9 h-9 text-[#DD8A3E] mb-3">
              <CategoryIcon category="CPU" />
            </div>
            <h3 className="font-semibold mb-1.5">Built for PC parts</h3>
            <p className="text-sm text-[#8A8378] leading-relaxed">
              Real categories — GPU, CPU, motherboards, cooling — so you're not digging through
              strollers and couches to find a graphics card.
            </p>
          </div>
          <div>
            <div className="w-9 h-9 text-[#DD8A3E] mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-full h-full">
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1.5">Real specs, not vague ads</h3>
            <p className="text-sm text-[#8A8378] leading-relaxed">
              Brand, condition, and spec fields are built into every listing, so sellers can be
              precise about what's actually for sale.
            </p>
          </div>
          <div>
            <div className="w-9 h-9 text-[#DD8A3E] mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-full h-full">
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1.5">Local pickup or shipped</h3>
            <p className="text-sm text-[#8A8378] leading-relaxed">
              Listings show the seller's city, so you can arrange a local meetup or work out
              shipping directly with them.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 py-14 border-b border-[#2B2822]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { n: "1", t: "Sign in", d: "Sign in with Google — no separate account to create." },
              { n: "2", t: "Browse or list", d: "Find a part you need, or list one you're done with." },
              { n: "3", t: "Buy or offer", d: "Buy now at the asking price, or send an offer to negotiate." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-8 h-8 rounded-full bg-[#211F1B] border border-[#3A362F] flex items-center justify-center text-sm font-mono text-[#DD8A3E] mx-auto mb-3">
                  {s.n}
                </div>
                <h3 className="font-semibold mb-1">{s.t}</h3>
                <p className="text-sm text-[#8A8378]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent listings teaser */}
      <section className="px-4 sm:px-6 py-14 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-lg font-semibold">Recently listed</h2>
            <Link href="/browse" className="text-sm text-[#4FBFB0] hover:text-[#5FD3C3] transition-colors">
              See all listings →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-[#3A362F] rounded-xl">
              <p className="text-[#B8B1A3] text-sm mb-1">No listings yet.</p>
              <p className="text-[#736C5F] text-sm mb-5">Be the first to list a part.</p>
              <Link
                href="/sell"
                className="bg-[#DD8A3E] text-[#1B1305] font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#E9974F] transition-colors"
              >
                Sell a part
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recent.map((l) => (
                <Link
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="group bg-[#211F1B] border border-[#3A362F] rounded-xl overflow-hidden hover:border-[#544E44] transition-colors"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#2B2822] to-[#1C1A16] flex items-center justify-center">
                    {l.imageUrls.length > 0 ? (
                      <img src={l.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 text-[#4A4438]">
                        <CategoryIcon category={l.category} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-base font-bold text-[#F0EBE1]">
                      ${(l.priceCents / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-[#D9D3C7] truncate">{l.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
