import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SERVICE_CATEGORIES } from "../../data/services";

interface OrbitalPlanet {
  service: (typeof SERVICE_CATEGORIES)[0];
  x: number;
  y: number;
  ring: number;
}

const RING_CONFIGS = [
  { radius: 155, count: 8, speed: 60 },
  { radius: 235, count: 8, speed: 90 },
  { radius: 315, count: 7, speed: 120 },
];

// CSS gradient colors per service ring — no external images
const PLANET_COLORS = [
  "oklch(0.7 0.22 70)", // gold
  "oklch(0.7 0.2 290)", // violet
  "oklch(0.7 0.2 190)", // teal
  "oklch(0.7 0.2 30)", // orange
  "oklch(0.7 0.2 145)", // green
  "oklch(0.7 0.2 250)", // blue
  "oklch(0.7 0.2 80)", // amber
  "oklch(0.7 0.2 320)", // pink
];

function calcPlanets(): OrbitalPlanet[] {
  const planets: OrbitalPlanet[] = [];
  let serviceIdx = 0;
  for (const [ringIdx, ring] of RING_CONFIGS.entries()) {
    for (let i = 0; i < ring.count; i++) {
      if (serviceIdx >= SERVICE_CATEGORIES.length) break;
      const angle = (i / ring.count) * 2 * Math.PI - Math.PI / 2;
      planets.push({
        service: SERVICE_CATEGORIES[serviceIdx],
        x: Math.round(ring.radius * Math.cos(angle)),
        y: Math.round(ring.radius * Math.sin(angle)),
        ring: ringIdx,
      });
      serviceIdx++;
    }
  }
  return planets;
}

const PLANETS = calcPlanets();

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: (i * 17 + 3) % 100,
  top: (i * 23 + 7) % 100,
  size: i % 5 === 0 ? 2 : 1,
  opacity: 0.04 + (i % 8) * 0.04,
}));

export function OrbitalServices() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const scale = isMobile ? 0.52 : 1;
  const containerSize = isMobile ? 380 : 700;
  const center = containerSize / 2;

  return (
    <div className="flex flex-col items-center gap-10">
      <div
        ref={containerRef}
        className="relative select-none"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Starfield */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          {STARS.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-foreground"
              style={{
                width: star.size,
                height: star.size,
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        {/* Orbital rings */}
        {RING_CONFIGS.map((ring, idx) => (
          <div
            key={ring.radius}
            className="absolute rounded-full border border-dashed pointer-events-none"
            style={{
              width: ring.radius * 2 * scale,
              height: ring.radius * 2 * scale,
              left: center - ring.radius * scale,
              top: center - ring.radius * scale,
              borderColor: "oklch(0.72 0.14 82 / 0.18)",
              opacity: 0.5 + idx * 0.18,
              boxShadow: `0 0 ${(idx + 1) * 6}px oklch(0.72 0.14 82 / 0.04)`,
            }}
          />
        ))}

        {/* Center RAP logo */}
        <motion.div
          className="absolute z-20 flex items-center justify-center rounded-full cursor-pointer"
          style={{
            width: isMobile ? 64 : 96,
            height: isMobile ? 64 : 96,
            left: center - (isMobile ? 32 : 48),
            top: center - (isMobile ? 32 : 48),
            background: "var(--gradient-gold)",
            boxShadow:
              "0 0 24px oklch(0.72 0.14 82 / 0.5), 0 0 52px oklch(0.72 0.14 82 / 0.18)",
          }}
          animate={{
            boxShadow: [
              "0 0 24px oklch(0.72 0.14 82 / 0.5), 0 0 52px oklch(0.72 0.14 82 / 0.18)",
              "0 0 36px oklch(0.72 0.14 82 / 0.7), 0 0 72px oklch(0.72 0.14 82 / 0.3)",
              "0 0 24px oklch(0.72 0.14 82 / 0.5), 0 0 52px oklch(0.72 0.14 82 / 0.18)",
            ],
          }}
          transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY }}
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate({ to: "/" })}
        >
          <span
            className="font-display font-bold text-primary-foreground"
            style={{ fontSize: isMobile ? 14 : 20 }}
          >
            RAP
          </span>
        </motion.div>

        {/* Planets — emoji only, no external images */}
        {PLANETS.map((planet, pIdx) => {
          const px = center + planet.x * scale;
          const py = center + planet.y * scale;
          const isHovered = hoveredId === planet.service.id;
          const planetSize = isMobile ? 44 : 58;
          const color = PLANET_COLORS[pIdx % PLANET_COLORS.length];

          return (
            <motion.div
              key={planet.service.id}
              className="absolute z-10 flex flex-col items-center cursor-pointer"
              style={{
                left: px - planetSize / 2,
                top: py - planetSize / 2,
                width: planetSize,
              }}
              whileHover={{ scale: 1.32 }}
              onHoverStart={() => setHoveredId(planet.service.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() =>
                navigate({
                  to: "/services/$serviceId",
                  params: { serviceId: planet.service.id },
                })
              }
              data-ocid={`orbital.planet.${String(pIdx + 1)}`}
            >
              {/* Planet circle — CSS gradient, no image */}
              <motion.div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: planetSize,
                  height: planetSize,
                  background: isHovered
                    ? `${color.replace(")", " / 0.22)")}`
                    : `${color.replace(")", " / 0.12)")}`,
                  border: isHovered
                    ? `2px solid ${color.replace(")", " / 0.8)")}`
                    : `1.5px solid ${color.replace(")", " / 0.35)")}`,
                  boxShadow: isHovered
                    ? `0 0 18px ${color.replace(")", " / 0.7)")}, 0 0 36px ${color.replace(")", " / 0.3)")}`
                    : "0 2px 10px oklch(0 0 0 / 0.45)",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  className="relative z-10 drop-shadow-lg"
                  style={{ fontSize: isMobile ? 16 : 20 }}
                >
                  {planet.service.emoji}
                </span>
              </motion.div>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="absolute z-30 rounded-xl px-3 py-1.5 whitespace-nowrap pointer-events-none shadow-elevated"
                    style={{
                      top: planetSize + 6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "oklch(0.12 0.014 275 / 0.95)",
                      border: "1px solid oklch(0.72 0.14 82 / 0.4)",
                      backdropFilter: "blur(12px)",
                    }}
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="text-xs font-semibold text-foreground">
                      {planet.service.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {planet.service.subServices.length} sub-services
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        <span className="text-primary font-semibold">
          {SERVICE_CATEGORIES.length}
        </span>{" "}
        service categories ·{" "}
        <a
          href="#services-list"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          View all as list
        </a>
      </p>
    </div>
  );
}
