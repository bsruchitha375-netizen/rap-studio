import {
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { motion } from "motion/react";
import { BookingForm } from "../components/booking/BookingForm";
import { Layout } from "../components/layout/Layout";

const FEATURES = [
  {
    icon: <ShoppingCart className="w-5 h-5 text-primary" />,
    title: "Multi-Service Booking",
    desc: "Select multiple services in one booking — photography, videography, and more together.",
  },
  {
    icon: <Clock className="w-5 h-5 text-primary" />,
    title: "Flexible Scheduling",
    desc: "Pick any date, time and duration. No fixed slots — full control is yours.",
  },
  {
    icon: <MapPin className="w-5 h-5 text-primary" />,
    title: "Any Location",
    desc: "Studio, indoor venue, outdoor, or a custom address — we come to you.",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
    title: "Instant Confirmation",
    desc: "Pay a small ₹2 per service deposit and your slot is secured immediately.",
  },
];

export function BookingPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-[0.06] bg-primary blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full opacity-[0.04] bg-accent blur-3xl" />
          <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full opacity-[0.03] bg-primary blur-2xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <span className="section-label">Studio Booking</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Book Your{" "}
              <span className="text-primary text-glow-gold">
                Perfect Session
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose from 23 service categories, mix and match sub-services,
              pick your date and time — and let RAP Studio craft something
              extraordinary.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl border p-3 text-left"
                style={{
                  background: "oklch(0.7 0.22 70 / 0.05)",
                  borderColor: "oklch(0.7 0.22 70 / 0.2)",
                }}
              >
                <div className="mb-1.5">{f.icon}</div>
                <p className="text-xs font-bold text-foreground leading-tight">
                  {f.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="pb-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div
              className="rounded-2xl border p-6 md:p-8 shadow-luxury"
              style={{
                background: "oklch(0.165 0.018 280)",
                borderColor: "oklch(0.28 0.02 280 / 0.6)",
              }}
            >
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  Session Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select services, set your schedule, and pay a small deposit to
                  confirm. Our team reviews every booking within 24 hours.
                </p>
              </div>
              <BookingForm
                onSuccess={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
