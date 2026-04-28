import { Instagram, Linkedin, Mail } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Founder {
  name: string;
  initials: string;
  title: string;
  role: string;
  specialty: string;
  bio: string;
  color: string;
  bgGradient: string;
  email?: string;
}

const FOUNDERS: Founder[] = [
  {
    name: "Ruchitha B S",
    initials: "R",
    title: "Co-Founder & Lead Photographer",
    role: "Co-founder",
    specialty: "Wedding & Portrait Photography",
    bio: "With an eye for intimate moments and timeless emotions, Ruchitha turns weddings and portraits into visual poetry.",
    color: "oklch(0.7 0.22 70)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 70), oklch(0.16 0.03 75))",
    email: "ruchithabs550@gmail.com",
  },
  {
    name: "Ashitha S",
    initials: "A",
    title: "Co-Founder & Creative Director",
    role: "Co-founder",
    specialty: "Fashion & Commercial Photography",
    bio: "Ashitha blends editorial finesse with bold commercial instinct — crafting images that stop scrolls and win campaigns.",
    color: "oklch(0.72 0.2 290)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 290), oklch(0.16 0.03 280))",
  },
  {
    name: "Prarthana R",
    initials: "P",
    title: "Co-Founder & Cinematographer",
    role: "Co-founder",
    specialty: "Videography & Short Films",
    bio: "Prarthana's cinematic vision breathes life into stories — from award-winning short films to deeply moving wedding videos.",
    color: "oklch(0.66 0.18 180)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 180), oklch(0.16 0.03 175))",
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

      {/* Gold light leak top */}
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

      {/* Teal glow bottom-left */}
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        animate={{ opacity: [0.03, 0.1, 0.03] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.66 0.18 180 / 0.35) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Violet glow bottom-right */}
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
        animate={{ opacity: [0.03, 0.09, 0.03] }}
        transition={{
          duration: 11,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 5,
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.2 290 / 0.3) 0%, transparent 70%)",
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
                  borderColor: `${founder.color.replace(")", " / 0.28)")}`,
                  background: "oklch(0.14 0.02 280 / 0.9)",
                  boxShadow: "0 8px 40px oklch(0 0 0 / 0.3)",
                }}
              >
                {/* Top colored bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${founder.color.replace(")", " / 0.8)")}, ${founder.color.replace(")", " / 0.3)")})`,
                  }}
                />

                {/* Avatar area */}
                <div
                  className="relative h-56 flex items-center justify-center overflow-hidden"
                  style={{ background: founder.bgGradient }}
                >
                  {/* Decorative background pattern */}
                  <div
                    className="absolute inset-0 opacity-12"
                    style={{
                      background: `radial-gradient(circle at 30% 40%, ${founder.color.replace(")", " / 0.6)")}, transparent 60%), radial-gradient(circle at 70% 70%, ${founder.color.replace(")", " / 0.4)")}, transparent 50%)`,
                    }}
                  />

                  {/* Large initial circle */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center rounded-full"
                    style={{
                      width: 104,
                      height: 104,
                      background: `${founder.color.replace(")", " / 0.15)")}`,
                      border: `3px solid ${founder.color.replace(")", " / 0.55)")}`,
                      boxShadow: `0 0 36px ${founder.color.replace(")", " / 0.45)")}, inset 0 0 18px ${founder.color.replace(")", " / 0.1)")}`,
                    }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.35 }}
                  >
                    <span
                      className="font-display font-black"
                      style={{
                        fontSize: 42,
                        fontFamily: "var(--font-display)",
                        color: founder.color,
                        textShadow: `0 0 24px ${founder.color.replace(")", " / 0.65)")}`,
                      }}
                    >
                      {founder.initials}
                    </span>
                  </motion.div>

                  {/* Animated shine on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 35%, oklch(0.9 0.01 280 / 0.07) 50%, transparent 65%)",
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-5 pb-6">
                  <h3
                    className="text-xl font-bold text-foreground mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {founder.name}
                  </h3>

                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: founder.color }}
                  >
                    {founder.title}
                  </p>

                  {/* Specialty tag */}
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs mt-2 mb-4"
                    style={{
                      background: `${founder.color.replace(")", " / 0.1)")}`,
                      border: `1px solid ${founder.color.replace(")", " / 0.35)")}`,
                      color: founder.color,
                    }}
                  >
                    {founder.specialty}
                  </div>

                  <div
                    className="w-12 h-px mb-4 mx-auto"
                    style={{
                      background: `${founder.color.replace(")", " / 0.4)")}`,
                    }}
                  />

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {founder.bio}
                  </p>

                  {/* Social icons */}
                  <div className="flex items-center justify-center gap-3 mt-5">
                    {[
                      { Icon: Instagram, label: "Instagram" },
                      { Icon: Linkedin, label: "LinkedIn" },
                      ...(founder.email
                        ? [{ Icon: Mail, label: "Email" }]
                        : []),
                    ].map(({ Icon, label }) => (
                      <motion.button
                        key={label}
                        type="button"
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-smooth"
                        style={{
                          background: `${founder.color.replace(")", " / 0.12)")}`,
                          border: `1px solid ${founder.color.replace(")", " / 0.3)")}`,
                          color: founder.color,
                        }}
                        whileHover={{
                          scale: 1.15,
                          background: `${founder.color.replace(")", " / 0.22)")}`,
                        }}
                        aria-label={`${founder.name} ${label}`}
                      >
                        <Icon size={14} />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glow under card */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse, ${founder.color.replace(")", " / 0.4)")}, transparent 70%)`,
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
