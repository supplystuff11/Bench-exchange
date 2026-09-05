import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { Sidebar } from "@/components/Sidebar";
import { CATEGORIES } from "@/lib/categories";
import { CategoryIcon } from "@/components/icons";
import { buildQuery } from "@/lib/query";
import FavoriteButton from "@/components/FavoriteButton";
import SaveSearchButton from "@/components/SaveSearchButton";
import SearchBox from "@/components/SearchBox";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

export default async function BrowsePage({ searchParams }: { searchParams: SP }) {
  const activeCategory = (searchParams.category as string) || "All";
  const search = searchParams.search as string | undefined;
  const conditions = ([] as string[]).concat(searchParams.condition ?? []).filter(Boolean);
  const brand = searchParams.brand as string | undefined;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;

  let listings = await prisma.listing.findMany({
    where: {
      status: "active",
      ...(activeCategory !== "All" ? { category: activeCategory } : {}),
      ...(conditions.length ? { condition: { in: conditions } } : {}),
      ...(brand ? { brand } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            priceCents: {
              ...(minPrice !== undefined ? { gte: Math.round(minPrice * 100) } : {}),
              ...(maxPrice !== undefined ? { lte: Math.round(maxPrice * 100) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { specs: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { name: true } } },
  });

  // Featured (boosted) listings float to the top, newest first within each group.
  const now = new Date();
  listings = [...listings].sort((a, b) => {
    const aFeatured = a.featuredUntil && a.featuredUntil > now ? 1 : 0;
    const bFeatured = b.featuredUntil && b.featuredUntil > now ? 1 : 0;
    return bFeatured - aFeatured;
  });

  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as any).id : null;
  let favoritedIds = new Set<string>();
  if (userId) {
    const favs = await prisma.favorite.findMany({ where: { userId }, select: { listingId: true } });
    favoritedIds = new Set(favs.map((f) => f.listingId));
  }

  const mobileCatHref = (c: string) => {
    const qs = buildQuery(searchParams, { category: c === "All" ? undefined : c });
    return qs ? `/browse?${qs}` : "/browse";
  };

  const searchForm = (
    <SearchBox
      initialSearch={search}
      activeCategory={activeCategory}
      brand={brand}
      minPrice={minPrice}
      maxPrice={maxPrice}
      conditions={conditions}
    />
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader search={searchForm} />

      {/* Mobile category chips */}
      <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b border-[var(--bg-2)]">
        <Link
          href={mobileCatHref("All")}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            activeCategory === "All"
              ? "bg-[var(--accent-fill)] text-[var(--accent-on)] border-[var(--accent-fill)]"
              : "border-[var(--border)] text-[var(--text-3)]"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={mobileCatHref(c)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === c
                ? "bg-[var(--accent-fill)] text-[var(--accent-on)] border-[var(--accent-fill)]"
                : "border-[var(--border)] text-[var(--text-3)]"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="flex flex-1">
        <Sidebar searchParams={searchParams} />

        <main className="flex-1 px-4 sm:px-6 py-6 flex flex-col">
          <div className="flex items-baseline justify-between mb-5">
            <h1 className="text-lg font-semibold text-[var(--text-1)]">
              {activeCategory === "All" ? "All listings" : activeCategory}
            </h1>
            <div className="flex items-center gap-3">
              {userId && (
                <SaveSearchButton
                  category={activeCategory !== "All" ? activeCategory : undefined}
                  brand={brand}
                  search={search}
                  minPrice={minPrice !== undefined ? Math.round(minPrice * 100) : undefined}
                  maxPrice={maxPrice !== undefined ? Math.round(maxPrice * 100) : undefined}
                />
              )}
              <span className="text-sm text-[var(--text-4)]">
                {listings.length} listing{listings.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-1)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--text-4)]">
                <CategoryIcon category={activeCategory} className="w-6 h-6" />
              </div>
              <p className="text-[var(--text-3)] text-sm mb-1">No listings match your filters.</p>
              <p className="text-[var(--text-4)] text-sm mb-6">Try widening your search, or list something yourself.</p>
              <Link
                href="/sell"
                className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
              >
                Sell a part
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((l) => (
                <Link
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="group bg-[var(--bg-1)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--border-strong)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition-all relative"
                >
                  {userId && (
                    <div className="absolute top-2.5 right-2.5 z-10 text-lg">
                      <FavoriteButton listingId={l.id} initialFavorited={favoritedIds.has(l.id)} />
                    </div>
                  )}
                  <div className="aspect-[4/3] bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-3)] flex items-center justify-center relative">
                    {l.imageUrls.length > 0 ? (
                      <img src={l.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 text-[var(--text-5)]">
                        <CategoryIcon category={l.category} />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-wide bg-[var(--bg-0)]/80 backdrop-blur text-[var(--text-3)] px-2 py-1 rounded-md">
                      {l.condition}
                    </span>
                    {l.featuredUntil && l.featuredUntil > now && (
                      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-wide bg-[var(--gold-fill)] text-[var(--gold-on)] px-2 py-1 rounded-md">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="text-lg font-bold text-[var(--text-1)] mb-0.5">
                      ${(l.priceCents / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--text-2)] mb-1 truncate">{l.title}</div>
                    <div className="flex items-center justify-between text-xs text-[var(--text-4)]">
                      <span>{l.brand} · {l.category}</span>
                      {l.city && <span>{l.city}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
