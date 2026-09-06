"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { brandsForCategory } from "@/lib/brands";
import MediaUploader from "@/components/MediaUploader";

const CONDITIONS = ["New", "Like new", "Used", "For parts"];

type Listing = {
  id: string;
  title: string;
  category: string;
  brand: string;
  condition: string;
  priceCents: number;
  shipsAvailable: boolean;
  shipFromZip: string | null;
  weightLbs: number | null;
  packageSize: string | null;
  city: string | null;
  specs: string | null;
  description: string;
  imageUrls: string[];
  videoUrls: string[];
};

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: listing.title,
    category: listing.category,
    brand: listing.brand,
    condition: listing.condition,
    price: String(listing.priceCents / 100),
    city: listing.city ?? "",
    specs: listing.specs ?? "",
    description: listing.description,
  });
  const [canShip, setCanShip] = useState(listing.shipsAvailable);
  const [shipFromZip, setShipFromZip] = useState(listing.shipFromZip ?? "");
  const [weightLbs, setWeightLbs] = useState(listing.weightLbs != null ? String(listing.weightLbs) : "");
  const [packageSize, setPackageSize] = useState(listing.packageSize ?? "medium");
  const [images, setImages] = useState<string[]>(listing.imageUrls ?? []);
  const [videos, setVideos] = useState<string[]>(listing.videoUrls ?? []);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCategoryChange = (e: any) => {
    const category = e.target.value;
    setForm((f) => ({ ...f, category, brand: brandsForCategory(category)[0] }));
  };

  const submit = async () => {
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      setError("Fill in a title, price, and description.");
      return;
    }
    if (canShip && (!/^\d{5}$/.test(shipFromZip) || !weightLbs)) {
      setError("Enter a valid ZIP code and package weight for shipping.");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
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
      setError(data.error || "Couldn't save changes");
      return;
    }
    router.push(`/listing/${listing.id}`);
  };

  const fieldClass =
    "w-full bg-[var(--bg-0)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-fill)] transition-colors";
  const labelClass = "text-xs font-medium text-[var(--text-3)] mb-1.5 block";

  return (
    <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex flex-col gap-4">
        <MediaUploader images={images} videos={videos} onChange={(i, v) => { setImages(i); setVideos(v); }} />

        <div>
          <label className={labelClass}>Title</label>
          <input className={fieldClass} value={form.title} onChange={set("title")} />
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
            <input className={fieldClass} type="number" value={form.price} onChange={set("price")} />
          </div>
          <div className="flex-1">
            <label className={labelClass}>City</label>
            <input className={fieldClass} value={form.city} onChange={set("city")} />
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
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Spec summary</label>
          <input className={fieldClass} value={form.specs} onChange={set("specs")} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea className={fieldClass} rows={4} value={form.description} onChange={set("description")} />
        </div>

        {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-4 py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
