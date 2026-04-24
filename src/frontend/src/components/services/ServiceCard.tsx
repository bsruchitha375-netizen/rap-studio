import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ServiceCategory } from "../../types";

interface ServiceCardProps {
  service: ServiceCategory;
  onClick: () => void;
}

const SERVICE_IMAGES: Record<string, string> = {
  "couple-shoot":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  "single-shoot":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  "wedding-shoot":
    "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=400&q=80",
  "fashion-shoot":
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
  "corporate-shoot":
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
  "product-commercial":
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
  "event-shoot":
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
  drone:
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&q=80",
  "real-estate":
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80",
  automobile:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80",
  videography:
    "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=400&q=80",
  "short-films":
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80",
  "youtube-content":
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
  ads: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80",
  animation:
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80",
  "social-media":
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80",
  podcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80",
  "audio-production":
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
  "family-shoot":
    "https://images.unsplash.com/photo-1478476868527-002ae3f3e159?w=400&q=80",
  "kids-baby-shoot":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
  "travel-destination":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80",
  "creative-artistic":
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
  "fitness-lifestyle":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
  "pet-photography":
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "ecommerce-brand":
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
  "food-restaurant":
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  educational:
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&q=80",
  "medical-healthcare":
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&q=80",
  entertainment:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
  "special-occasion":
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=80",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&q=80";

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imgSrc = SERVICE_IMAGES[service.id] ?? DEFAULT_IMAGE;

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="cursor-pointer relative rounded-2xl overflow-hidden group"
      style={{
        height: 230,
        border: isHovered
          ? "1.5px solid oklch(0.7 0.22 70 / 0.7)"
          : "1px solid oklch(var(--border) / 0.5)",
        boxShadow: isHovered
          ? "0 0 24px oklch(0.7 0.22 70 / 0.2), 0 12px 40px rgba(0,0,0,0.35)"
          : "0 6px 20px rgba(0,0,0,0.2)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      data-ocid="service.card"
    >
      {/* Shimmer loading state */}
      {!imgLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse z-10" />
      )}

      {/* Background image with zoom on hover */}
      <motion.img
        src={imgSrc}
        alt={service.name}
        loading="lazy"
        onLoad={() => setImgLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover"
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Dark gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isHovered
            ? "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Emoji icon — top right */}
      <div className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-xl border border-white/10 shadow-md">
        {service.emoji}
      </div>

      {/* Sub-service count badge — top left */}
      <div className="absolute top-3 left-3 z-20">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(0.7 0.22 70 / 0.15)",
            border: "1px solid oklch(0.7 0.22 70 / 0.4)",
            color: "oklch(0.85 0.18 70)",
            backdropFilter: "blur(8px)",
          }}
        >
          {service.subServices.length} options
        </span>
      </div>

      {/* Text at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <h3
          className="font-display font-bold text-white text-base leading-tight truncate drop-shadow-lg"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {service.name}
        </h3>
        <p className="text-white/70 text-xs mt-0.5 line-clamp-1 drop-shadow">
          {service.description}
        </p>

        {/* View Details button slides up on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22 }}
              className="mt-2 w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-smooth"
              style={{
                background: "var(--gradient-gold)",
                color: "oklch(0.12 0.02 70)",
              }}
              data-ocid="service.view_details_button"
            >
              View Details →
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
