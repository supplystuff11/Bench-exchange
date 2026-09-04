"use client";

import { useState } from "react";
import { CategoryIcon } from "@/components/icons";

type MediaItem = { url: string; type: "image" | "video" };

export default function ListingGallery({
  images,
  videos,
  category,
}: {
  images: string[];
  videos: string[];
  category: string;
}) {
  const media: MediaItem[] = [
    ...images.map((url) => ({ url, type: "image" as const })),
    ...videos.map((url) => ({ url, type: "video" as const })),
  ];
  const [active, setActive] = useState(0);

  if (media.length === 0) {
    return (
      <div className="aspect-[16/10] bg-gradient-to-br from-[#2B2822] to-[#1C1A16] rounded-xl border border-[#3A362F] flex items-center justify-center mb-6">
        <div className="w-20 h-20 text-[#4A4438]">
          <CategoryIcon category={category} />
        </div>
      </div>
    );
  }

  const current = media[active];

  return (
    <div className="mb-6">
      <div className="aspect-[16/10] bg-black rounded-xl border border-[#3A362F] overflow-hidden flex items-center justify-center">
        {current.type === "image" ? (
          <img src={current.url} alt="" className="w-full h-full object-contain" />
        ) : (
          <video src={current.url} controls className="w-full h-full" />
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {media.map((m, i) => (
            <button
              key={m.url}
              onClick={() => setActive(i)}
              className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border ${
                i === active ? "border-[#DD8A3E]" : "border-[#3A362F]"
              }`}
            >
              {m.type === "image" ? (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" muted />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
