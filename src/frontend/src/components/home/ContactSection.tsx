import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const CONTACT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&fit=crop",
    alt: "Wedding Photography",
  },
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

const WhatsAppIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

          {/* WhatsApp — direct chat link, no form or modal */}
          <button
            type="button"
            data-ocid="contact-whatsapp-cta"
            aria-label="Chat on WhatsApp"
            onClick={() => window.open("https://wa.me/917338501228", "_blank")}
            className="flex items-center gap-3 px-7 py-4 rounded-xl font-semibold text-base transition-smooth hover:-translate-y-0.5 border cursor-pointer"
            style={{
              background: "#25D36620",
              borderColor: "#25D36650",
              color: "#25D366",
            }}
          >
            <WhatsAppIcon />
            Chat on WhatsApp
          </button>

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
