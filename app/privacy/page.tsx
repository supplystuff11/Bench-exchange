import { SiteHeader } from "@/components/SiteHeader";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-10 text-sm leading-relaxed text-[#D9D3C7]">
        <h1 className="text-xl font-bold mb-1 text-[#F0EBE1]">Privacy Policy</h1>
        <p className="text-xs text-[#736C5F] mb-8">
          Draft template — have a lawyer review and customize this before relying on it,
          especially if you'll have users outside the US (GDPR, etc. may apply). Last updated:
          placeholder.
        </p>

        <section className="mb-6">
          <h2 className="font-semibold text-[#F0EBE1] mb-2">Information we collect</h2>
          <p>
            When you sign in with Google, we receive your name, email, and profile photo. When you
            list an item, message another user, make an offer, or complete a purchase, we store
            that information (listing details, messages, offer amounts, order records) to operate
            the marketplace.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[#F0EBE1] mb-2">Payment information</h2>
          <p>
            Payments are processed by Stripe. We do not store your card number or bank account
            details — Stripe handles that directly and shares only what's needed to confirm a
            payment (amount, status) with us.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[#F0EBE1] mb-2">How we use it</h2>
          <p>
            To show your listings to other users, connect buyers and sellers, process payments and
            payouts, send you notifications (in-app and, if configured, by email) about offers,
            messages, sales, and reviews, and to review reports submitted about listings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[#F0EBE1] mb-2">What other users can see</h2>
          <p>
            Your name and profile photo are visible on your listings and reviews. Your email is not
            shown to other users; messaging happens through the platform without exposing your
            email address.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[#F0EBE1] mb-2">Data retention</h2>
          <p>
            We keep account and transaction data for as long as your account is active, and as
            needed to comply with legal and tax obligations after that.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-[#F0EBE1] mb-2">Contact</h2>
          <p>Questions about this policy — add a contact email here before publishing.</p>
        </section>
      </main>
    </div>
  );
}
