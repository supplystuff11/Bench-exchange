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
    setSubmitting(true);
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
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
      setError(data.error || "Couldn't save changes");
      return;
    }
    router.push(`/listing/${listing.id}`);
  };

  const fieldClass =
    "w-full bg-[#171512] border border-[#3A362F] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#DD8A3E] transition-colors";
  const labelClass = "text-xs font-medium text-[#B8B1A3] mb-1.5 block";

  return (
    <div className="bg-[#211F1B] border border-[#3A362F] rounded-xl p-5">
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
          <label className={labelClass}>Spec summary</label>
          <input className={fieldClass} value={form.specs} onChange={set("specs")} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea className={fieldClass} rows={4} value={form.description} onChange={set("description")} />
        </div>

        {error && <p className="text-sm text-[#C96450]">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="bg-[#DD8A3E] text-[#1B1305] font-semibold px-4 py-3 rounded-lg hover:bg-[#E9974F] transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
