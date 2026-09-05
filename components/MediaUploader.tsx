"use client";

import { useState } from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function MediaUploader({
  images,
  videos,
  onChange,
}: {
  images: string[];
  videos: string[];
  onChange: (images: string[], videos: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async (file: File) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error("Media upload isn't configured yet — see .env setup.");
    }
    const isVideo = file.type.startsWith("video/");
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? "video" : "image"}/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(endpoint, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return { url: data.secure_url as string, isVideo };
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setUploading(true);
    const newImages = [...images];
    const newVideos = [...videos];
    try {
      for (const file of Array.from(fileList)) {
        const { url, isVideo } = await uploadFile(file);
        if (isVideo) newVideos.push(url);
        else newImages.push(url);
      }
      onChange(newImages, newVideos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => onChange(images.filter((i) => i !== url), videos);
  const removeVideo = (url: string) => onChange(images, videos.filter((v) => v !== url));

  return (
    <div>
      <label className="text-xs font-medium text-[var(--text-3)] mb-1.5 block">Photos & videos</label>
      <label className="flex items-center justify-center border border-dashed border-[var(--border)] rounded-lg py-6 text-sm text-[var(--text-4)] cursor-pointer hover:border-[var(--border-strong)] transition-colors">
        {uploading ? "Uploading..." : "Click to add photos or a video"}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>
      {error && <p className="text-sm text-[var(--danger-text)] mt-2">{error}</p>}

      {(images.length > 0 || videos.length > 0) && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {images.map((url) => (
            <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-[var(--border)]">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {videos.map((url) => (
            <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-[var(--border)] bg-black">
              <video src={url} className="w-full h-full object-cover" muted />
              <button
                type="button"
                onClick={() => removeVideo(url)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
