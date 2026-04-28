import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Film,
  Heart,
  Image,
  Music,
  Play,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

// 8 service categories with Lucide icons and colors
const ORBIT_SERVICES = [
  {
    id: "wedding-shoot",
    name: "Wedding Shoot",
    icon: Heart,
    color: "oklch(0.8 0.2 30)",
  },
  {
    id: "couple-shoot",
    name: "Couple Shoot",
    icon: Sparkles,
    color: "oklch(0.72 0.2 290)",
  },
  {
    id: "fashion-shoot",
    name: "Fashion Shoot",
    icon: Star,
    color: "oklch(0.72 0.14 82)",
  },
  {
    id: "videography",
    name: "Videography",
    icon: Video,
    color: "oklch(0.66 0.18 180)",
  },
  {
    id: "event-shoot",
    name: "Event Shoot",
    icon: Users,
    color: "oklch(0.72 0.2 145)",
  },
  {
    id: "short-films",
    name: "Short Films",
    icon: Film,
    color: "oklch(0.72 0.2 50)",
  },
  {
    id: "portrait-shoot",
    name: "Portraits",
    icon: Camera,
    color: "oklch(0.74 0.18 250)",
  },
  {
    id: "audio-production",
    name: "Audio",
    icon: Music,
    color: "oklch(0.7 0.2 230)",
  },
];

const INNER_SERVICES = ORBIT_SERVICES.slice(0, 4);
const OUTER_SERVICES = ORBIT_SERVICES.slice(4, 8);

export function ServicesOrbitPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-muted/20 overflow-hidden relative" ref={ref}>
      {/* Accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.72 0.14 82 / 0.04) 0%, transparent 70%)",
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
          <p className="section-label mb-3">Our Services</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            23 Categories,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-gold)" }}
            >
              Infinite Stories
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From intimate couple shoots to grand wedding productions — every
            visual story finds its canvas here.
          </p>
        </motion.div>

        {/* Orbit container */}
        <motion.div
          className="relative mx-auto flex items-center justify-center"
          style={{ width: 480, height: 480, maxWidth: "100%" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {/* Orbit ring decorations */}
          {[130, 210].map((radius) => (
            <div
              key={radius}
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: radius * 2,
                height: radius * 2,
                borderColor: "oklch(0.7 0.22 70 / 0.14)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* Decorative corner accent dots */}
          {[45, 135, 225, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const r = 235;
            const x = 50 + (r / 480) * 100 * Math.cos(rad);
            const y = 50 + (r / 480) * 100 * Math.sin(rad);
            return (
              <motion.div
                key={angle}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  background: "oklch(0.72 0.14 82 / 0.5)",
                  transform: "translate(-50%, -50%)",
                }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: angle / 180,
                }}
              />
            );
          })}

          {/* Inner ring — 4 services */}
          <motion.div
            className="absolute"
            style={{
              width: 260,
              height: 260,
              top: "50%",
              left: "50%",
              marginTop: -130,
              marginLeft: -130,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {INNER_SERVICES.map((svc, i) => {
              const angle = (i / INNER_SERVICES.length) * 360;
              const Icon = svc.icon;
              return (
                <motion.button
                  key={svc.id}
                  type="button"
                  className="absolute flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translateY(-130px) rotate(-${angle}deg)`,
                    marginTop: -22,
                    marginLeft: -22,
                  }}
                  whileHover={{ scale: 1.25 }}
                  onClick={() => void navigate({ to: "/services" })}
                  aria-label={svc.name}
                  data-ocid={`services.orbit.item.${i + 1}`}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: `${svc.color.replace(")", " / 0.15)")}`,
                      borderColor: `${svc.color.replace(")", " / 0.5)")}`,
                      boxShadow: `0 0 14px ${svc.color.replace(")", " / 0.3)")}`,
                    }}
                  >
                    <Icon size={18} style={{ color: svc.color }} />
                  </div>
                  <span
                    className="text-[9px] font-semibold text-center leading-tight whitespace-nowrap"
                    style={{ color: "oklch(0.72 0.01 280)" }}
                  >
                    {svc.name}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Outer ring — 4 services */}
          <motion.div
            className="absolute"
            style={{
              width: 420,
              height: 420,
              top: "50%",
              left: "50%",
              marginTop: -210,
              marginLeft: -210,
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 48,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {OUTER_SERVICES.map((svc, i) => {
              const angle = (i / OUTER_SERVICES.length) * 360;
              const Icon = svc.icon;
              return (
                <motion.button
                  key={svc.id}
                  type="button"
                  className="absolute flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translateY(-210px) rotate(-${angle}deg)`,
                    marginTop: -22,
                    marginLeft: -22,
                  }}
                  whileHover={{ scale: 1.25 }}
                  onClick={() => void navigate({ to: "/services" })}
                  aria-label={svc.name}
                  data-ocid={`services.orbit.item.${i + 5}`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: `${svc.color.replace(")", " / 0.12)")}`,
                      borderColor: `${svc.color.replace(")", " / 0.45)")}`,
                      boxShadow: `0 0 16px ${svc.color.replace(")", " / 0.25)")}`,
                    }}
                  >
                    <Icon size={20} style={{ color: svc.color }} />
                  </div>
                  <span
                    className="text-[9px] font-semibold text-center leading-tight whitespace-nowrap"
                    style={{ color: "oklch(0.72 0.01 280)" }}
                  >
                    {svc.name}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Center RAP logo */}
          <motion.button
            type="button"
            className="relative z-10 flex flex-col items-center justify-center rounded-full border-2 select-none focus:outline-none"
            style={{
              width: 96,
              height: 96,
              background:
                "linear-gradient(135deg, oklch(0.18 0.025 280), oklch(0.22 0.03 290))",
              borderColor: "oklch(0.7 0.22 70 / 0.65)",
              boxShadow:
                "0 0 32px oklch(0.7 0.22 70 / 0.28), inset 0 0 20px oklch(0.7 0.22 70 / 0.12)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px oklch(0.7 0.22 70 / 0.2)",
                "0 0 44px oklch(0.7 0.22 70 / 0.5)",
                "0 0 20px oklch(0.7 0.22 70 / 0.2)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1 }}
            onClick={() => void navigate({ to: "/services" })}
            aria-label="RAP Studio — View all services"
            data-ocid="services.orbit.center_button"
          >
            <span
              className="text-xl font-black tracking-wider"
              style={{
                fontFamily: "var(--font-display)",
                color: "oklch(0.7 0.22 70)",
              }}
            >
              RAP
            </span>
            <span
              className="text-[10px] tracking-widest"
              style={{ color: "oklch(0.55 0.01 280)" }}
            >
              STUDIO
            </span>
          </motion.button>
        </motion.div>

        {/* Service label pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {ORBIT_SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <button
                type="button"
                key={svc.id}
                onClick={() => void navigate({ to: "/services" })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-smooth hover:border-primary/60"
                style={{
                  borderColor: "oklch(0.3 0.02 280)",
                  color: "oklch(0.65 0.01 280)",
                  background: "oklch(0.165 0.018 280 / 0.5)",
                }}
              >
                <Icon size={10} style={{ color: svc.color }} />
                {svc.name}
              </button>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            type="button"
            onClick={() => void navigate({ to: "/services" })}
            className="btn-primary-luxury px-10 py-4 text-base"
            data-ocid="services.view_all_button"
          >
            <Image size={16} className="inline mr-2" />
            View All 23 Services
          </button>
        </motion.div>
      </div>
    </section>
  );
}
