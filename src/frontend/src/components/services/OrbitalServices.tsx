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

const SERVICE_IMAGES: Record<string, string> = {
  "couple-shoot":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=80&q=70",
  "single-shoot":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=80&q=70",
  "wedding-shoot":
    "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=80&q=70",
  "fashion-shoot":
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=80&q=70",
  "corporate-shoot":
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&q=70",
  "product-commercial":
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=80&q=70",
  "event-shoot":
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=80&q=70",
  drone:
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=80&q=70",
  "real-estate":
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=70",
  automobile:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=80&q=70",
  videography:
    "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=80&q=70",
  "short-films":
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=80&q=70",
  "youtube-content":
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=80&q=70",
  ads: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=80&q=70",
  animation:
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=80&q=70",
  "social-media":
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=80&q=70",
  podcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=80&q=70",
  "audio-production":
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=80&q=70",
  "family-shoot":
    "https://images.unsplash.com/photo-1478476868527-002ae3f3e159?w=80&q=70",
  "kids-baby-shoot":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=80&q=70",
  "travel-destination":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=80&q=70",
  "creative-artistic":
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=80&q=70",
  "fitness-lifestyle":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=70",
  "pet-photography":
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&q=70",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=80&q=70";

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

        {/* Orbital rings with glow */}
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

        {/* Planets */}
        {PLANETS.map((planet) => {
          const px = center + planet.x * scale;
          const py = center + planet.y * scale;
          const isHovered = hoveredId === planet.service.id;
          const planetSize = isMobile ? 44 : 58;
          const imgSrc = SERVICE_IMAGES[planet.service.id] ?? DEFAULT_IMAGE;

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
              data-ocid={`orbital-planet-${planet.service.id}`}
            >
              <motion.div
                className="relative flex items-center justify-center rounded-full overflow-hidden"
                style={{
                  width: planetSize,
                  height: planetSize,
                  border: isHovered
                    ? "2px solid oklch(0.82 0.18 88)"
                    : "1.5px solid oklch(0.28 0.016 275)",
                  boxShadow: isHovered
                    ? "0 0 18px oklch(0.72 0.14 82 / 0.8), 0 0 36px oklch(0.72 0.14 82 / 0.35)"
                    : "0 2px 10px oklch(0 0 0 / 0.45)",
                  transition: "all 0.2s ease",
                }}
              >
                <img
                  src={imgSrc}
                  alt={planet.service.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: isHovered
                      ? "brightness(1.15) saturate(1.1)"
                      : "brightness(0.78) saturate(0.85)",
                    transition: "filter 0.2s ease",
                  }}
                />
                <span
                  className="relative z-10 drop-shadow-lg"
                  style={{
                    fontSize: isMobile ? 14 : 18,
                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))",
                  }}
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
