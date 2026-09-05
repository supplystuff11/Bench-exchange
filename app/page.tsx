import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { CategoryIcon } from "@/components/icons";
import { IntroSplash } from "@/components/IntroSplash";

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

      <IntroSplash />

      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-20 pb-16 border-b border-[var(--bg-2)] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, var(--accent-soft-bg) 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-3)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-fill)]" />
            Built for PC builders, not marketplace clutter
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
            Turn your old parts into{" "}
            <span className="text-[var(--gold-fill)]">someone else's build</span>.
          </h1>
          <p className="text-[var(--text-3)] text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Buy and sell GPUs, CPUs, and full rigs directly with other PC builders — with real
            specs, real condition, and real people, not a pile of furniture listings in the way.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/browse"
              className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="border border-[var(--border)] text-[var(--text-1)] font-semibold px-5 py-2.5 rounded-lg text-sm hover:border-[var(--border-strong)] transition-colors"
            >
              Sell a part
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-4 sm:px-6 py-14 border-b border-[var(--bg-2)]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft-bg)] text-[var(--accent-fill)] flex items-center justify-center mb-4 p-2">
              <CategoryIcon category="CPU" />
            </div>
            <h3 className="font-semibold mb-1.5 text-[var(--text-1)]">Built for PC parts</h3>
            <p className="text-sm text-[var(--text-4)] leading-relaxed">
              Real categories — GPU, CPU, motherboards, cooling — so you're not digging through
              strollers and couches to find a graphics card.
            </p>
          </div>
          <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft-bg)] text-[var(--accent-fill)] flex items-center justify-center mb-4 p-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-full h-full">
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1.5 text-[var(--text-1)]">Real specs, not vague ads</h3>
            <p className="text-sm text-[var(--text-4)] leading-relaxed">
              Brand, condition, and spec fields are built into every listing, so sellers can be
              precise about what's actually for sale.
            </p>
          </div>
          <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft-bg)] text-[var(--accent-fill)] flex items-center justify-center mb-4 p-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-full h-full">
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1.5 text-[var(--text-1)]">Local pickup or shipped</h3>
            <p className="text-sm text-[var(--text-4)] leading-relaxed">
              Listings show the seller's city, so you can arrange a local meetup or work out
              shipping directly with them.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 py-14 border-b border-[var(--bg-2)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-10 text-center text-[var(--text-1)]">How it works</h2>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div
              aria-hidden="true"
              className="hidden sm:block absolute top-5 left-[16.5%] right-[16.5%] h-px bg-[var(--border)]"
            />
            {[
              { n: "1", t: "Sign in", d: "Sign in with Google — no separate account to create." },
              { n: "2", t: "Browse or list", d: "Find a part you need, or list one you're done with." },
              { n: "3", t: "Buy or offer", d: "Buy now at the asking price, or send an offer to negotiate." },
            ].map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-1)] border-2 border-[var(--gold-fill)] flex items-center justify-center text-sm font-bold text-[var(--gold-fill)] mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold mb-1 text-[var(--text-1)]">{s.t}</h3>
                <p className="text-sm text-[var(--text-4)]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent listings teaser */}
      <section className="px-4 sm:px-6 py-14 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-1)]">Recently listed</h2>
            <Link href="/browse" className="text-sm text-[var(--teal-fill)] hover:text-[var(--teal-hover)] transition-colors">
              See all listings →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-[var(--border)] rounded-xl">
              <p className="text-[var(--text-3)] text-sm mb-1">No listings yet.</p>
              <p className="text-[var(--text-4)] text-sm mb-5">Be the first to list a part.</p>
              <Link
                href="/sell"
                className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
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
                  className="group bg-[var(--bg-1)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--border-strong)] transition-colors"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-3)] flex items-center justify-center">
                    {l.imageUrls.length > 0 ? (
                      <img src={l.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 text-[var(--text-5)]">
                        <CategoryIcon category={l.category} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-base font-bold text-[var(--text-1)]">
                      ${(l.priceCents / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--text-2)] truncate">{l.title}</div>
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
