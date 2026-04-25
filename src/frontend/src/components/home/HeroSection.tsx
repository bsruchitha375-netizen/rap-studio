import { Link } from "@tanstack/react-router";
import { Camera, ChevronDown, Play, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCmsSection } from "../../hooks/useCmsContent";

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 17 + 3) % 100,
  y: (i * 23 + 7) % 100,
  size: (i % 4) + 1,
  duration: 7 + (i % 7),
  delay: (i % 5) * 1.1,
}));

const SHUTTER_BLADES = Array.from({ length: 8 }, (_, i) => i);

const FILM_IMAGES = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1583244532610-2cf4ba9e3f73?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=80&fit=crop",
];

const DEFAULT_HEADING = "Turning Visions Into Timeless Art";
const DEFAULT_SUBHEADING =
  "India's premier photography, videography & short film studio — where every frame becomes a masterpiece";
const DEFAULT_CTA = "Book a Session";
const DEFAULT_CTA_SECONDARY = "View Services";

const STATS = [
  ["500+", "Happy Clients"],
  ["23", "Services"],
  ["50+", "Courses"],
];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.72, 0.92]);

  const cmsHero = useCmsSection("hero");
  const [heading, setHeading] = useState(DEFAULT_HEADING);
  const [subheading, setSubheading] = useState(DEFAULT_SUBHEADING);
  const [ctaText, setCtaText] = useState(DEFAULT_CTA);
  const [ctaSecondaryText, setCtaSecondaryText] = useState(
    DEFAULT_CTA_SECONDARY,
  );

  useEffect(() => {
    const handleCmsUpdate = () => {
      try {
        const raw = localStorage.getItem("cms_hero");
        if (!raw) return;
        const data = JSON.parse(raw) as {
          heading?: string;
          subheading?: string;
          ctaText?: string;
          ctaSecondaryText?: string;
        };
        if (data.heading) setHeading(data.heading);
        if (data.subheading) setSubheading(data.subheading);
        if (data.ctaText) setCtaText(data.ctaText);
        if (data.ctaSecondaryText) setCtaSecondaryText(data.ctaSecondaryText);
      } catch {
        // ignore parse errors
      }
    };
    window.addEventListener("cms-updated", handleCmsUpdate);
    window.addEventListener("storage", handleCmsUpdate);
    handleCmsUpdate();
    return () => {
      window.removeEventListener("cms-updated", handleCmsUpdate);
      window.removeEventListener("storage", handleCmsUpdate);
    };
  }, []);

  useEffect(() => {
    if (cmsHero.heading) setHeading(cmsHero.heading);
    if (cmsHero.subheading) setSubheading(cmsHero.subheading);
    if (cmsHero.ctaText) setCtaText(cmsHero.ctaText);
    if (cmsHero.ctaSecondaryText) setCtaSecondaryText(cmsHero.ctaSecondaryText);
  }, [cmsHero]);

  const headingParts = heading.split(/\b(Timeless Art|Art|Visions|Studio)\b/);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      data-ocid="hero.section"
    >
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-studio-cinematic.dim_1920x1080.jpg'), url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80')",
          y: bgY,
        }}
      />

      {/* Dark cinematic overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.05 0.015 270 / 0.94) 0%, oklch(0.07 0.02 280 / 0.78) 50%, oklch(0.04 0.01 265 / 0.96) 100%)",
          opacity: overlayOpacity,
        }}
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 35%, oklch(0.04 0.01 270 / 0.85) 100%)",
        }}
      />

      {/* Gold light pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 55% 35% at 20% 70%, oklch(0.72 0.14 82 / 0.12) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.1, 0.35, 0.1] }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          background:
            "radial-gradient(ellipse 45% 45% at 80% 30%, oklch(0.68 0.2 290 / 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Top-left light leak */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 pointer-events-none"
        animate={{ opacity: [0.04, 0.16, 0.04], scale: [1, 1.12, 1] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.18 88 / 0.3) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Floating bokeh particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "oklch(0.72 0.14 82 / 0.8)"
                : p.id % 3 === 1
                  ? "oklch(0.68 0.2 290 / 0.6)"
                  : "oklch(0.9 0.01 280 / 0.4)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.9, 0.15],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Camera shutter decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="relative"
          style={{ width: 580, height: 580 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 75,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {SHUTTER_BLADES.map((blade) => (
            <div
              key={blade}
              className="absolute inset-0"
              style={{
                transform: `rotate(${blade * 45}deg)`,
                background:
                  "linear-gradient(0deg, oklch(0.72 0.14 82 / 0.05) 0%, transparent 50%)",
                clipPath: "polygon(50% 0%, 55% 50%, 50% 100%, 45% 50%)",
              }}
            />
          ))}
        </motion.div>
        {[0, 1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border pointer-events-none"
            style={{
              inset: `${-ring * 60}px`,
              borderColor: `oklch(0.72 0.14 82 / ${(0.1 - ring * 0.02).toString()})`,
            }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.25, 0.65, 0.25] }}
            transition={{
              duration: 4.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: ring * 1.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center gap-7 py-28"
        style={{ y: textY }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 px-5 py-2 rounded-full border"
          style={{
            borderColor: "oklch(0.72 0.14 82 / 0.4)",
            background: "oklch(0.08 0.01 270 / 0.75)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Sparkles size={13} className="text-primary" />
          <span className="section-label text-xs tracking-[2px]">
            RAP Integrated Studio
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="hero-text text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            textShadow: "0 2px 40px oklch(0 0 0 / 0.5)",
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {heading === DEFAULT_HEADING ? (
            <>
              Turning Visions Into{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "var(--gradient-gold)",
                  textShadow: "none",
                }}
              >
                Timeless Art
              </span>
            </>
          ) : (
            headingParts.map((part, i) =>
              i % 2 === 1 ? (
                <span
                  key={`hl-${part.slice(0, 8)}`}
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "var(--gradient-gold)",
                    textShadow: "none",
                  }}
                >
                  {part}
                </span>
              ) : (
                <span key={`pl-${part.slice(0, 8)}-${i}`}>{part}</span>
              ),
            )
          )}
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          className="text-xl md:text-2xl max-w-3xl leading-relaxed"
          style={{ color: "oklch(0.75 0.01 280)" }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {subheading}
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-10 py-1"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          {STATS.map(([num, label]) => (
            <div key={label} className="text-center">
              <div
                className="text-2xl font-bold"
                style={{
                  color: "oklch(0.82 0.16 88)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {num}
              </div>
              <div
                className="text-[10px] tracking-widest uppercase mt-0.5"
                style={{ color: "oklch(0.52 0.01 280)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mt-1"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.68 }}
        >
          <Link to="/booking" data-ocid="hero.book_cta.primary_button">
            <motion.button
              type="button"
              className="btn-primary-luxury flex items-center gap-2 text-base px-9 py-4 rounded-xl shadow-glow-gold"
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.96 }}
            >
              <Camera size={18} />
              {ctaText}
            </motion.button>
          </Link>
          <Link to="/services" data-ocid="hero.services_cta.secondary_button">
            <motion.button
              type="button"
              className="flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-base transition-smooth"
              style={{
                background: "oklch(0.12 0.012 275 / 0.65)",
                border: "1px solid oklch(0.28 0.018 275 / 0.7)",
                color: "oklch(0.78 0.008 280)",
                backdropFilter: "blur(10px)",
              }}
              whileHover={{
                scale: 1.07,
                borderColor: "oklch(0.72 0.14 82 / 0.55)",
                color: "oklch(0.92 0.01 280)",
              }}
              whileTap={{ scale: 0.96 }}
            >
              <Play size={15} />
              {ctaSecondaryText}
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Film strip */}
      <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, oklch(0.06 0.01 270 / 0.8), transparent)",
          }}
        />
        <motion.div
          className="flex gap-1.5 items-center relative"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 28,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {[
            ...FILM_IMAGES.map((src, i) => ({ src, key: `a-${i}-${src}` })),
            ...FILM_IMAGES.map((src, i) => ({ src, key: `b-${i}-${src}` })),
            ...FILM_IMAGES.map((src, i) => ({ src, key: `c-${i}-${src}` })),
          ].map(({ src, key }) => (
            <div
              key={key}
              className="flex-shrink-0 w-28 h-16 rounded-sm overflow-hidden border"
              style={{ borderColor: "oklch(0.72 0.14 82 / 0.22)" }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover opacity-50"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        style={{ color: "oklch(0.48 0.01 280)" }}
        animate={{ y: [0, 7, 0] }}
        transition={{
          duration: 2.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        initial={{ opacity: 0 }}
      >
        <span className="text-[10px] tracking-[3px] uppercase">Scroll</span>
        <ChevronDown size={18} />
      </motion.div>
    </section>
  );
}
