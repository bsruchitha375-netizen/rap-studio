import { Link } from "@tanstack/react-router";
import { Camera, ChevronDown, Crown, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCmsSection } from "../../hooks/useCmsContent";

// Pure CSS bokeh particles — no images needed
const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  x: (i * 17 + 3) % 100,
  y: (i * 23 + 7) % 100,
  size: 2 + (i % 5),
  duration: 6 + (i % 8),
  delay: (i % 6) * 0.9,
  color:
    i % 4 === 0
      ? "oklch(0.82 0.18 82 / 0.8)"
      : i % 4 === 1
        ? "oklch(0.68 0.2 290 / 0.6)"
        : i % 4 === 2
          ? "oklch(0.66 0.18 180 / 0.55)"
          : "oklch(0.92 0.01 80 / 0.4)",
}));

const SHUTTER_BLADES = Array.from({ length: 8 }, (_, i) => i);

const FILM_GRADIENT_COLORS = [
  "linear-gradient(135deg, oklch(0.2 0.04 70), oklch(0.15 0.03 80))",
  "linear-gradient(135deg, oklch(0.18 0.04 290), oklch(0.14 0.03 280))",
  "linear-gradient(135deg, oklch(0.22 0.04 30), oklch(0.16 0.03 40))",
  "linear-gradient(135deg, oklch(0.18 0.04 190), oklch(0.14 0.03 180))",
  "linear-gradient(135deg, oklch(0.2 0.04 70), oklch(0.15 0.03 65))",
  "linear-gradient(135deg, oklch(0.16 0.04 155), oklch(0.13 0.03 145))",
  "linear-gradient(135deg, oklch(0.22 0.05 82), oklch(0.17 0.04 75))",
  "linear-gradient(135deg, oklch(0.18 0.04 250), oklch(0.14 0.03 260))",
];

const DEFAULT_HEADING = "Turning Visions Into Timeless Art";
const DEFAULT_SUBHEADING =
  "India's premier photography, videography & short film studio — where every frame becomes a masterpiece";
const DEFAULT_CTA = "Book a Session";
const DEFAULT_CTA_SECONDARY = "Explore Courses";

const STATS = [
  ["500+", "Happy Clients"],
  ["23", "Services"],
  ["50+", "Courses"],
];

const FOUNDERS = [
  { name: "Ruchitha B S", initial: "R", color: "oklch(0.72 0.14 82)" },
  { name: "Ashitha S", initial: "A", color: "oklch(0.72 0.2 290)" },
  { name: "Prarthana R", initial: "P", color: "oklch(0.66 0.18 180)" },
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

  const isDefaultHeading = heading === DEFAULT_HEADING;

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      data-ocid="hero.section"
    >
      {/* Multi-layer cinematic background */}
      <motion.div
        className="absolute inset-0 scale-110"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.07 0.025 265) 0%, oklch(0.1 0.035 280) 35%, oklch(0.08 0.02 295) 65%, oklch(0.06 0.015 270) 100%)",
          y: bgY,
        }}
      />

      {/* Cinematic overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.05 0.015 270 / 0.9) 0%, oklch(0.08 0.025 285 / 0.65) 50%, oklch(0.04 0.01 265 / 0.95) 100%)",
          opacity: overlayOpacity,
        }}
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 30%, oklch(0.04 0.01 270 / 0.9) 100%)",
        }}
      />

      {/* Gold ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 55% 35% at 20% 70%, oklch(0.72 0.14 82 / 0.15) 0%, transparent 70%)",
        }}
      />
      {/* Teal accent glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.08, 0.28, 0.08] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          background:
            "radial-gradient(ellipse 45% 40% at 75% 25%, oklch(0.66 0.18 180 / 0.12) 0%, transparent 70%)",
        }}
      />
      {/* Violet glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.06, 0.22, 0.06] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
        style={{
          background:
            "radial-gradient(ellipse 40% 45% at 85% 60%, oklch(0.68 0.2 290 / 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Top-left gold light leak */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 pointer-events-none"
        animate={{ opacity: [0.04, 0.18, 0.04], scale: [1, 1.12, 1] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.18 88 / 0.35) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Coral accent top-right */}
      <motion.div
        className="absolute -top-10 -right-10 w-64 h-64 pointer-events-none"
        animate={{ opacity: [0.02, 0.1, 0.02], scale: [1, 1.15, 1] }}
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 6,
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.22 25 / 0.3) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Floating CSS bokeh particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{
            y: [0, -35, 0],
            opacity: [0.12, 1, 0.12],
            scale: [1, 1.6, 1],
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
                  "linear-gradient(0deg, oklch(0.72 0.14 82 / 0.06) 0%, transparent 50%)",
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
            borderColor: "oklch(0.72 0.14 82 / 0.45)",
            background: "oklch(0.08 0.01 270 / 0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Sparkles size={13} className="text-primary" />
          <span className="section-label text-xs tracking-[2px]">
            RAP Integrated Studio
          </span>
          <Crown size={11} style={{ color: "oklch(0.72 0.14 82)" }} />
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
          {isDefaultHeading ? (
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
            heading
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
          <Link to="/courses" data-ocid="hero.courses_cta.secondary_button">
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
              {ctaSecondaryText}
            </motion.button>
          </Link>
        </motion.div>

        {/* Founders credits */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "oklch(0.42 0.008 280)" }}
          >
            Founded by
          </span>
          <div className="flex items-center gap-2">
            {FOUNDERS.map((f, i) => (
              <motion.div
                key={f.name}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
                style={{
                  borderColor: `${f.color.replace(")", " / 0.3)")}`,
                  background: `${f.color.replace(")", " / 0.08)")}`,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{ background: f.color, color: "oklch(0.08 0.01 270)" }}
                >
                  {f.initial}
                </div>
                <span
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: f.color }}
                >
                  {f.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Film strip — pure CSS gradient tiles */}
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
            ...FILM_GRADIENT_COLORS.map((bg, i) => ({ bg, key: `a-${i}` })),
            ...FILM_GRADIENT_COLORS.map((bg, i) => ({ bg, key: `b-${i}` })),
            ...FILM_GRADIENT_COLORS.map((bg, i) => ({ bg, key: `c-${i}` })),
          ].map(({ bg, key }) => (
            <div
              key={key}
              className="flex-shrink-0 w-28 h-16 rounded-sm border opacity-40"
              style={{
                background: bg,
                borderColor: "oklch(0.72 0.14 82 / 0.22)",
              }}
            />
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
