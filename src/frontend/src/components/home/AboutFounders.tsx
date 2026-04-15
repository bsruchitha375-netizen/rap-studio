import { Camera, Instagram, Linkedin } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Founder {
  name: string;
  initials: string;
  title: string;
  specialty: string;
  bio: string;
  color: string;
  avatar: string;
  instagram?: string;
}

const FOUNDERS: Founder[] = [
  {
    name: "Ruchitha B S",
    initials: "RBS",
    title: "Co-Founder & Lead Photographer",
    specialty: "Wedding & Portrait Photography",
    bio: "With an eye for intimate moments and timeless emotions, Ruchitha turns weddings and portraits into visual poetry.",
    color: "oklch(0.7 0.22 70)",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&face",
  },
  {
    name: "Ashitha S",
    initials: "AS",
    title: "Co-Founder & Creative Director",
    specialty: "Fashion & Commercial Photography",
    bio: "Ashitha blends editorial finesse with bold commercial instinct — crafting images that stop scrolls and win campaigns.",
    color: "oklch(0.78 0.18 290)",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&face",
  },
  {
    name: "Prarthana R",
    initials: "PR",
    title: "Co-Founder & Cinematographer",
    specialty: "Videography & Short Films",
    bio: "Prarthana's cinematic vision breathes life into stories — from award-winning short films to deeply moving wedding videos.",
    color: "oklch(0.72 0.18 190)",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&face",
  },
];

const STUDIO_STATS = [
  { value: "500+", label: "Happy Clients" },
  { value: "3", label: "Expert Directors" },
  { value: "50+", label: "Courses Taught" },
  { value: "8+", label: "Years of Excellence" },
];

export function AboutFounders() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Dark cinematic background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.11 0.018 280) 0%, oklch(0.13 0.022 285) 50%, oklch(0.1 0.015 275) 100%)",
        }}
      />

      {/* Light leak effect top */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 pointer-events-none"
        animate={{ opacity: [0.04, 0.12, 0.04] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.7 0.22 70 / 0.4) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      {/* Light leak bottom-right */}
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        animate={{ opacity: [0.03, 0.09, 0.03] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.2 290 / 0.5) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-3">The Visionaries</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Meet the Minds Behind{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-gold)" }}
            >
              RAP Studio
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            RAP Integrated Studio was born from the shared vision of three
            passionate directors — united by their love for visual storytelling,
            cinematic excellence, and the belief that every moment deserves to
            be immortalised as art.
          </p>
        </motion.div>

        {/* Founder cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {FOUNDERS.map((founder, index) => (
            <motion.div
              key={founder.name}
              className="group flex flex-col items-center text-center relative"
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Card */}
              <div
                className="w-full rounded-2xl overflow-hidden border transition-smooth group-hover:-translate-y-2"
                style={{
                  borderColor: `${founder.color}30`,
                  background: "oklch(0.14 0.02 280 / 0.8)",
                  boxShadow: "0 8px 40px oklch(0 0 0 / 0.3)",
                }}
              >
                {/* Photo area */}
                <div className="relative h-72 overflow-hidden">
                  <motion.img
                    src={founder.avatar}
                    alt={`${founder.name} - ${founder.title}`}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, oklch(0.14 0.02 280) 0%, oklch(0.14 0.02 280 / 0.5) 40%, transparent 80%)",
                    }}
                  />
                  {/* Colored top border */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${founder.color}88, transparent)`,
                    }}
                  />

                  {/* Animated shine on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 35%, oklch(0.9 0.01 280 / 0.07) 50%, transparent 65%)",
                    }}
                  />

                  {/* Photo coming soon overlay — shown if image fails to load */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0"
                    id={`photo-fallback-${index}`}
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.14 0.02 280), oklch(0.18 0.025 285))",
                    }}
                  >
                    <Camera
                      size={32}
                      style={{ color: founder.color, opacity: 0.5 }}
                    />
                    <span
                      style={{
                        color: founder.color,
                        fontSize: "12px",
                        opacity: 0.7,
                      }}
                    >
                      {founder.initials}
                    </span>
                    <span
                      style={{ color: "oklch(0.4 0.01 280)", fontSize: "10px" }}
                    >
                      Photo Coming Soon
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 pb-6">
                  {/* Name */}
                  <h3
                    className="text-xl font-bold text-foreground mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {founder.name}
                  </h3>

                  {/* Title */}
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: founder.color }}
                  >
                    {founder.title}
                  </p>

                  {/* Specialty tag */}
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs mb-3"
                    style={{
                      background: `${founder.color}12`,
                      border: `1px solid ${founder.color}30`,
                      color: founder.color,
                    }}
                  >
                    {founder.specialty}
                  </div>

                  {/* Divider */}
                  <div
                    className="w-12 h-px mb-3 mx-auto"
                    style={{ background: `${founder.color}40` }}
                  />

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {founder.bio}
                  </p>

                  {/* Social icons */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <motion.button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-smooth"
                      style={{
                        background: `${founder.color}15`,
                        border: `1px solid ${founder.color}30`,
                        color: founder.color,
                      }}
                      whileHover={{
                        scale: 1.15,
                        background: `${founder.color}25`,
                      }}
                      aria-label={`${founder.name} Instagram`}
                    >
                      <Instagram size={14} />
                    </motion.button>
                    <motion.button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-smooth"
                      style={{
                        background: `${founder.color}15`,
                        border: `1px solid ${founder.color}30`,
                        color: founder.color,
                      }}
                      whileHover={{
                        scale: 1.15,
                        background: `${founder.color}25`,
                      }}
                      aria-label={`${founder.name} LinkedIn`}
                    >
                      <Linkedin size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Glow under card */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse, ${founder.color}40 0%, transparent 70%)`,
                  filter: "blur(12px)",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div
            className="rounded-2xl border p-8"
            style={{
              borderColor: "oklch(0.7 0.22 70 / 0.2)",
              background:
                "linear-gradient(135deg, oklch(0.14 0.018 280 / 0.8), oklch(0.16 0.022 290 / 0.5))",
            }}
          >
            <Camera
              size={28}
              className="mx-auto mb-4"
              style={{ color: "oklch(0.7 0.22 70 / 0.6)" }}
            />
            <p className="text-muted-foreground leading-relaxed text-center mb-8">
              Together, Ruchitha, Ashitha, and Prarthana have built RAP
              Integrated Studio into one of India&apos;s most sought-after
              photography and cinematography studios — bringing unrivalled
              artistic depth to every project they undertake.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STUDIO_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                >
                  <div
                    className="text-2xl font-black mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: "var(--gradient-gold)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
