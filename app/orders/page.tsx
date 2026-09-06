import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import ReviewForm from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin?callbackUrl=/orders");
  const userId = (session.user as any).id;

  const purchases = await prisma.order.findMany({
    where: { buyerId: userId, status: "paid" },
    include: { listing: true, reviews: true },
    orderBy: { createdAt: "desc" },
  });

  const sales = await prisma.order.findMany({
    where: { listing: { sellerId: userId }, status: "paid" },
    include: { listing: true, buyer: true, reviews: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-6 text-[var(--text-1)]">Orders</h1>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-[var(--text-4)] uppercase mb-3">Purchases</h2>
          {purchases.length === 0 ? (
            <p className="text-sm text-[var(--text-4)]">No purchases yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {purchases.map((o) => {
                const alreadyReviewed = o.reviews.some((r) => r.role === "SELLER");
                return (
                  <div key={o.id} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--bg-1)]">
                    <Link href={`/listing/${o.listingId}`} className="font-semibold hover:text-[var(--accent-fill)] transition-colors">
                      {o.listing.title}
                    </Link>
                    <p className="text-sm text-[var(--text-4)] mb-2">{money(o.amountCents)}</p>
                    {alreadyReviewed ? (
                      <p className="text-xs text-[var(--success-text)]">You reviewed the seller</p>
                    ) : (
                      <ReviewForm orderId={o.id} role="SELLER" label="Rate the seller" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[var(--text-4)] uppercase mb-3">Sales</h2>
          {sales.length === 0 ? (
            <p className="text-sm text-[var(--text-4)]">No sales yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sales.map((o) => {
                const alreadyReviewed = o.reviews.some((r) => r.role === "BUYER");
                return (
                  <div key={o.id} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--bg-1)]">
                    <Link href={`/listing/${o.listingId}`} className="font-semibold hover:text-[var(--accent-fill)] transition-colors">
                      {o.listing.title}
                    </Link>
                    <p className="text-sm text-[var(--text-4)] mb-2">
                      {money(o.amountCents)} · sold to {o.buyer.name || "a buyer"}
                      {o.shippingCents > 0
                        ? ` (includes $${(o.shippingCents / 100).toFixed(2)} shipping)`
                        : ""}
                    </p>
                    {o.shippingAddress &&
                      (() => {
                        try {
                          const s = JSON.parse(o.shippingAddress);
                          const a = s.address || {};
                          return (
                            <p className="text-sm text-[var(--text-3)] mb-2 bg-[var(--bg-2)] rounded-md px-3 py-2">
                              Ship to: {s.name}
                              <br />
                              {a.line1}
                              {a.line2 ? `, ${a.line2}` : ""}
                              <br />
                              {a.city}, {a.state} {a.postal_code}
                            </p>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    {alreadyReviewed ? (
                      <p className="text-xs text-[var(--success-text)]">You reviewed the buyer</p>
                    ) : (
                      <ReviewForm orderId={o.id} role="BUYER" label="Rate the buyer" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
