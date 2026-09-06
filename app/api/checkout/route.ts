import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, platformFeeCents } from "@/lib/stripe";
import { getShippingRate } from "@/lib/shippo";

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

  const { listingId, offerId, ship, toZip } = await req.json();

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

  // Shipping only applies to a listing (not to a pre-negotiated offer amount)
  // and only if the seller enabled it. We never trust a price sent from the
  // browser — the rate is looked up again here, server-side, right before
  // charging, using the ZIP the buyer entered.
  const wantsShipping = !!ship && listing.shipsAvailable;
  let shippingCents = 0;

  if (wantsShipping) {
    if (!toZip || !/^\d{5}$/.test(toZip)) {
      return NextResponse.json({ error: "A valid ZIP code is required for shipping" }, { status: 400 });
    }
    if (!listing.shipFromZip || !listing.weightLbs) {
      return NextResponse.json({ error: "This listing isn't fully set up for shipping" }, { status: 400 });
    }
    const rate = await getShippingRate({
      fromZip: listing.shipFromZip,
      toZip,
      weightLbs: listing.weightLbs,
      packageSize: listing.packageSize || "medium",
    });
    if (!rate) {
      return NextResponse.json(
        { error: "Couldn't get a shipping rate right now — try again in a moment" },
        { status: 502 }
      );
    }
    shippingCents = rate.cents;
  }

  const itemPriceCents = offerPriceCents ?? listing.priceCents;
  const totalCents = itemPriceCents + shippingCents;
  // Platform fee is calculated on the full charge — item plus shipping —
  // since shipping is paid through Stripe like everything else, not handed
  // to the seller outside the app.
  const fee = platformFeeCents(totalCents);
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const lineItems = [
    {
      price_data: {
        currency: "usd",
        product_data: { name: listing.title },
        unit_amount: itemPriceCents,
      },
      quantity: 1,
    },
  ];
  if (shippingCents > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Shipping" },
        unit_amount: shippingCents,
      },
      quantity: 1,
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    ...(wantsShipping ? { shipping_address_collection: { allowed_countries: ["US"] } } : {}),
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
        amountCents: totalCents,
        shippingCents,
        platformFeeCents: fee,
        stripeSessionId: checkoutSession.id,
        status: "pending",
      },
    }),
  ]);

  return NextResponse.json({ url: checkoutSession.url });
}
