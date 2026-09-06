"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CATEGORIES } from "@/lib/categories";
import { brandsForCategory } from "@/lib/brands";
import { SiteHeader } from "@/components/SiteHeader";
import MediaUploader from "@/components/MediaUploader";

const CONDITIONS = ["New", "Like new", "Used", "For parts"];

export default function SellPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const stripeOnboarded = !!(session?.user as any)?.stripeOnboarded;
  const [form, setForm] = useState({
    title: "",
    category: "GPU",
    brand: brandsForCategory("GPU")[0],
    condition: "Used",
    price: "",
    city: "",
    specs: "",
    description: "",
  });
  const [canShip, setCanShip] = useState(false);
  const [shipFromZip, setShipFromZip] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [packageSize, setPackageSize] = useState("medium");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCategoryChange = (e: any) => {
    const category = e.target.value;
    setForm((f) => ({ ...f, category, brand: brandsForCategory(category)[0] }));
  };

  const startPayoutSetup = async () => {
    const res = await fetch("/api/connect/onboard", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setError(data.error || "Couldn't start payout setup");
  };

  const submit = async () => {
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      setError("Fill in a title, price, and description.");
      return;
    }
    setSubmitting(true);
    if (canShip && (!/^\d{5}$/.test(shipFromZip) || !weightLbs)) {
      setError("Enter a valid ZIP code and package weight for shipping.");
      setSubmitting(false);
      return;
    }
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        priceCents: Math.round(Number(form.price) * 100),
        shipsAvailable: canShip,
        shipFromZip: canShip ? shipFromZip : null,
        weightLbs: canShip ? Number(weightLbs) : null,
        packageSize: canShip ? packageSize : null,
        imageUrls: images,
        videoUrls: videos,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Couldn't publish listing");
      return;
    }
    router.push(`/listing/${data.id}`);
  };

  const fieldClass =
    "w-full bg-[var(--bg-0)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-fill)] transition-colors";
  const labelClass = "text-xs font-medium text-[var(--text-3)] mb-1.5 block";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-10">
        <h1 className="text-xl font-bold mb-1.5 text-[var(--text-1)]">List an item</h1>
        {stripeOnboarded ? (
          <p className="text-sm text-[var(--success-text)] mb-8">Payouts are set up — you're ready to sell.</p>
        ) : (
          <>
            <p className="text-sm text-[var(--text-4)] mb-6">
              Before your first sale, set up payouts so Stripe knows where to send your money.
            </p>
            <button
              onClick={startPayoutSetup}
              className="text-sm text-[var(--teal-fill)] hover:text-[var(--teal-hover)] transition-colors mb-8 block"
            >
              Set up seller payouts →
            </button>
          </>
        )}

        <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex flex-col gap-4">
            <MediaUploader images={images} videos={videos} onChange={(i, v) => { setImages(i); setVideos(v); }} />

            <div>
              <label className={labelClass}>Title</label>
              <input
                className={fieldClass}
                placeholder="e.g. Radeon RX 6600 8GB"
                value={form.title}
                onChange={set("title")}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelClass}>Category</label>
                <select className={fieldClass} value={form.category} onChange={handleCategoryChange}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Brand</label>
                <select className={fieldClass} value={form.brand} onChange={set("brand")}>
                  {brandsForCategory(form.category).map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Condition</label>
              <select className={fieldClass} value={form.condition} onChange={set("condition")}>
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelClass}>Price (USD)</label>
                <input
                  className={fieldClass}
                  type="number"
                  placeholder="150"
                  value={form.price}
                  onChange={set("price")}
                />
              </div>
              <div className="flex-1">
                <label className={labelClass}>City</label>
                <input
                  className={fieldClass}
                  placeholder="Shelby, MI"
                  value={form.city}
                  onChange={set("city")}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={canShip}
                  onChange={(e) => setCanShip(e.target.checked)}
                  className="accent-[var(--accent-fill)]"
                />
                This item can be shipped
              </label>
              {canShip && (
                <div className="flex flex-col gap-2 mt-1">
                  <input
                    className={fieldClass}
                    placeholder="Ship-from ZIP code"
                    value={shipFromZip}
                    onChange={(e) => setShipFromZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  />
                  <input
                    className={fieldClass}
                    type="number"
                    step="0.1"
                    placeholder="Package weight (lbs)"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                  />
                  <select
                    className={fieldClass}
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value)}
                  >
                    <option value="small">Small box (RAM, small parts)</option>
                    <option value="medium">Medium box (GPU, motherboard)</option>
                    <option value="large">Large box (full build, case)</option>
                  </select>
                  <p className="text-xs text-[var(--text-4)]">
                    Buyers get a real, live shipping quote at checkout based on their ZIP and this
                    weight/size — you don't set a shipping price yourself.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Spec summary</label>
              <input
                className={fieldClass}
                placeholder="8GB, used 6 months"
                value={form.specs}
                onChange={set("specs")}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={fieldClass}
                placeholder="Condition details, reason for selling, anything a buyer should know..."
                rows={4}
                value={form.description}
                onChange={set("description")}
              />
            </div>

            {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

            <button
              onClick={submit}
              disabled={submitting}
              className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-4 py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish listing"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
