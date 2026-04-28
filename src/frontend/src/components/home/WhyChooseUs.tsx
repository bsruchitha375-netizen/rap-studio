import {
  Award,
  Clock,
  Film,
  Gem,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Reason {
  title: string;
  description: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
  tag: string;
  iconColor: string;
  bgGradient: string;
  accentColor: string;
}

const REASONS: Reason[] = [
  {
    title: "Premium Equipment & Lighting",
    description:
      "State-of-the-art cameras, lenses and professional studio lighting rigs for flawless results every time.",
    icon: Sparkles,
    tag: "Pro Gear",
    iconColor: "oklch(0.7 0.22 70)",
    accentColor: "oklch(0.7 0.22 70)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 70 / 0.65), oklch(0.16 0.03 75 / 0.4))",
  },
  {
    title: "Expert Team of 3 Directors",
    description:
      "Founded and led by Ruchitha, Ashitha, and Prarthana — each bringing a unique creative vision.",
    icon: Users,
    tag: "World-Class",
    iconColor: "oklch(0.72 0.2 290)",
    accentColor: "oklch(0.72 0.2 290)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 290 / 0.65), oklch(0.16 0.03 280 / 0.4))",
  },
  {
    title: "Fast Turnaround",
    description:
      "Professional delivery timelines that respect your deadlines without compromising quality.",
    icon: Clock,
    tag: "On Time",
    iconColor: "oklch(0.66 0.18 180)",
    accentColor: "oklch(0.66 0.18 180)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 180 / 0.65), oklch(0.16 0.03 175 / 0.4))",
  },
  {
    title: "Client Satisfaction Guarantee",
    description:
      "We don't stop until you're delighted. Our reputation is built on 500+ happy clients across India.",
    icon: Award,
    tag: "5★ Rated",
    iconColor: "oklch(0.72 0.2 30)",
    accentColor: "oklch(0.72 0.2 30)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 30 / 0.65), oklch(0.16 0.03 40 / 0.4))",
  },
  {
    title: "Cinematic Short Films",
    description:
      "Award-winning short film productions — script to screen — with a signature cinematic style.",
    icon: Film,
    tag: "Award Winning",
    iconColor: "oklch(0.74 0.2 50)",
    accentColor: "oklch(0.74 0.2 50)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 50 / 0.65), oklch(0.16 0.03 55 / 0.4))",
  },
  {
    title: "Luxury Deliverables",
    description:
      "Premium photo albums, 4K video masters, and downloadable assets delivered with care.",
    icon: Gem,
    tag: "Premium",
    iconColor: "oklch(0.74 0.18 250)",
    accentColor: "oklch(0.74 0.18 250)",
    bgGradient:
      "linear-gradient(135deg, oklch(0.22 0.05 250 / 0.65), oklch(0.16 0.03 255 / 0.4))",
  },
];

export function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden" ref={ref}>
      {/* Section background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 50%, oklch(0.66 0.18 180 / 0.04) 0%, transparent 70%)",
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
          <p className="section-label mb-3">Why RAP Studio</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Crafted for the{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-gold)" }}
            >
              Extraordinary
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Every reason to choose RAP is a promise we keep — backed by
            experience, passion, and artistry.
          </p>
        </motion.div>

        {/* 6-card glassmorphism grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                className="group rounded-2xl border cursor-default overflow-hidden relative"
                style={{
                  background: "oklch(var(--card) / 0.5)",
                  borderColor: "oklch(0.25 0.02 280)",
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.65,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                  borderColor: `${reason.iconColor.replace(")", " / 0.45)")}`,
                  boxShadow: `0 0 0 1.5px ${reason.iconColor.replace(")", " / 0.3)")}, 0 24px 64px ${reason.iconColor.replace(")", " / 0.12)")}`,
                }}
              >
                {/* Icon header area */}
                <div
                  className="relative h-32 flex items-center justify-center overflow-hidden"
                  style={{ background: reason.bgGradient }}
                >
                  {/* Decorative backdrop */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${reason.iconColor.replace(")", " / 0.55)")}, transparent 65%)`,
                    }}
                  />

                  {/* Large background icon */}
                  <Icon
                    size={72}
                    className="absolute opacity-5 pointer-events-none"
                    style={{ color: reason.iconColor }}
                  />

                  {/* Main icon */}
                  <div
                    className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center border"
                    style={{
                      background: `${reason.iconColor.replace(")", " / 0.15)")}`,
                      borderColor: `${reason.iconColor.replace(")", " / 0.4)")}`,
                      boxShadow: `0 0 24px ${reason.iconColor.replace(")", " / 0.3)")}`,
                    }}
                  >
                    <Icon size={28} style={{ color: reason.iconColor }} />
                  </div>

                  {/* Tag badge */}
                  <div
                    className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold tracking-wide"
                    style={{
                      background: `${reason.iconColor.replace(")", " / 0.15)")}`,
                      border: `1px solid ${reason.iconColor.replace(")", " / 0.45)")}`,
                      color: reason.iconColor,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {reason.tag}
                  </div>

                  {/* Shimmer on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-smooth"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 35%, oklch(0.9 0.01 280 / 0.08) 50%, transparent 65%)",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3
                    className="text-base font-bold text-foreground mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {reason.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>

                  {/* Animated accent line */}
                  <motion.div
                    className="mt-4 h-px rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${reason.accentColor}, transparent)`,
                    }}
                    initial={{ scaleX: 0, originX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
                  />
                </div>

                {/* Star rating if applicable */}
                {reason.tag === "5★ Rated" && (
                  <div className="px-5 pb-4 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        fill="currentColor"
                        style={{ color: "oklch(0.72 0.2 30)" }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">
                      500+ reviews
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
