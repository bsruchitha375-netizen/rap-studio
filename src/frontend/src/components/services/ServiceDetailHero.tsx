import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import type { ServiceCategory } from "../../types";

interface ServiceDetailHeroProps {
  service: ServiceCategory;
}

const CATEGORY_IMAGES: Record<string, string> = {
  "couple-shoot":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=85",
  "single-shoot":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=85",
  "wedding-shoot":
    "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=1200&q=85",
  "fashion-shoot":
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85",
  "corporate-shoot":
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85",
  "product-commercial":
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=85",
  "event-shoot":
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=85",
  drone:
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&q=85",
  "real-estate":
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=85",
  automobile:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=85",
  videography:
    "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=1200&q=85",
  "short-films":
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=85",
  "youtube-content":
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=85",
  ads: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=85",
  animation:
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1200&q=85",
  "social-media":
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=85",
  podcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=85",
  "audio-production":
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=85",
  "family-shoot":
    "https://images.unsplash.com/photo-1478476868527-002ae3f3e159?w=1200&q=85",
  "kids-baby-shoot":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=85",
  "travel-destination":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=85",
  "creative-artistic":
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=85",
  "fitness-lifestyle":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=85",
  "pet-photography":
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=85",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=85";

const CATEGORY_COLORS: Record<string, string> = {
  "couple-shoot": "70",
  "wedding-shoot": "70",
  "single-shoot": "290",
  "fashion-shoot": "290",
  "family-shoot": "150",
  "kids-baby-shoot": "150",
  videography: "220",
  "event-shoot": "30",
  "corporate-shoot": "200",
  "product-commercial": "200",
  "real-estate": "180",
  "travel-destination": "200",
  "creative-artistic": "290",
  "fitness-lifestyle": "30",
  "pet-photography": "150",
  automobile: "25",
  "ecommerce-brand": "70",
  "food-restaurant": "30",
  educational: "200",
  "medical-healthcare": "200",
  entertainment: "290",
  "social-media": "290",
  "special-occasion": "70",
};

// Pre-computed particle positions for stable keys
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: (i * 6 + 5) % 95,
  top: (i * 8 + 10) % 90,
  size: (i % 3) + 2,
  duration: 3 + (i % 4),
  delay: (i % 4) * 0.8,
}));

export function ServiceDetailHero({ service }: ServiceDetailHeroProps) {
  const hue = CATEGORY_COLORS[service.id] ?? "70";
  const imgSrc = CATEGORY_IMAGES[service.id] ?? DEFAULT_IMAGE;
  const [imgLoaded, setImgLoaded] = useState(false);

  // Parallax scroll
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-[55vh] flex items-center"
    >
      {/* Parallax background image */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        {/* Shimmer while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={imgSrc}
          alt={service.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.6s ease",
            transform: "scale(1.1)",
          }}
        />
      </motion.div>

      {/* Multi-layer dark gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `
            linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.2) 100%),
            radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.3 0.12 ${hue} / 0.45), transparent 70%)
          `,
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: `oklch(0.7 0.22 ${hue} / 0.7)`,
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.15, 0.7, 0.15],
            }}
            transition={{
              duration: p.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Content with parallax scroll */}
      <motion.div
        className="container mx-auto px-6 py-24 relative z-20 text-center"
        style={{ y: textY, opacity }}
      >
        {/* Emoji with entrance animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-6"
        >
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl border-2"
            style={{
              background: `oklch(0.15 0.04 ${hue} / 0.8)`,
              borderColor: `oklch(0.7 0.22 ${hue} / 0.5)`,
              boxShadow: `0 0 40px oklch(0.7 0.22 ${hue} / 0.3)`,
              backdropFilter: "blur(8px)",
            }}
          >
            {service.emoji}
          </div>
        </motion.div>

        <motion.h1
          className="font-display text-4xl md:text-6xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            textShadow: `0 0 60px oklch(0.7 0.22 ${hue} / 0.5), 0 2px 20px rgba(0,0,0,0.8)`,
          }}
        >
          {service.name}
        </motion.h1>

        <motion.p
          className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}
        >
          {service.description}
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-4 mt-8 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span
            className="px-5 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm"
            style={{
              background: `oklch(0.7 0.22 ${hue} / 0.15)`,
              borderColor: `oklch(0.7 0.22 ${hue} / 0.5)`,
              color: `oklch(0.9 0.15 ${hue})`,
              boxShadow: `0 0 20px oklch(0.7 0.22 ${hue} / 0.15)`,
            }}
          >
            {service.subServices.length} Sub-Services
          </span>
          <span
            className="px-5 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm"
            style={{
              background: `oklch(0.7 0.22 ${hue} / 0.15)`,
              borderColor: `oklch(0.7 0.22 ${hue} / 0.5)`,
              color: `oklch(0.9 0.15 ${hue})`,
              boxShadow: `0 0 20px oklch(0.7 0.22 ${hue} / 0.15)`,
            }}
          >
            Starting ₹5
          </span>
          <span
            className="px-5 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm text-white/80 border-white/20"
            style={{
              background: "rgba(255,255,255,0.08)",
            }}
          >
            Professional Studio
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
