import { prisma } from "@/lib/prisma";
import { getRatings } from "@/lib/ratings";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import StarRating from "@/components/StarRating";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return notFound();

  const ratings = await getRatings(user.id);

  const [sellerReviews, buyerReviews] = await Promise.all([
    prisma.review.findMany({
      where: { targetId: user.id, role: "SELLER" },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { targetId: user.id, role: "BUYER" },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#2B2822] flex items-center justify-center text-lg font-semibold text-[#B8B1A3] shrink-0">
            {(user.name || "S").charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold">{user.name || "Bench Exchange member"}</h1>
        </div>

        <div className="flex flex-col gap-2 mb-10">
          <StarRating avg={ratings.seller.avg} count={ratings.seller.count} label="As seller:" />
          <StarRating avg={ratings.buyer.avg} count={ratings.buyer.count} label="As buyer:  " />
        </div>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-[#736C5F] uppercase mb-3">Reviews as seller</h2>
          {sellerReviews.length === 0 ? (
            <p className="text-sm text-[#736C5F]">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sellerReviews.map((r) => (
                <div key={r.id} className="border border-[#3A362F] rounded-lg p-3 bg-[#211F1B]">
                  <div className="text-[#DD8A3E] text-sm mb-1">{"★".repeat(r.rating)}</div>
                  {r.comment && <p className="text-sm mb-1">{r.comment}</p>}
                  <p className="text-xs text-[#736C5F]">— {r.author.name || "a buyer"}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[#736C5F] uppercase mb-3">Reviews as buyer</h2>
          {buyerReviews.length === 0 ? (
            <p className="text-sm text-[#736C5F]">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {buyerReviews.map((r) => (
                <div key={r.id} className="border border-[#3A362F] rounded-lg p-3 bg-[#211F1B]">
                  <div className="text-[#DD8A3E] text-sm mb-1">{"★".repeat(r.rating)}</div>
                  {r.comment && <p className="text-sm mb-1">{r.comment}</p>}
                  <p className="text-xs text-[#736C5F]">— {r.author.name || "a seller"}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
