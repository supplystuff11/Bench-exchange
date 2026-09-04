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
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        priceCents: Math.round(Number(form.price) * 100),
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
    "w-full bg-[#171512] border border-[#3A362F] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#DD8A3E] transition-colors";
  const labelClass = "text-xs font-medium text-[#B8B1A3] mb-1.5 block";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-10">
        <h1 className="text-xl font-bold mb-1.5">List an item</h1>
        {stripeOnboarded ? (
          <p className="text-sm text-[#6FCF97] mb-8">Payouts are set up — you're ready to sell.</p>
        ) : (
          <>
            <p className="text-sm text-[#736C5F] mb-6">
              Before your first sale, set up payouts so Stripe knows where to send your money.
            </p>
            <button
              onClick={startPayoutSetup}
              className="text-sm text-[#4FBFB0] hover:text-[#5FD3C3] transition-colors mb-8 block"
            >
              Set up seller payouts →
            </button>
          </>
        )}

        <div className="bg-[#211F1B] border border-[#3A362F] rounded-xl p-5">
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

            {error && <p className="text-sm text-[#C96450]">{error}</p>}

            <button
              onClick={submit}
              disabled={submitting}
              className="bg-[#DD8A3E] text-[#1B1305] font-semibold px-4 py-3 rounded-lg hover:bg-[#E9974F] transition-colors disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish listing"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
