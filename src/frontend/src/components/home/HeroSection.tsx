import { Link } from "@tanstack/react-router";
import { Camera, ChevronDown, Play } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
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

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.7, 0.9]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      data-ocid="hero.section"
    >
      {/* Parallax background image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80')",
          y: bgY,
        }}
      />

      {/* Cinematic dark overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.06 0.02 280 / 0.92) 0%, oklch(0.08 0.025 290 / 0.78) 50%, oklch(0.05 0.015 270 / 0.95) 100%)",
          opacity: overlayOpacity,
        }}
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, oklch(0.04 0.01 280 / 0.8) 100%)",
        }}
      />

      {/* Animated gradient pulses */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 25% 65%, oklch(0.7 0.22 70 / 0.1) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.15, 0.45, 0.15] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 75% 35%, oklch(0.68 0.2 290 / 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Light leak */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 pointer-events-none"
        animate={{ opacity: [0.05, 0.18, 0.05], scale: [1, 1.1, 1] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.2 70 / 0.25) 0%, transparent 70%)",
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
                ? "oklch(0.7 0.22 70 / 0.8)"
                : p.id % 3 === 1
                  ? "oklch(0.68 0.2 290 / 0.6)"
                  : "oklch(0.9 0.01 280 / 0.5)",
          }}
          animate={{
            y: [0, -35, 0],
            opacity: [0.2, 1, 0.2],
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
          style={{ width: 560, height: 560 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 70,
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
                  "linear-gradient(0deg, oklch(0.7 0.22 70 / 0.04) 0%, transparent 50%)",
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
              inset: `${-ring * 55}px`,
              borderColor: `oklch(0.7 0.22 70 / ${(0.1 - ring * 0.02).toString()})`,
            }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: ring * 1.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center gap-6 py-24"
        style={{ y: textY }}
      >
        {/* RAP Logo badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            borderColor: "oklch(0.7 0.22 70 / 0.35)",
            background: "oklch(0.12 0.02 280 / 0.7)",
          }}
        >
          <Camera size={16} className="text-primary" />
          <span className="section-label text-xs">RAP Integrated Studio</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="hero-text text-foreground text-glow-gold"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Turning Visions Into{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-gold)" }}
          >
            Timeless Art
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          className="text-xl md:text-2xl max-w-3xl leading-relaxed"
          style={{ color: "oklch(0.78 0.01 280)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          India&apos;s premier photography, videography &amp; short film studio
          —{" "}
          <em style={{ color: "oklch(0.7 0.22 70 / 0.9)" }}>
            where every frame becomes a masterpiece
          </em>
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            ["500+", "Happy Clients"],
            ["23", "Services"],
            ["50+", "Courses"],
          ].map(([num, label]) => (
            <div key={label} className="text-center">
              <div
                className="text-2xl font-bold"
                style={{
                  color: "oklch(0.7 0.22 70)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {num}
              </div>
              <div
                className="text-xs tracking-widest uppercase"
                style={{ color: "oklch(0.55 0.01 280)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Link to="/booking" data-ocid="hero.book_cta.primary_button">
            <motion.button
              type="button"
              className="btn-primary-luxury flex items-center gap-2 text-base px-8 py-4 rounded-xl shadow-elevated"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
            >
              <Camera size={18} />
              Book a Session
            </motion.button>
          </Link>
          <Link to="/services" data-ocid="hero.services_cta.secondary_button">
            <motion.button
              type="button"
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-smooth"
              style={{
                background: "oklch(0.12 0.02 280 / 0.6)",
                border: "1px solid oklch(0.3 0.02 280 / 0.6)",
                color: "oklch(0.78 0.01 280)",
              }}
              whileHover={{
                scale: 1.06,
                borderColor: "oklch(0.7 0.22 70 / 0.5)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Play size={16} />
              View Services
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Film strip */}
      <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center overflow-hidden pointer-events-none">
        <motion.div
          className="flex gap-1 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {[...FILM_IMAGES, ...FILM_IMAGES, ...FILM_IMAGES].map((src, i) => {
            const filmKey = `film-${i}`;
            return (
              <div
                key={filmKey}
                className="flex-shrink-0 w-28 h-16 rounded overflow-hidden border"
                style={{ borderColor: "oklch(0.7 0.22 70 / 0.25)" }}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover opacity-60"
                  loading="lazy"
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        style={{ color: "oklch(0.55 0.01 280)" }}
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        initial={{ opacity: 0 }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
