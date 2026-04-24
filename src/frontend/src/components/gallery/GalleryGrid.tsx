import { Badge } from "@/components/ui/badge";
import { Eye, Video } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { MediaItem } from "../../types";
import { MediaLightbox } from "./MediaLightbox";

const HEIGHTS = [290, 370, 250, 330, 410, 265, 345, 305, 385, 255, 425, 315];

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
        data-ocid="gallery.empty_state"
      >
        <div className="w-20 h-20 rounded-full glass-effect flex items-center justify-center border border-border/30">
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
        data-ocid="gallery.list"
      >
        {items.map((item, index) => {
          const isFeatured = featuredIds.includes(item.id);
          const imgSrc = item.thumbnailUrl || item.url;
          const isHovered = hoveredId === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              className="break-inside-avoid mb-3"
              data-ocid={`gallery.item.${index + 1}`}
            >
              <button
                type="button"
                className={`relative group w-full overflow-hidden rounded-xl cursor-pointer block text-left ${
                  isFeatured
                    ? "ring-2 ring-primary/50 ring-offset-1 ring-offset-background"
                    : ""
                }`}
                style={{ height: `${HEIGHTS[index % HEIGHTS.length]}px` }}
                onClick={() => setLightboxIndex(index)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-label={`View ${item.title}`}
              >
                {/* Image with zoom on hover */}
                {imgSrc ? (
                  <motion.img
                    src={imgSrc}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    animate={{ scale: isHovered ? 1.08 : 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-card to-muted flex items-center justify-center">
                    <Eye className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}

                {/* Base gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Gold-tinted hover overlay */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: isHovered
                      ? "linear-gradient(to top, oklch(0.3 0.12 70 / 0.75) 0%, oklch(0.2 0.08 70 / 0.35) 40%, oklch(0.1 0.04 70 / 0.15) 100%)"
                      : "transparent",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Gold border glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: isHovered
                      ? "inset 0 0 0 2px oklch(0.7 0.22 70 / 0.7), 0 0 24px oklch(0.7 0.22 70 / 0.25)"
                      : "inset 0 0 0 0px transparent",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                  <p className="font-display text-sm font-semibold text-white leading-tight truncate drop-shadow-lg">
                    {item.title}
                  </p>
                  <motion.p
                    className="text-xs mt-0.5 font-medium"
                    animate={{
                      color: isHovered
                        ? "oklch(0.85 0.2 70)"
                        : "rgba(255,255,255,0.6)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.category}
                  </motion.p>
                </div>

                {/* Eye icon on hover */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full border-2 flex items-center justify-center backdrop-blur-sm"
                    style={{
                      borderColor: "oklch(0.7 0.22 70)",
                      background: "oklch(0.7 0.22 70 / 0.15)",
                    }}
                    animate={{ scale: isHovered ? 1 : 0.75 }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                    }}
                  >
                    <Eye className="w-6 h-6 text-primary" />
                  </motion.div>
                </motion.div>

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                  {item.type === "video" && (
                    <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm gap-1 text-xs py-0.5">
                      <Video className="w-3 h-3" />
                      Video
                    </Badge>
                  )}
                  {isFeatured && (
                    <Badge className="gradient-gold text-background border-0 text-xs py-0.5 shadow-glow-gold">
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
