import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Your cut of every transaction. Change this one number to change your fee.
export const PLATFORM_FEE_PERCENT = 5;

export function platformFeeCents(amountCents: number) {
  return Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
}

// Featured/bumped listing pricing — pure platform revenue, no Connect split
// since this is a fee paid directly to you, not a marketplace transaction.
export const FEATURE_PRICE_CENTS = 500; // $5
export const FEATURE_DURATION_DAYS = 7;
