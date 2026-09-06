import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BuyButton from "@/components/BuyButton";
import MakeOfferButton from "@/components/MakeOfferButton";
import OfferCheckoutButton from "@/components/OfferCheckoutButton";
import FavoriteButton from "@/components/FavoriteButton";
import StarRating from "@/components/StarRating";
import MessageSellerButton from "@/components/MessageSellerButton";
import ReportListingButton from "@/components/ReportListingButton";
import { CategoryIcon } from "@/components/icons";
import { SiteHeader } from "@/components/SiteHeader";
import ListingGallery from "@/components/ListingGallery";
import { getRatings } from "@/lib/ratings";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { offerId?: string };
}) {
  const session = await getServerSession(authOptions);
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { seller: { select: { name: true, id: true } } },
  });

  if (!listing) return notFound();

  const userId = session?.user ? (session.user as any).id : null;
  const isOwner = userId === listing.sellerId;

  const sellerRatings = await getRatings(listing.sellerId);

  let favorited = false;
  if (userId) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: listing.id } },
    });
    favorited = !!fav;
  }

  // If we're returning from an accepted offer, show the "complete purchase
  // at $X" button instead of the regular Buy button.
  let acceptedOffer: { id: string; amountCents: number } | null = null;
  if (searchParams.offerId) {
    const offer = await prisma.offer.findUnique({ where: { id: searchParams.offerId } });
    if (offer && offer.status === "accepted" && offer.buyerId === userId) {
      acceptedOffer = offer;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">
        <Link href="/browse" className="text-sm text-[var(--text-4)] hover:text-[var(--text-1)] transition-colors">
          ← Back to listings
        </Link>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
          {/* Left column */}
          <div>
            <ListingGallery
              images={listing.imageUrls}
              videos={listing.videoUrls}
              category={listing.category}
            />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide bg-[var(--bg-1)] border border-[var(--border)] text-[var(--text-3)] px-2.5 py-1 rounded-md">
                  {listing.condition}
                </span>
                {listing.featuredUntil && listing.featuredUntil > new Date() && (
                  <span className="text-xs font-semibold uppercase tracking-wide bg-[var(--gold-soft-bg)] text-[var(--gold-fill)] px-2.5 py-1 rounded-md">
                    Featured
                  </span>
                )}
                <span className="text-xs text-[var(--text-4)]">
                  {listing.brand} · {listing.category}
                </span>
              </div>
              {!isOwner && userId && <FavoriteButton listingId={listing.id} className="text-xl" />}
            </div>

            <h1 className="text-2xl font-bold mb-2 text-[var(--text-1)]">{listing.title}</h1>
            {listing.specs && (
              <p className="text-sm text-[var(--text-3)] font-mono mb-6">{listing.specs}</p>
            )}

            <div className="border-t border-[var(--bg-2)] pt-6">
              <h2 className="text-sm font-semibold mb-2 text-[var(--text-3)]">Description</h2>
              <p className="leading-relaxed text-[var(--text-2)] whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Right column — sticky purchase panel */}
          <div className="md:sticky md:top-24 h-fit">
            <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-3xl font-bold text-[var(--accent-fill)] mb-1">
                ${(listing.priceCents / 100).toLocaleString()}
              </div>
              {listing.city && (
                <div className="text-sm text-[var(--text-4)] mb-1">{listing.city}</div>
              )}
              <div className="text-xs text-[var(--text-4)] mb-5">
                {listing.shipsAvailable ? "Local pickup or shipping available" : "Local pickup only"}
              </div>

              {isOwner ? (
                <div className="text-sm text-[var(--text-4)] bg-[var(--bg-0)] border border-[var(--border)] rounded-lg px-3 py-3 text-center">
                  <p className="mb-2">This is your listing.</p>
                  <Link
                    href={`/listing/${listing.id}/edit`}
                    className="text-[var(--accent-fill)] font-semibold hover:text-[var(--accent-hover)] transition-colors"
                  >
                    Edit listing →
                  </Link>
                </div>
              ) : listing.status === "sold" ? (
                <p className="text-sm text-[var(--text-4)] bg-[var(--bg-0)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-center">
                  This listing has sold.
                </p>
              ) : listing.status === "pending" ? (
                <p className="text-sm text-[var(--text-4)] bg-[var(--bg-0)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-center">
                  A purchase is in progress on this listing.
                </p>
              ) : acceptedOffer ? (
                <OfferCheckoutButton offerId={acceptedOffer.id} amountCents={acceptedOffer.amountCents} />
              ) : (
                <div className="flex flex-col gap-2">
                  <BuyButton listingId={listing.id} shipsAvailable={listing.shipsAvailable} />
                  <MakeOfferButton listingId={listing.id} askingPriceCents={listing.priceCents} />
                  <MessageSellerButton listingId={listing.id} />
                </div>
              )}

              {!isOwner && (
                <div className="mt-3">
                  <ReportListingButton listingId={listing.id} />
                </div>
              )}

              <div className="border-t border-[var(--bg-2)] mt-5 pt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-sm font-semibold text-[var(--text-3)] shrink-0">
                  {(listing.seller.name || "S").charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <Link href={`/profile/${listing.seller.id}`} className="text-[var(--text-1)] hover:text-[var(--accent-fill)] transition-colors">
                    {listing.seller.name || "A seller"}
                  </Link>
                  <StarRating avg={sellerRatings.seller.avg} count={sellerRatings.seller.count} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
