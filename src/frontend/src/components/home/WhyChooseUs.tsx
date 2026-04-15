import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Reason {
  title: string;
  description: string;
  image: string;
  tag: string;
}

const REASONS: Reason[] = [
  {
    title: "Premium Equipment & Lighting",
    description:
      "State-of-the-art cameras, lenses and professional studio lighting rigs for flawless results every time.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
    tag: "Pro Gear",
  },
  {
    title: "Expert Team of 3 Directors",
    description:
      "Founded and led by Ruchitha, Ashitha, and Prarthana — each bringing a unique creative vision.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
    tag: "World-Class",
  },
  {
    title: "Custom Packages & Pricing",
    description:
      "Tailored packages starting at just ₹5 — transparent pricing with zero hidden costs.",
    image:
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=400&fit=crop",
    tag: "Best Value",
  },
  {
    title: "Fast Turnaround",
    description:
      "Professional delivery timelines that respect your deadlines without compromising quality.",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
    tag: "On Time",
  },
  {
    title: "Cinematic Quality",
    description:
      "Every frame is crafted with cinematic intent — drama, depth and storytelling in every image.",
    image:
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop",
    tag: "Film-Grade",
  },
  {
    title: "Client Satisfaction Guarantee",
    description:
      "We don't stop until you're delighted. Our reputation is built on 500+ happy clients across India.",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop",
    tag: "5★ Rated",
  },
];

export function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-muted/20" ref={ref}>
      <div className="container mx-auto px-4">
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

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((reason, index) => (
            <motion.div
              key={reason.title}
              className="group rounded-2xl overflow-hidden border border-border cursor-default relative"
              style={{ background: "oklch(var(--card) / 0.5)" }}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -8,
                boxShadow:
                  "0 0 0 1.5px oklch(0.7 0.22 70 / 0.45), 0 24px 64px oklch(0.7 0.22 70 / 0.14)",
              }}
            >
              {/* Image with overlay */}
              <div className="relative h-44 overflow-hidden">
                <motion.img
                  src={reason.image}
                  alt={reason.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, oklch(0.165 0.018 280 / 0.9) 0%, oklch(0.165 0.018 280 / 0.3) 60%, transparent 100%)",
                  }}
                />
                {/* Tag badge */}
                <div
                  className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold tracking-wide"
                  style={{
                    background: "oklch(0.7 0.22 70 / 0.15)",
                    border: "1px solid oklch(0.7 0.22 70 / 0.4)",
                    color: "oklch(0.7 0.22 70)",
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

                {/* Gold accent line animates on hover */}
                <motion.div
                  className="mt-4 h-px rounded-full"
                  style={{ background: "var(--gradient-gold)" }}
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
