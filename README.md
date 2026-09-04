# Bench Exchange

A marketplace for buying and selling PC parts and whole builds, with a 5%
platform fee taken automatically out of every sale via Stripe Connect.

## How the money works

- Sellers sign in and complete a one-time **Stripe Express onboarding** flow
  (`/sell` → "Set up seller payouts"). This creates a Stripe connected
  account for them.
- When a buyer clicks **Buy now**, they're sent to a Stripe Checkout page.
- Stripe splits the payment automatically: your **5% fee** (set in
  `lib/stripe.ts` as `PLATFORM_FEE_PERCENT`) goes to your Stripe account,
  the rest transfers to the seller's connected account.
- You never touch or hold customer money directly — Stripe does, which
  keeps you out of money-transmission licensing territory.

## Local setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Database** — create a free Postgres database (Supabase, Neon, or
   Railway all have free tiers) and copy the connection string into
   `.env` as `DATABASE_URL`. Copy `.env.example` to `.env` first.

3. **Run migrations**
   ```
   npx prisma migrate dev --name init
   ```

4. **Google sign-in** — create OAuth credentials at
   console.cloud.google.com, set the redirect URI to
   `http://localhost:3000/api/auth/callback/google`, and fill in
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

5. **Stripe** — create a Stripe account, switch to **test mode**, copy your
   test API keys into `.env`. In the Stripe dashboard, enable **Connect**
   under Settings (choose "Express" accounts, platform type "Marketplace").

6. **Stripe webhook (local)** — install the Stripe CLI, then run:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

7. **Run it**
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Going live

1. **Deploy** — push this to GitHub, then import it into
   [Vercel](https://vercel.com). Add all your `.env` values as Vercel
   environment variables (use your **production** Postgres URL and, when
   ready, your **live** Stripe keys — not the test ones).
2. **Domain** — buy a domain and attach it in the Vercel project settings.
   Update `NEXTAUTH_URL` to your real domain.
3. **Stripe webhook (production)** — in the Stripe dashboard, add a webhook
   endpoint pointing at `https://yourdomain.com/api/stripe/webhook`,
   subscribed to at least `checkout.session.completed` and
   `account.updated`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET` on Vercel.
4. **Apply for Stripe Connect** — Stripe reviews platforms before you can
   take live payments through Connect. Fill out the platform profile in
   the Stripe dashboard (what the marketplace is, how payments flow).
5. **Legal basics** — add real Terms of Service and a Privacy Policy
   before accepting live transactions. Consider forming an LLC. This
   project doesn't include either — get them reviewed by a lawyer,
   especially around buyer/seller disputes and refunds.

## What's intentionally left simple (next steps)

- **No escrow / delayed payout** — sellers are paid the moment checkout
  completes. Many marketplaces hold funds until the buyer confirms
  delivery to cut down on fraud; Stripe supports this via manual payouts
  or `transfer_data` scheduling, but it adds complexity worth adding once
  you have real volume.
- **No reviews or ratings** — worth adding before trust becomes an issue.
- **No image uploads** — listings are text-only; add a storage bucket
  (Supabase Storage, S3, or Vercel Blob) and an `images` field on
  `Listing` when ready.
- **No messaging between buyer and seller** — add a simple `Message`
  model, or start by just showing the seller's email after purchase.
