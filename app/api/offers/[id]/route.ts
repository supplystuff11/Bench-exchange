import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

// PATCH /api/offers/[id]  { action: "accept" | "decline" }
// Only the seller on the listing can accept/decline. Accepting doesn't
// charge anyone by itself — it just lets the buyer complete checkout at
// the offer price instead of the list price.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  if (offer.listing.sellerId !== userId) {
    return NextResponse.json({ error: "Only the seller can respond to this offer" }, { status: 403 });
  }
  if (offer.status !== "pending") {
    return NextResponse.json({ error: "This offer has already been resolved" }, { status: 400 });
  }

  const { action } = await req.json();
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await prisma.offer.update({
    where: { id: offer.id },
    data: { status: action === "accept" ? "accepted" : "declined" },
  });

  await notify({
    userId: offer.buyerId,
    type: action === "accept" ? "OFFER_ACCEPTED" : "OFFER_DECLINED",
    title:
      action === "accept"
        ? `Your offer on "${offer.listing.title}" was accepted`
        : `Your offer on "${offer.listing.title}" was declined`,
    body:
      action === "accept"
        ? `Complete the purchase at $${(offer.amountCents / 100).toLocaleString()}.`
        : undefined,
    link: action === "accept" ? `/listing/${offer.listingId}?offerId=${offer.id}` : `/inbox?box=sent`,
  });

  return NextResponse.json({ ok: true });
}
