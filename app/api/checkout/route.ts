import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, platformFeeCents } from "@/lib/stripe";

// POST /api/checkout  { listingId, offerId? }
// Creates a Stripe Checkout Session. The payment goes to the buyer's card,
// Stripe splits it automatically: your platform fee comes to your main
// account, the rest transfers to the seller's connected account.
// If offerId is supplied (an accepted offer), checkout happens at the
// offer amount instead of the listing's list price.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const { listingId, offerId } = await req.json();

  let offer = null as Awaited<ReturnType<typeof prisma.offer.findUnique>> | null;
  let offerPriceCents: number | undefined;

  if (offerId) {
    offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer || offer.status !== "accepted" || offer.buyerId !== userId) {
      return NextResponse.json({ error: "This offer isn't valid for checkout" }, { status: 400 });
    }
    offerPriceCents = offer.amountCents;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: offer ? offer.listingId : listingId },
    include: { seller: true },
  });

  if (!listing || listing.status !== "active") {
    return NextResponse.json({ error: "Listing is not available" }, { status: 404 });
  }
  if (!listing.seller.stripeAccountId || !listing.seller.stripeOnboarded) {
    return NextResponse.json(
      { error: "This seller hasn't finished payout setup yet" },
      { status: 400 }
    );
  }
  if (listing.sellerId === userId) {
    return NextResponse.json({ error: "You can't buy your own listing" }, { status: 400 });
  }

  const priceCents = offerPriceCents ?? listing.priceCents;
  const fee = platformFeeCents(priceCents);
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: listing.title },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee,
      transfer_data: { destination: listing.seller.stripeAccountId },
    },
    success_url: `${origin}/listing/${listing.id}?purchase=success`,
    cancel_url: `${origin}/listing/${listing.id}?purchase=cancelled`,
    metadata: {
      listingId: listing.id,
      buyerId: userId,
    },
  });

  // Mark the listing pending immediately so a second buyer can't also start
  // checkout on it while this payment is in flight (the listing previously
  // stayed "active" until the webhook fired, which allowed a double-sell).
  await prisma.$transaction([
    prisma.listing.updateMany({
      where: { id: listing.id, status: "active" },
      data: { status: "pending" },
    }),
    prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: userId,
        amountCents: priceCents,
        platformFeeCents: fee,
        stripeSessionId: checkoutSession.id,
        status: "pending",
      },
    }),
  ]);

  return NextResponse.json({ url: checkoutSession.url });
}
