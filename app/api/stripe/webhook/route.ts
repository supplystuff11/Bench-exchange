import { NextRequest, NextResponse } from "next/server";
import { stripe, FEATURE_DURATION_DAYS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import Stripe from "stripe";

// Stripe requires the raw request body to verify the webhook signature, so
// this route must NOT run through any body-parsing middleware.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    // Feature-boost payments go through a separate flow from listing sales.
    if (checkoutSession.metadata?.type === "feature") {
      const listingId = checkoutSession.metadata.listingId;
      if (listingId) {
        const featuredUntil = new Date(Date.now() + FEATURE_DURATION_DAYS * 24 * 60 * 60 * 1000);
        const listing = await prisma.listing.update({
          where: { id: listingId },
          data: { featuredUntil },
        });
        await notify({
          userId: listing.sellerId,
          type: "LISTING_FEATURED",
          title: `"${listing.title}" is now featured`,
          body: `It'll show at the top of browse for ${FEATURE_DURATION_DAYS} days.`,
          link: `/listing/${listing.id}`,
        });
      }
      return NextResponse.json({ received: true });
    }

    const listingId = checkoutSession.metadata?.listingId;

    // Stripe only returns shipping_details when the session was created with
    // shipping_address_collection turned on (i.e. the buyer chose shipping).
    const shipping = (checkoutSession as any).shipping_details;
    const shippingAddress = shipping
      ? JSON.stringify({ name: shipping.name, address: shipping.address })
      : null;

    await prisma.order.updateMany({
      where: { stripeSessionId: checkoutSession.id },
      data: { status: "paid", ...(shippingAddress ? { shippingAddress } : {}) },
    });

    if (listingId) {
      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { status: "sold" },
      });
      await notify({
        userId: listing.sellerId,
        type: "LISTING_SOLD",
        title: `"${listing.title}" sold!`,
        body: `You've been paid via Stripe. Leave the buyer a review once you're set.`,
        link: `/orders`,
      });
    }
  }

  // If a checkout session expires unpaid (default: 24h), release the listing
  // back to active so it isn't stuck "pending" forever. Doesn't apply to
  // feature-boost sessions since those never touch listing.status.
  if (event.type === "checkout.session.expired") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    if (checkoutSession.metadata?.type === "feature") {
      return NextResponse.json({ received: true });
    }
    const listingId = checkoutSession.metadata?.listingId;

    await prisma.order.updateMany({
      where: { stripeSessionId: checkoutSession.id },
      data: { status: "refunded" },
    });
    if (listingId) {
      await prisma.listing.updateMany({
        where: { id: listingId, status: "pending" },
        data: { status: "active" },
      });
    }
  }

  // Consider also handling: charge.refunded, account.updated (to flip
  // stripeOnboarded once a seller finishes Connect onboarding).
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    if (account.details_submitted) {
      await prisma.user.updateMany({
        where: { stripeAccountId: account.id },
        data: { stripeOnboarded: true },
      });
    }
  }

  return NextResponse.json({ received: true });
}
