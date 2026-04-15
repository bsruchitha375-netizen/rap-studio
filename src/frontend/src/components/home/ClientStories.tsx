import { Star } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Testimonial {
  name: string;
  service: string;
  rating: number;
  quote: string;
  location: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Meera Krishnamurthy",
    service: "Pre-Wedding Shoot",
    rating: 5,
    quote:
      "RAP Studio transformed our pre-wedding shoot into a cinematic masterpiece. Every frame tells our love story with breathtaking depth and emotion.",
    location: "Bengaluru",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&face",
  },
  {
    name: "Arjun Venkataraman",
    service: "Wedding Cinematic Video",
    rating: 5,
    quote:
      "The wedding film they created moved us to tears. Prarthana's direction is pure magic — our guests couldn't believe it was real footage.",
    location: "Chennai",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&face",
  },
  {
    name: "Kavitha Subramaniam",
    service: "Fashion Portfolio",
    rating: 5,
    quote:
      "Ashitha's eye for fashion photography is unmatched. My portfolio landed me three brand deals within a month of the shoot. Worth every rupee!",
    location: "Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&face",
  },
  {
    name: "Rohan Shetty",
    service: "Corporate Shoot",
    rating: 5,
    quote:
      "Our company's brand identity completely transformed after the corporate shoot. The team was professional, punctual, and incredibly talented.",
    location: "Hyderabad",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&face",
  },
  {
    name: "Divya Narayanan",
    service: "Maternity Shoot",
    rating: 5,
    quote:
      "Ruchitha made me feel so comfortable and confident during my maternity shoot. The photos are treasures I'll pass down for generations.",
    location: "Mysuru",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&face",
  },
  {
    name: "Kiran Malhotra",
    service: "Short Film Direction",
    rating: 5,
    quote:
      "Our short film won at three regional festivals! The RAP team handled everything from concept to final cut with absolute brilliance.",
    location: "Mangaluru",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&face",
  },
  {
    name: "Sreelakshmi Pillai",
    service: "Portrait Photography",
    rating: 5,
    quote:
      "I was nervous about my first professional shoot, but the team made it feel effortless. My portraits now grace the walls of my living room.",
    location: "Kochi",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&face",
  },
  {
    name: "Suresh Babu",
    service: "Product Photography",
    rating: 5,
    quote:
      "Our e-commerce sales doubled after switching to RAP's product photography. The images simply make our products irresistible.",
    location: "Coimbatore",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&face",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`rating-${rating}-pos-${i + 1}`}
          size={13}
          style={{
            color: i < rating ? "oklch(0.7 0.22 70)" : "oklch(0.3 0.02 280)",
            fill: i < rating ? "oklch(0.7 0.22 70)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div
      className="flex-shrink-0 w-80 rounded-2xl border p-5 mx-3 relative overflow-hidden group"
      style={{
        borderColor: "oklch(0.3 0.02 280)",
        background: "oklch(var(--card) / 0.7)",
      }}
    >
      {/* Big decorative quote mark */}
      <div
        className="absolute -top-2 right-3 text-8xl font-serif leading-none pointer-events-none select-none"
        style={{
          color: "oklch(0.7 0.22 70 / 0.08)",
          fontFamily: "Georgia, serif",
        }}
      >
        &ldquo;
      </div>

      {/* Subtle hover glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.7 0.22 70 / 0.05) 0%, transparent 70%)",
        }}
      />

      {/* Avatar + info */}
      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div className="relative flex-shrink-0">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-11 h-11 rounded-full object-cover"
            style={{ border: "2px solid oklch(0.7 0.22 70 / 0.5)" }}
            loading="lazy"
          />
          {/* Online dot */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{
              background: "oklch(0.6 0.2 155)",
              borderColor: "oklch(var(--card))",
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm truncate">
            {testimonial.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {testimonial.service} · {testimonial.location}
          </p>
          <div className="mt-1">
            <StarRating rating={testimonial.rating} />
          </div>
        </div>
      </div>

      {/* Quote text */}
      <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4 relative z-10">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Verified badge */}
      <div className="mt-3 flex items-center gap-1.5 relative z-10">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "oklch(0.7 0.22 70)" }}
        />
        <span className="text-xs" style={{ color: "oklch(0.5 0.01 280)" }}>
          Verified Client
        </span>
      </div>
    </div>
  );
}

export function ClientStories() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="py-24 bg-muted/20"
      ref={ref}
      style={{ overflow: "hidden" }}
    >
      <div className="container mx-auto px-4 mb-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-3">Client Stories</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Moments They&apos;ll{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-gold)" }}
            >
              Never Forget
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            500+ families, couples, and brands trust RAP Studio to preserve
            their most important memories.
          </p>

          {/* Aggregate rating display */}
          <motion.div
            className="inline-flex items-center gap-3 mt-6 px-5 py-2.5 rounded-full"
            style={{
              background: "oklch(0.165 0.018 280 / 0.8)",
              border: "1px solid oklch(0.7 0.22 70 / 0.25)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex gap-0.5">
              {["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                <Star
                  key={sk}
                  size={16}
                  style={{
                    color: "oklch(0.7 0.22 70)",
                    fill: "oklch(0.7 0.22 70)",
                  }}
                />
              ))}
            </div>
            <span
              className="font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              5.0
            </span>
            <span className="text-sm text-muted-foreground">
              from 500+ reviews
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Marquee row 1 — left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex"
        style={{ animation: "marqueeLeft 40s linear infinite" }}
      >
        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
          <TestimonialCard key={`row1-${t.name}-${i}`} testimonial={t} />
        ))}
      </motion.div>

      {/* Marquee row 2 — right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex mt-4"
        style={{ animation: "marqueeRight 50s linear infinite" }}
      >
        {[
          ...TESTIMONIALS.slice().reverse(),
          ...TESTIMONIALS.slice().reverse(),
        ].map((t, i) => (
          <TestimonialCard key={`row2-${t.name}-${i}`} testimonial={t} />
        ))}
      </motion.div>

      <style>{`
        @keyframes marqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
