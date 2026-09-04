import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, FEATURE_PRICE_CENTS, FEATURE_DURATION_DAYS } from "@/lib/stripe";

// POST /api/feature/checkout  { listingId }
// Straight Stripe Checkout, no Connect transfer — this fee is yours, not
// split with the seller (even though the seller and buyer are the same
// person here: a seller paying to boost their own listing).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const { listingId } = await req.json();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.sellerId !== userId) {
    return NextResponse.json({ error: "You can only feature your own listings" }, { status: 403 });
  }
  if (listing.status !== "active") {
    return NextResponse.json({ error: "Only active listings can be featured" }, { status: 400 });
  }

  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Feature "${listing.title}" for ${FEATURE_DURATION_DAYS} days` },
          unit_amount: FEATURE_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/my-listings?feature=success`,
    cancel_url: `${origin}/my-listings?feature=cancelled`,
    metadata: {
      type: "feature",
      listingId: listing.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
