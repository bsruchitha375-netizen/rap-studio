import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

// CSS gradient tiles — no external images needed
const SHOWCASE_TILES = [
  {
    gradient:
      "linear-gradient(135deg, oklch(0.28 0.08 70), oklch(0.18 0.05 75))",
    emoji: "💑",
    label: "Wedding Shoot",
  },
  {
    gradient:
      "linear-gradient(135deg, oklch(0.22 0.08 290), oklch(0.16 0.05 280))",
    emoji: "📸",
    label: "Portrait Session",
  },
  {
    gradient:
      "linear-gradient(135deg, oklch(0.24 0.08 30), oklch(0.17 0.05 40))",
    emoji: "🎥",
    label: "Film Production",
  },
  {
    gradient:
      "linear-gradient(135deg, oklch(0.22 0.07 190), oklch(0.15 0.05 180))",
    emoji: "✨",
    label: "Fashion Shoot",
  },
  {
    gradient:
      "linear-gradient(135deg, oklch(0.26 0.08 82), oklch(0.18 0.05 70))",
    emoji: "🎬",
    label: "Short Film",
  },
  {
    gradient:
      "linear-gradient(135deg, oklch(0.22 0.07 155), oklch(0.15 0.05 145))",
    emoji: "🎭",
    label: "Event Coverage",
  },
  {
    gradient:
      "linear-gradient(135deg, oklch(0.2 0.06 250), oklch(0.14 0.04 260))",
    emoji: "🏢",
    label: "Corporate Shoot",
  },
  {
    gradient:
      "linear-gradient(135deg, oklch(0.24 0.07 25), oklch(0.17 0.05 35))",
    emoji: "💍",
    label: "Pre-Wedding",
  },
];

export function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      className="py-24 relative overflow-hidden"
      ref={ref}
      style={{
        background:
          "linear-gradient(180deg, oklch(0.13 0.018 280) 0%, oklch(0.10 0.015 275) 100%)",
      }}
    >
      {/* Ambient gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 100%, oklch(0.7 0.22 70 / 0.07) 0%, transparent 70%)",
        }}
      />

      {/* Teal glow top-right */}
      <motion.div
        className="absolute -top-32 right-0 w-96 h-96 pointer-events-none"
        animate={{ opacity: [0.03, 0.1, 0.03] }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.66 0.18 180 / 0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-3">Get In Touch</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Let&apos;s Create{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-gold)" }}
            >
              Something Unforgettable
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Ready to book a session, enrol in a course, or just ask a question?
            Reach out — we&apos;d love to hear from you.
          </p>
        </motion.div>

        {/* Contact cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Email */}
          <a
            href="mailto:ruchithabs550@gmail.com"
            data-ocid="contact.email.link"
            className="flex flex-col items-center gap-3 px-6 py-6 rounded-2xl border font-semibold transition-smooth hover:-translate-y-1 group"
            style={{
              background: "oklch(0.14 0.02 280 / 0.7)",
              borderColor: "oklch(0.7 0.22 70 / 0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.7 0.22 70 / 0.15)",
                border: "1px solid oklch(0.7 0.22 70 / 0.4)",
              }}
            >
              <Mail size={22} style={{ color: "oklch(0.7 0.22 70)" }} />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">
                Email
              </p>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-smooth break-all">
                ruchithabs550@gmail.com
              </p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/917338501228"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="contact.whatsapp.link"
            className="flex flex-col items-center gap-3 px-6 py-6 rounded-2xl border font-semibold transition-smooth hover:-translate-y-1 group"
            style={{
              background: "oklch(0.14 0.02 280 / 0.7)",
              borderColor: "oklch(0.55 0.2 150 / 0.35)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.55 0.2 150 / 0.15)",
                border: "1px solid oklch(0.55 0.2 150 / 0.4)",
              }}
            >
              <Phone size={22} style={{ color: "oklch(0.62 0.2 150)" }} />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">
                WhatsApp
              </p>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-smooth">
                +91 73385 01228
              </p>
            </div>
          </a>

          {/* Book CTA */}
          <Button
            asChild
            className="btn-primary-luxury h-auto rounded-2xl py-6 flex flex-col gap-3 items-center"
            data-ocid="contact.book_cta.primary_button"
          >
            <a href="/booking" className="flex flex-col gap-3 items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0.1 0.01 270 / 0.4)",
                  border: "1px solid oklch(0.99 0.002 80 / 0.3)",
                }}
              >
                <MessageSquare size={22} />
              </div>
              <div className="text-center">
                <p className="text-xs opacity-70 mb-1 uppercase tracking-widest">
                  Studio
                </p>
                <p className="text-sm font-semibold">Book a Session</p>
              </div>
            </a>
          </Button>
        </motion.div>
      </div>

      {/* Infinite scroll CSS gradient tiles */}
      <div
        className="w-full overflow-hidden"
        aria-label="Studio photography showcase"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div
            className="flex gap-4"
            style={{ animation: "contactCarousel 32s linear infinite" }}
            aria-hidden="true"
          >
            {[...SHOWCASE_TILES, ...SHOWCASE_TILES, ...SHOWCASE_TILES].map(
              (tile, i) => {
                const key = `contact-tile-${i}`;
                return (
                  <div
                    key={key}
                    className="flex-shrink-0 w-72 h-48 rounded-2xl overflow-hidden border relative flex items-end p-4"
                    style={{
                      background: tile.gradient,
                      borderColor: "oklch(0.7 0.22 70 / 0.18)",
                    }}
                  >
                    {/* Emoji backdrop */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span
                        className="text-7xl opacity-15"
                        style={{ filter: "blur(2px)" }}
                      >
                        {tile.emoji}
                      </span>
                    </div>
                    {/* Shine */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                    {/* Bottom overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Label */}
                    <span className="relative z-10 text-xs font-semibold text-white/80 tracking-wide">
                      {tile.label}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes contactCarousel {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  );
}
