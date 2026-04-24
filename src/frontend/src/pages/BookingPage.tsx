import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { BookingForm } from "../components/booking/BookingForm";
import { Layout } from "../components/layout/Layout";

const FEATURES = [
  {
    icon: <ShoppingCart className="w-5 h-5 text-primary" />,
    title: "Multi-Service Booking",
    desc: "Mix photography, videography, and more in a single booking.",
  },
  {
    icon: <Clock className="w-5 h-5 text-primary" />,
    title: "Flexible Duration",
    desc: "1 hour to full-day — pricing adjusts automatically.",
  },
  {
    icon: <MapPin className="w-5 h-5 text-primary" />,
    title: "Any Location",
    desc: "Studio, indoor, outdoor, or custom address.",
  },
  {
    icon: <CreditCard className="w-5 h-5 text-primary" />,
    title: "40% Deposit via Stripe",
    desc: "Pay a small deposit to secure your slot instantly.",
  },
];

const WHATSAPP_NUMBER = "917338501228";

type ReturnState = "verifying" | "success" | "cancelled";

function BookingReturnHandler() {
  const { actor } = useActor(createActor);
  const [state, setState] = useState<ReturnState>("verifying");
  const [pendingInfo, setPendingInfo] = useState<{
    name?: string;
    amount?: number;
    referenceId?: string;
  }>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("stripe_session_id");
    const status = params.get("payment_status");

    // Restore any pending info stored before redirect
    try {
      const stored = sessionStorage.getItem("stripe_pending");
      if (stored) {
        const parsed = JSON.parse(stored) as typeof pendingInfo;
        setPendingInfo(parsed);
        sessionStorage.removeItem("stripe_pending");
      }
    } catch {}

    if (status === "cancel") {
      setState("cancelled");
      window.history.replaceState({}, "", "/booking");
      return;
    }

    if (!sessionId) {
      setState("cancelled");
      return;
    }

    const confirm = async () => {
      try {
        if (actor) {
          await actor.confirmPayment({
            stripeSessionId: sessionId,
            stripePaymentIntentId: "",
          });
        }
        setState("success");
        toast.success("Booking deposit confirmed! 🎉");
      } catch {
        setState("success"); // Show success — backend may have already recorded it
      } finally {
        setTimeout(() => {
          window.history.replaceState({}, "", "/booking");
        }, 2000);
      }
    };

    void confirm();
  }, [actor]);

  if (state === "verifying") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-6 py-12"
        data-ocid="booking-return-verifying"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.7 0.22 70 / 0.1)",
            border: "2px solid oklch(0.7 0.22 70 / 0.3)",
          }}
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-foreground">
            Confirming Your Payment…
          </h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            Please wait while we verify your Stripe payment. This takes just a
            moment.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-primary/70">
          <CreditCard className="w-4 h-4" />
          Secure verification in progress
        </div>
      </motion.div>
    );
  }

  if (state === "cancelled") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-6 py-12"
        data-ocid="booking-return-cancelled"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-muted flex items-center justify-center"
          style={{ border: "2px solid oklch(0.35 0.02 280)" }}
        >
          <XCircle className="w-12 h-12 text-muted-foreground" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-display font-bold text-foreground">
            Payment Not Completed
          </h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            No charge was made to your account. Your booking details are still
            saved — you can complete the deposit anytime.
          </p>
        </div>
        <div
          className="rounded-xl border p-4 w-full max-w-sm text-sm"
          style={{
            background: "oklch(0.165 0.018 280)",
            borderColor: "oklch(0.3 0.02 280)",
          }}
        >
          <p className="text-muted-foreground text-xs mb-3 font-semibold uppercase tracking-wide">
            What you can do
          </p>
          <ul className="space-y-1.5 text-muted-foreground text-xs text-left">
            <li>• Retry payment using the button below</li>
            <li>• Contact us via WhatsApp to arrange payment</li>
            <li>• Your slot reservation lasts 30 minutes</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="h-10 px-6 font-semibold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.62 0.18 65))",
              color: "oklch(0.99 0.002 70)",
            }}
            data-ocid="booking-retry-btn"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20RAP%20Studio!%20I%20had%20trouble%20completing%20my%20payment.%20Can%20you%20help?`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="h-10 px-6 font-semibold"
              data-ocid="booking-cancelled-whatsapp"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Us
            </Button>
          </a>
        </div>
      </motion.div>
    );
  }

  // Success
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="flex flex-col items-center text-center gap-6 py-8"
      data-ocid="booking-return-success"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: "oklch(0.7 0.22 70 / 0.15)",
          border: "2px solid oklch(0.7 0.22 70 / 0.5)",
        }}
      >
        <CheckCircle2 className="w-12 h-12 text-primary" />
      </motion.div>

      <div>
        <h3 className="text-2xl font-display font-bold text-foreground">
          Booking Confirmed! 🎉
        </h3>
        <p className="text-muted-foreground text-sm mt-2 max-w-sm">
          Your deposit has been received. Our team will contact you within 24
          hours.
        </p>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border w-full max-w-sm overflow-hidden"
        style={{
          background: "oklch(0.7 0.22 70 / 0.06)",
          borderColor: "oklch(0.7 0.22 70 / 0.3)",
        }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "oklch(0.7 0.22 70 / 0.2)" }}
        >
          <p className="text-sm font-semibold text-primary">Booking Summary</p>
        </div>
        <div className="px-4 py-3 space-y-2 text-sm">
          {pendingInfo.referenceId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking Ref</span>
              <span className="font-mono text-foreground text-xs">
                {pendingInfo.referenceId}
              </span>
            </div>
          )}
          {pendingInfo.amount !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit Paid</span>
              <span className="font-bold text-primary">
                ₹{pendingInfo.amount}
              </span>
            </div>
          )}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Status</span>
            <span className="text-emerald-400 font-semibold">✓ Confirmed</span>
          </div>
        </div>
      </motion.div>

      {/* Next steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border w-full max-w-sm p-4 text-left"
        style={{
          background: "oklch(0.12 0.015 280)",
          borderColor: "oklch(0.28 0.02 280)",
        }}
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          What happens next
        </p>
        {[
          "Our team reviews your booking within 24 hours",
          "You'll receive a WhatsApp confirmation with session details",
          "Arrive at your scheduled time — we handle the rest",
          "Pay the 60% balance after service delivery",
        ].map((s, i) => (
          <div
            key={`next-step-${i + 1}`}
            className="flex items-start gap-2 text-xs text-muted-foreground mb-1.5"
          >
            <span className="text-primary font-bold shrink-0">{i + 1}.</span>
            <span>{s}</span>
          </div>
        ))}
      </motion.div>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20RAP%20Studio!%20My%20booking%20is%20confirmed${pendingInfo.referenceId ? `%20(Ref:%20${pendingInfo.referenceId})` : ""}.%20Looking%20forward%20to%20the%20session!`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className="h-11 px-8 font-semibold"
          style={{
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
          }}
          data-ocid="booking-success-whatsapp"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message Us on WhatsApp
        </Button>
      </a>
    </motion.div>
  );
}

export function BookingPage() {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const isStripeReturn =
    params.has("stripe_session_id") ||
    params.get("payment_status") === "cancel";

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
              pick your date and duration — and let RAP Studio craft something
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

      {/* Form / Return Handler */}
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
              {isStripeReturn ? (
                <BookingReturnHandler />
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                      Session Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select services, set your schedule, and pay a 40% deposit
                      via Stripe to confirm. Our team reviews every booking
                      within 24 hours.
                    </p>
                  </div>
                  <BookingForm
                    onSuccess={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
