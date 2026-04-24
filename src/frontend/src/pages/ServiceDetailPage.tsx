import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BookingModal } from "../components/booking/BookingModal";
import { Layout } from "../components/layout/Layout";
import { ServiceDetailHero } from "../components/services/ServiceDetailHero";
import { SubServiceSelector } from "../components/services/SubServiceSelector";
import { getServiceById } from "../data/services";
import { useAuth } from "../hooks/useAuth";
import type { SubService } from "../types";

const WHATS_INCLUDED = [
  "Professional RAP studio photographer / videographer",
  "High-resolution edited deliverables",
  "Online gallery delivery within 7 days",
  "1 round of revision feedback",
  "Usage rights for personal & social media",
  "Pre-shoot consultation call",
];

const WHATSAPP_NUMBER = "917338501228";

export function ServiceDetailPage() {
  const { serviceId } = useParams({ from: "/services/$serviceId" });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const service = getServiceById(serviceId);
  const [selectedSubService, setSelectedSubService] =
    useState<SubService | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!service) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-24 text-center">
          <p className="text-muted-foreground text-lg">Service not found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate({ to: "/services" })}
          >
            ← Back to Services
          </Button>
        </div>
      </Layout>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    setBookingOpen(true);
  };

  return (
    <Layout>
      {/* Back button */}
      <div className="container mx-auto px-6 py-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/services" })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          data-ocid="service-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          All Services
        </button>
      </div>

      {/* Cinematic hero */}
      <ServiceDetailHero service={service} />

      <div className="container mx-auto px-6 py-12 space-y-16 max-w-4xl">
        {/* Sub-service selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SubServiceSelector
            service={service}
            selectedSubService={selectedSubService}
            onSelect={setSelectedSubService}
          />
        </motion.div>

        {/* What's included */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              {"What's Included"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHATS_INCLUDED.map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How it works — replaces pricing section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              How It Works
            </h2>
          </div>
          <div
            className="rounded-2xl p-6 border space-y-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.22 70 / 0.08), oklch(0.68 0.2 290 / 0.05))",
              borderColor: "oklch(0.7 0.22 70 / 0.3)",
            }}
          >
            {[
              {
                num: "1",
                text: "Select your services and preferred date/time",
              },
              {
                num: "2",
                text: "Pay a small deposit via Stripe to confirm your slot",
              },
              {
                num: "3",
                text: "Our team contacts you within 24 hours to finalize details",
              },
              {
                num: "4",
                text: "Receive your deliverables — remaining balance collected after delivery",
              },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-3 text-sm">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "oklch(0.7 0.22 70 / 0.2)",
                    color: "oklch(0.85 0.18 70)",
                  }}
                >
                  {step.num}
                </span>
                <span className="text-foreground">{step.text}</span>
              </div>
            ))}
            <p
              className="text-xs text-muted-foreground pt-2 border-t"
              style={{ borderColor: "oklch(0.7 0.22 70 / 0.15)" }}
            >
              💳 Secure Stripe payment · No advance required to submit your
              request
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 pb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Button
            size="lg"
            className="flex-1 h-14 text-base font-bold"
            onClick={handleBookNow}
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.62 0.18 65))",
              color: "oklch(0.99 0.002 70)",
              boxShadow: "0 4px 24px oklch(0.7 0.22 70 / 0.4)",
            }}
            data-ocid="service-book-now"
          >
            {selectedSubService
              ? `Book ${selectedSubService.name}`
              : "Book Now"}
          </Button>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hi! I'm interested in ${service.name}${selectedSubService ? ` - ${selectedSubService.name}` : ""}. Can you tell me more?`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 text-base gap-2"
              data-ocid="service-whatsapp"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        service={service}
        selectedSubService={selectedSubService}
      />
    </Layout>
  );
}
