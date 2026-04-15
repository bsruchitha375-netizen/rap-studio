import { Badge } from "@/components/ui/badge";
import { Eye, Video } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { MediaItem } from "../../types";
import { MediaLightbox } from "./MediaLightbox";

const HEIGHTS = [280, 360, 240, 320, 400, 260, 340, 300, 380, 250, 420, 310];

interface GalleryGridProps {
  items: MediaItem[];
  isLoading?: boolean;
  featuredIds?: string[];
}

export function GalleryGrid({
  items,
  isLoading = false,
  featuredIds = [],
}: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
        {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"].map(
          (sk, i) => (
            <div key={sk} className="break-inside-avoid mb-3">
              <div
                className="w-full rounded-xl bg-card/60 animate-pulse"
                style={{ height: `${HEIGHTS[i % HEIGHTS.length]}px` }}
              />
            </div>
          ),
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-4"
        data-ocid="gallery-empty"
      >
        <div className="w-20 h-20 rounded-full bg-card/60 border border-border/30 flex items-center justify-center">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">
          No items in this category yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3"
        data-ocid="gallery-grid"
      >
        {items.map((item, index) => {
          const isFeatured = featuredIds.includes(item.id);
          const imgSrc = item.thumbnailUrl || item.url;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              className="break-inside-avoid mb-3"
            >
              <button
                type="button"
                className={`relative group w-full overflow-hidden rounded-xl cursor-pointer block text-left ${
                  isFeatured ? "ring-2 ring-primary/60" : ""
                }`}
                style={{ height: `${HEIGHTS[index % HEIGHTS.length]}px` }}
                onClick={() => setLightboxIndex(index)}
                aria-label={`View ${item.title}`}
                data-ocid={`gallery-item-${item.id}`}
              >
                {/* Image */}
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-card to-muted flex items-center justify-center">
                    <Eye className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}

                {/* Always-visible bottom gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom info — always visible */}
                <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                  <p className="font-display text-sm font-semibold text-white leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {item.category}
                  </p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/60 flex items-center justify-center backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {item.type === "video" && (
                    <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm gap-1 text-xs py-0.5">
                      <Video className="w-3 h-3" />
                      Video
                    </Badge>
                  )}
                  {isFeatured && (
                    <Badge className="gradient-gold text-background border-0 text-xs py-0.5">
                      ★ Featured
                    </Badge>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
