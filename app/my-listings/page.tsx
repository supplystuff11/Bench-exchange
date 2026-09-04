import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { CategoryIcon } from "@/components/icons";
import RemoveListingButton from "@/components/RemoveListingButton";
import ListingActions from "@/components/ListingActions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { active: "Active", pending: "Pending", sold: "Sold", removed: "Removed" };
const STATUS_CLASS: Record<string, string> = {
  active: "bg-[#1F3A2E] text-[#6FCF97]",
  pending: "bg-[#3A2E12] text-[#DD8A3E]",
  sold: "bg-[#2B2822] text-[#B8B1A3]",
  removed: "bg-[#3A2320] text-[#C96450]",
};

export default async function MyListingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-5">
          <p className="text-[#B8B1A3] mb-4">Sign in to see your listings.</p>
          <a
            href="/api/auth/signin?callbackUrl=/my-listings"
            className="bg-[#DD8A3E] text-[#1B1305] font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#E9974F] transition-colors"
          >
            Sign in
          </a>
        </main>
      </div>
    );
  }

  const listings = await prisma.listing.findMany({
    where: { sellerId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-xl font-bold">My listings</h1>
          <Link href="/sell" className="text-sm text-[#4FBFB0] hover:text-[#5FD3C3] transition-colors">
            + New listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#3A362F] rounded-xl">
            <p className="text-[#B8B1A3] text-sm mb-1">You haven't listed anything yet.</p>
            <Link href="/sell" className="text-sm text-[#DD8A3E]">
              List your first part →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((l) => (
              <div
                key={l.id}
                className="flex flex-col gap-2.5 bg-[#211F1B] border border-[#3A362F] rounded-xl p-3.5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#2B2822] to-[#1C1A16] flex items-center justify-center shrink-0 overflow-hidden">
                    {l.imageUrls.length > 0 ? (
                      <img src={l.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 text-[#4A4438]">
                        <CategoryIcon category={l.category} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link
                        href={`/listing/${l.id}`}
                        className="font-medium truncate hover:text-[#DD8A3E] transition-colors"
                      >
                        {l.title}
                      </Link>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
                          STATUS_CLASS[l.status] || "bg-[#2B2822] text-[#B8B1A3]"
                        }`}
                      >
                        {STATUS_LABEL[l.status] || l.status}
                      </span>
                      {l.featuredUntil && l.featuredUntil > new Date() && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 bg-[#3A2E12] text-[#DD8A3E]">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#736C5F] truncate">
                      ${(l.priceCents / 100).toLocaleString()} · {l.brand} · {l.category}
                    </div>
                  </div>
                  {l.status === "active" && (
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/listing/${l.id}/edit`}
                        className="text-sm text-[#B8B1A3] hover:text-[#F0EBE1] transition-colors"
                      >
                        Edit
                      </Link>
                      <RemoveListingButton listingId={l.id} />
                    </div>
                  )}
                </div>

                {l.status !== "removed" && (
                  <div className="pl-[4.5rem]">
                    <ListingActions
                      listingId={l.id}
                      status={l.status}
                      featured={!!l.featuredUntil && l.featuredUntil > new Date()}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
