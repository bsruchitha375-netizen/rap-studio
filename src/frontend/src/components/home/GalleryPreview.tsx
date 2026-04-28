import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import type { MediaItem } from "../../types";
import { MediaLightbox } from "../gallery/MediaLightbox";

const PREVIEW_ITEMS: MediaItem[] = [
  {
    id: "gp1",
    title: "Golden Hour Wedding",
    category: "Weddings",
    url: "",
    thumbnailUrl: "",
    type: "image",
    createdAt: BigInt(0),
  },
  {
    id: "gp2",
    title: "Fashion Editorial",
    category: "Photography",
    url: "",
    thumbnailUrl: "",
    type: "image",
    createdAt: BigInt(0),
  },
  {
    id: "gp3",
    title: "Cinematic Film Set",
    category: "Videography",
    url: "",
    thumbnailUrl: "",
    type: "video",
    createdAt: BigInt(0),
  },
  {
    id: "gp4",
    title: "Corporate Keynote",
    category: "Corporate",
    url: "",
    thumbnailUrl: "",
    type: "image",
    createdAt: BigInt(0),
  },
  {
    id: "gp5",
    title: "Dramatic Portrait",
    category: "Portraits",
    url: "",
    thumbnailUrl: "",
    type: "image",
    createdAt: BigInt(0),
  },
  {
    id: "gp6",
    title: "Short Film BTS",
    category: "Short Films",
    url: "",
    thumbnailUrl: "",
    type: "video",
    createdAt: BigInt(0),
  },
];

// Rich multi-color gradient tiles — no external images
const TILE_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.28 0.08 70) 0%, oklch(0.2 0.06 82) 50%, oklch(0.18 0.05 75) 100%)",
  "linear-gradient(135deg, oklch(0.22 0.08 290) 0%, oklch(0.18 0.06 280) 50%, oklch(0.16 0.05 295) 100%)",
  "linear-gradient(135deg, oklch(0.24 0.08 180) 0%, oklch(0.18 0.06 190) 50%, oklch(0.16 0.05 175) 100%)",
  "linear-gradient(135deg, oklch(0.22 0.07 30) 0%, oklch(0.17 0.05 40) 50%, oklch(0.15 0.04 25) 100%)",
  "linear-gradient(135deg, oklch(0.25 0.08 82) 0%, oklch(0.2 0.06 70) 50%, oklch(0.17 0.05 88) 100%)",
  "linear-gradient(135deg, oklch(0.22 0.07 155) 0%, oklch(0.17 0.05 145) 50%, oklch(0.15 0.04 160) 100%)",
];

const TILE_EMOJIS = ["💑", "📸", "🎥", "🏢", "🎭", "🎬"];

// Accent overlay colors per tile for shimmer effect
const TILE_ACCENTS = [
  "oklch(0.72 0.14 82)",
  "oklch(0.68 0.2 290)",
  "oklch(0.66 0.18 180)",
  "oklch(0.72 0.2 30)",
  "oklch(0.72 0.14 82)",
  "oklch(0.68 0.2 155)",
];

export function GalleryPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section
      className="py-24 bg-muted/15 border-t border-border/10 relative overflow-hidden"
      ref={ref}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 30% 60%, oklch(0.66 0.18 180 / 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-3">Our Portfolio</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Work That{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-gold)" }}
            >
              Speaks
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Capturing moments across weddings, portraits, fashion, films and
            corporate events — with cinematic precision.
          </p>
        </motion.div>

        {/* 6-tile masonry-style preview */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          data-ocid="gallery_preview.list"
        >
          {PREVIEW_ITEMS.map((item, index) => {
            const isHovered = hoveredId === item.id;
            const grad = TILE_GRADIENTS[index];
            const emoji = TILE_EMOJIS[index];
            const accent = TILE_ACCENTS[index];
            const tall = index === 0 || index === 4;

            return (
              <motion.button
                key={item.id}
                type="button"
                className="relative rounded-2xl overflow-hidden cursor-pointer text-left border"
                style={{
                  background: grad,
                  height: tall ? 240 : 185,
                  borderColor: isHovered
                    ? `${accent.replace(")", " / 0.6)")}`
                    : "oklch(0.3 0.02 280 / 0.3)",
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setHoveredId(item.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => setLightboxIndex(index)}
                aria-label={`View ${item.title}`}
                data-ocid={`gallery_preview.item.${index + 1}`}
              >
                {/* Noise texture overlay */}
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                  }}
                />

                {/* Large emoji decoration */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <span
                    className="text-7xl opacity-15"
                    style={{ filter: "blur(2px)" }}
                  >
                    {emoji}
                  </span>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                {/* Gold/accent hover overlay */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: isHovered
                      ? `linear-gradient(to top, ${accent.replace(")", " / 0.6)")} 0%, ${accent.replace(")", " / 0.15)")} 50%, transparent 100%)`
                      : "transparent",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Border glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: isHovered
                      ? `inset 0 0 0 2px ${accent.replace(")", " / 0.7)")}, 0 0 24px ${accent.replace(")", " / 0.22)")}`
                      : "inset 0 0 0 0px transparent",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Eye icon on hover */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: accent,
                      background: `${accent.replace(")", " / 0.15)")}`,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Eye className="w-5 h-5" style={{ color: accent }} />
                  </div>
                </motion.div>

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                  <p className="font-display text-sm font-semibold text-white leading-tight truncate drop-shadow-lg">
                    {item.title}
                  </p>
                  <motion.p
                    className="text-xs mt-0.5 font-medium"
                    animate={{
                      color: isHovered ? accent : "rgba(255,255,255,0.55)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.category}
                  </motion.p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            type="button"
            onClick={() => void navigate({ to: "/gallery" })}
            className="btn-primary-luxury px-10 py-4 text-base inline-flex items-center gap-2"
            data-ocid="gallery_preview.view_all_button"
          >
            <Eye size={16} />
            Explore Full Gallery
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <MediaLightbox
          items={PREVIEW_ITEMS}
          gradients={TILE_GRADIENTS}
          emojis={TILE_EMOJIS}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
