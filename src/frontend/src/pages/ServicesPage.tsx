import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Layout } from "../components/layout/Layout";
import { OrbitalServices } from "../components/services/OrbitalServices";
import { ServiceCard } from "../components/services/ServiceCard";
import { SERVICE_CATEGORIES } from "../data/services";

export function ServicesPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-28 text-center"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.3 0.12 70 / 0.35), transparent 65%), oklch(0.12 0.015 280)",
        }}
      >
        {/* Animated lens flare */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.22 70 / 0.12) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6 uppercase tracking-widest"
            style={{
              background: "oklch(0.7 0.22 70 / 0.1)",
              borderColor: "oklch(0.7 0.22 70 / 0.35)",
              color: "oklch(0.85 0.18 70)",
            }}
          >
            📸 23 Service Categories
          </motion.div>

          <motion.h1
            className="section-heading text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ textShadow: "0 0 60px oklch(0.7 0.22 70 / 0.3)" }}
          >
            Our{" "}
            <span className="relative inline-block">
              <span
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.68 0.2 290))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Services
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "var(--gradient-gold)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.5 }}
              />
            </span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            From intimate portraits to grand cinematic productions — every
            frame, perfectly crafted.
          </motion.p>
        </div>
      </section>

      {/* Orbital UI */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <OrbitalServices />
          </motion.div>
        </div>
      </section>

      {/* All services list */}
      <section
        id="services-list"
        className="py-16 bg-muted/20 border-t border-border/20"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="section-label mb-3">All Services</p>
            <h2 className="section-subheading text-foreground mb-3">
              All Service Categories
            </h2>
            {/* Decorative gold divider */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/60" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/60" />
            </div>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Browse and book any of our {SERVICE_CATEGORIES.length}{" "}
              professional photography &amp; videography services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {SERVICE_CATEGORIES.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                data-ocid={`services.item.${i + 1}`}
              >
                <ServiceCard
                  service={service}
                  onClick={() =>
                    navigate({
                      to: "/services/$serviceId",
                      params: { serviceId: service.id },
                    })
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
