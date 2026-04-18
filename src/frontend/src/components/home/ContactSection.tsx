import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const CONTACT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&fit=crop",
    alt: "Portrait Session",
  },
  {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&fit=crop",
    alt: "Couple Shoot",
  },
  {
    src: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?q=80&w=800&fit=crop",
    alt: "Product Photography",
  },
  {
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&fit=crop",
    alt: "Event Coverage",
  },
  {
    src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&fit=crop",
    alt: "Film Production",
  },
  {
    src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=800&fit=crop",
    alt: "Studio Lighting",
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
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 100%, oklch(0.7 0.22 70 / 0.06) 0%, transparent 70%)",
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
            Let's Create{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-gold)" }}
            >
              Something Unforgettable
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Ready to book a session, enrol in a course, or just ask a question?
            Reach out — we'd love to hear from you.
          </p>
        </motion.div>

        {/* Contact actions — email only, no phone number */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Email — only contact info shown on page */}
          <a
            href="mailto:ruchithabs550@gmail.com"
            data-ocid="contact-email-cta"
            className="flex items-center gap-3 px-7 py-4 rounded-xl border font-semibold text-base transition-smooth hover:-translate-y-0.5"
            style={{
              background: "oklch(0.14 0.02 280 / 0.8)",
              borderColor: "oklch(0.7 0.22 70 / 0.35)",
              color: "oklch(0.7 0.22 70)",
            }}
          >
            <Mail size={20} />
            ruchithabs550@gmail.com
          </a>

          <Button
            asChild
            variant="default"
            className="btn-primary-luxury px-7 py-4 h-auto text-base rounded-xl"
            data-ocid="contact-book-cta"
          >
            <a href="/booking">
              <MessageSquare size={18} className="mr-2" />
              Book a Session
            </a>
          </Button>
        </motion.div>
      </div>

      {/* Infinite scroll image carousel */}
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
            style={{ animation: "contactCarousel 30s linear infinite" }}
            aria-hidden="true"
          >
            {[...CONTACT_IMAGES, ...CONTACT_IMAGES, ...CONTACT_IMAGES].map(
              (img, i) => {
                const key = `contact-img-${i}`;
                return (
                  <div
                    key={key}
                    className="flex-shrink-0 w-72 h-48 rounded-2xl overflow-hidden border"
                    style={{ borderColor: "oklch(0.7 0.22 70 / 0.18)" }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      loading="lazy"
                    />
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
