import { useNavigate } from "@tanstack/react-router";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { SERVICE_CATEGORIES } from "../../data/services";

// Pick 8 prominent service categories for the orbit
const ORBIT_SERVICES = SERVICE_CATEGORIES.slice(0, 8);

interface OrbitPlanet {
  id: string;
  name: string;
  emoji: string;
  orbitRadius: number;
  duration: number;
}

const ORBIT_RINGS: {
  radius: number;
  duration: number;
  services: OrbitPlanet[];
}[] = [
  {
    radius: 130,
    duration: 28,
    services: ORBIT_SERVICES.slice(0, 4).map((s) => ({
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      orbitRadius: 130,
      duration: 28,
    })),
  },
  {
    radius: 210,
    duration: 45,
    services: ORBIT_SERVICES.slice(4, 8).map((s) => ({
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      orbitRadius: 210,
      duration: 45,
    })),
  },
];

interface PlanetProps {
  planet: OrbitPlanet;
  ringDuration: number;
  ringIndex: number;
  planetIndex: number;
}

function Planet({ planet, ringDuration, ringIndex, planetIndex }: PlanetProps) {
  const navigate = useNavigate();
  // Each planet starts at a staggered offset in the rotation
  const initialRotation = planetIndex * 90 + ringIndex * 45;

  return (
    <motion.div
      className="absolute"
      style={{
        width: planet.orbitRadius * 2,
        height: planet.orbitRadius * 2,
        top: "50%",
        left: "50%",
        marginTop: -planet.orbitRadius,
        marginLeft: -planet.orbitRadius,
      }}
      animate={{ rotate: 360 }}
      initial={{ rotate: initialRotation }}
      transition={{
        duration: ringDuration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      {/* Planet placed at the top of orbit, counter-rotates to stay upright */}
      <motion.button
        type="button"
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex flex-col items-center justify-center border cursor-pointer focus:outline-none"
        style={{
          background: "oklch(0.2 0.025 280 / 0.9)",
          borderColor: "oklch(0.7 0.22 70 / 0.4)",
          boxShadow: "0 0 12px oklch(0.7 0.22 70 / 0.2)",
        }}
        animate={{ rotate: -360 }}
        initial={{ rotate: -initialRotation }}
        transition={{
          duration: ringDuration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        whileHover={{
          scale: 1.3,
          boxShadow: "0 0 20px oklch(0.7 0.22 70 / 0.6)",
          borderColor: "oklch(0.7 0.22 70 / 0.9)",
        }}
        onClick={() => void navigate({ to: "/services" })}
        aria-label={planet.name}
        data-ocid={`orbit-planet-${planet.id}`}
      >
        <span className="text-base leading-none">{planet.emoji}</span>
      </motion.button>
    </motion.div>
  );
}

export function ServicesOrbitPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-muted/20 overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
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
          {ORBIT_RINGS.map((ring) => (
            <div
              key={ring.radius}
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: ring.radius * 2,
                height: ring.radius * 2,
                borderColor: "oklch(0.7 0.22 70 / 0.1)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* Planets on orbit rings */}
          {ORBIT_RINGS.map((ring, ringIndex) =>
            ring.services.map((planet, planetIndex) => (
              <Planet
                key={planet.id}
                planet={planet}
                ringDuration={ring.duration}
                ringIndex={ringIndex}
                planetIndex={planetIndex}
              />
            )),
          )}

          {/* Center RAP logo */}
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center rounded-full border-2 select-none"
            style={{
              width: 90,
              height: 90,
              background:
                "linear-gradient(135deg, oklch(0.18 0.025 280), oklch(0.22 0.03 290))",
              borderColor: "oklch(0.7 0.22 70 / 0.6)",
              boxShadow:
                "0 0 30px oklch(0.7 0.22 70 / 0.25), inset 0 0 20px oklch(0.7 0.22 70 / 0.1)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px oklch(0.7 0.22 70 / 0.2)",
                "0 0 40px oklch(0.7 0.22 70 / 0.4)",
                "0 0 20px oklch(0.7 0.22 70 / 0.2)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <span
              className="text-2xl font-black tracking-wider"
              style={{
                fontFamily: "var(--font-display)",
                color: "oklch(0.7 0.22 70)",
              }}
            >
              RAP
            </span>
            <span
              className="text-xs tracking-widest"
              style={{ color: "oklch(0.55 0.01 280)" }}
            >
              STUDIO
            </span>
          </motion.div>
        </motion.div>

        {/* Service name labels */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {ORBIT_SERVICES.map((svc) => (
            <button
              type="button"
              key={svc.id}
              onClick={() => void navigate({ to: "/services" })}
              className="px-3 py-1 text-xs rounded-full border transition-smooth hover:border-primary"
              style={{
                borderColor: "oklch(0.35 0.02 280)",
                color: "oklch(0.65 0.01 280)",
                background: "oklch(0.165 0.018 280 / 0.5)",
              }}
            >
              {svc.emoji} {svc.name}
            </button>
          ))}
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
            data-ocid="services-view-all"
          >
            View All 23 Services
          </button>
        </motion.div>
      </div>
    </section>
  );
}
