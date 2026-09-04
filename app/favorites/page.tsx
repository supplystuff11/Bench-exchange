import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import FavoriteButton from "@/components/FavoriteButton";
import { CategoryIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin?callbackUrl=/favorites");

  const favorites = await prisma.favorite.findMany({
    where: { userId: (session.user as any).id },
    include: { listing: { include: { seller: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-6">Favorites</h1>

        {favorites.length === 0 ? (
          <p className="text-sm text-[#736C5F]">Nothing saved yet — tap the heart on any listing.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((f) => (
              <Link
                key={f.id}
                href={`/listing/${f.listing.id}`}
                className="group bg-[#211F1B] border border-[#3A362F] rounded-xl overflow-hidden hover:border-[#544E44] transition-colors relative"
              >
                <div className="absolute top-2.5 right-2.5 z-10 text-lg">
                  <FavoriteButton listingId={f.listing.id} initialFavorited={true} />
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-[#2B2822] to-[#1C1A16] flex items-center justify-center">
                  {f.listing.imageUrls.length > 0 ? (
                    <img src={f.listing.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 text-[#4A4438]">
                      <CategoryIcon category={f.listing.category} />
                    </div>
                  )}
                </div>
                <div className="p-3.5">
                  <div className="text-lg font-bold text-[#F0EBE1] mb-0.5">
                    ${(f.listing.priceCents / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#D9D3C7] mb-1 truncate">{f.listing.title}</div>
                  {f.listing.status !== "active" && (
                    <div className="text-xs text-[#736C5F] uppercase">{f.listing.status}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
