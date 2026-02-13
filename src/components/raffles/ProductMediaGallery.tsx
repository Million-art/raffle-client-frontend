"use client";

import { useState, useMemo } from "react";
import type { RaffleDetail } from "@/services/raffles.service";

interface ProductMediaGalleryProps {
  raffle: RaffleDetail;
  className?: string;
}

function getMediaItems(raffle: RaffleDetail): { url: string; type: "image" | "video" }[] {
  if (raffle.media && raffle.media.length > 0) {
    return raffle.media.map((m) => ({
      url: m.url,
      type: (m.type || "image") as "image" | "video",
    }));
  }
  const items: { url: string; type: "image" | "video" }[] = [];
  if (raffle.imageUrl) items.push({ url: raffle.imageUrl, type: "image" });
  if (raffle.videoUrl) items.push({ url: raffle.videoUrl, type: "video" });
  return items;
}

export function ProductMediaGallery({ raffle, className = "" }: ProductMediaGalleryProps) {
  const items = useMemo(() => getMediaItems(raffle), [raffle]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected = items[selectedIndex];

  if (items.length === 0) {
    return (
      <div className={`flex aspect-[16/9] w-full items-center justify-center bg-white/5 text-slate-500 italic ${className}`}>
        No product media
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main large view */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
        {selected.type === "video" ? (
          <video
            src={selected.url}
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
            poster={raffle.imageUrl}
            key={selected.url}
          />
        ) : (
          <img src={selected.url} alt={raffle.name} className="h-full w-full object-contain" />
        )}
      </div>

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={item.url + i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`flex-shrink-0 h-14 w-14 overflow-hidden rounded-lg border-2 transition-all ${
                selectedIndex === i
                  ? "border-primary-500 ring-2 ring-primary-500/30"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
