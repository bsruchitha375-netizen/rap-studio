import {
  Award,
  CalendarCheck,
  CreditCard,
  ImagePlay,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  image: string;
}

const FEATURES: Feature[] = [
  {
    icon: <CalendarCheck size={26} />,
    title: "Online Booking System",
    description:
      "Book shoots with date, time slot, duration and custom location — all in one seamless flow.",
    accentColor: "oklch(0.7 0.22 70)",
    image:
      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&h=200&fit=crop",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Role-Based Access",
    description:
      "Separate dashboards for Clients, Students, Receptionists, Staff and Admins with strict RBAC.",
    accentColor: "oklch(0.68 0.2 290)",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop",
  },
  {
    icon: <Award size={26} />,
    title: "Course Certifications + QR",
    description:
      "Earn verified certificates with unique QR codes after completing courses and full payment.",
    accentColor: "oklch(0.72 0.18 30)",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
  },
  {
    icon: <CreditCard size={26} />,
    title: "Real-Time Payment",
    description:
      "Powered by Stripe — secure deposit to confirm booking, remainder after delivery. Instant and reliable.",
    accentColor: "oklch(0.66 0.18 190)",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
  },
  {
    icon: <Mail size={26} />,
    title: "Instant Email Confirmations",
    description:
      "Get booking confirmations, payment receipts and course updates straight to your inbox — automatically.",
    accentColor: "oklch(0.6 0.2 155)",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=200&fit=crop",
  },
  {
    icon: <ImagePlay size={26} />,
    title: "Secure Media Gallery",
    description:
      "Your shoot deliverables in a private, password-protected media gallery — accessible anytime.",
    accentColor: "oklch(0.7 0.22 70)",
    image:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=200&fit=crop",
  },
];

export function PlatformFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Animated dark gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.1 0.018 280) 0%, oklch(0.14 0.022 285) 50%, oklch(0.1 0.015 275) 100%)",
        }}
      />
      {/* Animated glow orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full pointer-events-none"
        animate={{ opacity: [0.04, 0.12, 0.04], scale: [1, 1.15, 1] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.22 70 / 0.5) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full pointer-events-none"
        animate={{ opacity: [0.04, 0.1, 0.04], scale: [1, 1.2, 1] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.2 290 / 0.5) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Subtle grid lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.7 0.22 70 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.22 70 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-3">Platform Features</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built for{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-purple)" }}
            >
              Modern Studios
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Every feature is designed to make your experience seamless, from
            booking to delivery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative rounded-2xl border border-border overflow-hidden group"
              style={{ background: "oklch(0.13 0.02 280 / 0.8)" }}
              initial={{
                opacity: 0,
                x: index % 3 === 0 ? -40 : index % 3 === 2 ? 40 : 0,
                y: index % 3 === 1 ? 40 : 0,
              }}
              animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6, borderColor: `${feature.accentColor}55` }}
            >
              {/* Feature image */}
              <div className="relative h-32 overflow-hidden">
                <motion.img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover opacity-50"
                  loading="lazy"
                  whileHover={{ scale: 1.1, opacity: 0.7 }}
                  transition={{ duration: 0.5 }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, oklch(0.13 0.02 280) 0%, transparent 80%)",
                  }}
                />
                {/* Icon floating over image */}
                <div
                  className="absolute bottom-3 left-4 w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.1 0.015 280 / 0.9)",
                    border: `1px solid ${feature.accentColor}44`,
                    color: feature.accentColor,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3
                  className="text-base font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background: `linear-gradient(90deg, transparent, ${feature.accentColor}88, transparent)`,
                }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1, delay: index * 0.12 + 0.5 }}
              />

              {/* Hover glow overlay */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 40% at 50% 80%, ${feature.accentColor}08 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
