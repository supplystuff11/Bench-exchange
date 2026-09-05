import { SiteHeader } from "@/components/SiteHeader";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-10 text-sm leading-relaxed text-[var(--text-2)]">
        <h1 className="text-xl font-bold mb-1 text-[var(--text-1)]">Terms of Service</h1>
        <p className="text-xs text-[var(--text-4)] mb-8">
          Draft template — have a lawyer review and customize this before relying on it. Last
          updated: placeholder.
        </p>

        <section className="mb-6">
          <h2 className="font-semibold text-[var(--text-1)] mb-2">1. What Voltra is</h2>
          <p>
            Voltra is a platform that lets buyers and sellers connect to trade PC parts and
            builds. We are not a party to the sale between a buyer and a seller — we provide the
            listing, messaging, offer, and payment-processing tools, but the buyer and seller are
            solely responsible for the transaction between them, including the condition,
            description accuracy, and delivery of any item.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[var(--text-1)] mb-2">2. Accounts</h2>
          <p>
            You must sign in with a valid account to buy, sell, message, or leave reviews. You're
            responsible for the accuracy of your listings and for the security of your account.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[var(--text-1)] mb-2">3. Fees</h2>
          <p>
            Voltra charges a percentage-based platform fee on completed sales, and an
            optional flat fee for featured/bumped listings. Fees are disclosed before you complete
            a purchase or feature a listing.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[var(--text-1)] mb-2">4. Prohibited items and conduct</h2>
          <p>
            No stolen goods, counterfeit items, or anything illegal to sell in your jurisdiction.
            No harassment, scams, or fraudulent listings. We may remove listings or suspend accounts
            that violate these terms, using the reports submitted by other users as one signal among
            others.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[var(--text-1)] mb-2">5. Disputes</h2>
          <p>
            Disputes between a buyer and seller (item not as described, item not received, etc.)
            are between those two parties. Voltra does not currently offer a formal
            escrow or dispute-resolution process — buy and sell in good faith, and use the
            messaging and review tools to communicate and hold each other accountable.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-[var(--text-1)] mb-2">6. Limitation of liability</h2>
          <p>
            Voltra is provided "as is." We are not liable for the condition of items sold
            through the platform, for the conduct of buyers or sellers, or for losses arising from
            transactions made here.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-[var(--text-1)] mb-2">7. Changes</h2>
          <p>We may update these terms from time to time. Continued use of the platform means you accept the current version.</p>
        </section>
      </main>
    </div>
  );
}
