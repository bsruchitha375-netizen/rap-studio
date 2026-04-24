import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type BookingInput as BackendBookingInput,
  type LocationType as BackendLocationType,
  TimeSlot as BackendTimeSlot,
  createActor,
} from "../../backend";
import { SERVICE_CATEGORIES } from "../../data/services";
import { useAuth } from "../../hooks/useAuth";
import {
  calcDepositPerService,
  depositRateLabel,
  pricePerService,
  useStripe,
} from "../../hooks/useStripe";
import type { ServiceCategory, SubService } from "../../types";
import { MultiSubServiceSelector } from "../services/SubServiceSelector";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SelectedServiceItem {
  serviceId: string;
  subServiceId: string;
  serviceName: string;
  subServiceName: string;
  price: number;
}

interface BookingFormProps {
  initialService?: ServiceCategory;
  initialSubService?: SubService | null;
  onSuccess: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TIME_PRESETS: {
  label: string;
  time: string;
  display: string;
  backend: BackendTimeSlot;
}[] = [
  {
    label: "Morning",
    time: "09:00",
    display: "9:00 AM",
    backend: BackendTimeSlot.Morning,
  },
  {
    label: "Afternoon",
    time: "14:00",
    display: "2:00 PM",
    backend: BackendTimeSlot.Afternoon,
  },
  {
    label: "Evening",
    time: "18:00",
    display: "6:00 PM",
    backend: BackendTimeSlot.Evening,
  },
  {
    label: "Night",
    time: "21:00",
    display: "9:00 PM",
    backend: BackendTimeSlot.Night,
  },
  {
    label: "Half Day",
    time: "08:00",
    display: "Half Day",
    backend: BackendTimeSlot.HalfDay,
  },
  {
    label: "Full Day",
    time: "06:00",
    display: "Full Day",
    backend: BackendTimeSlot.FullDay,
  },
];

const DURATIONS = [
  { label: "1 Hour — ₹100/service", value: "1 hour", price: 100 },
  { label: "2 Hours — ₹200/service", value: "2 hours", price: 200 },
  { label: "3 Hours — ₹350/service", value: "3 hours", price: 350 },
  { label: "4 Hours — ₹450/service", value: "4 hours", price: 450 },
  { label: "Half Day — ₹500/service", value: "Half Day", price: 500 },
  { label: "Full Day — ₹800/service", value: "Full Day", price: 800 },
  { label: "Custom Duration", value: "Custom", price: 0 },
];

const INDOOR_VENUES = ["Studio A", "Studio B", "Conference Room"];
type UILocationType = "indoor" | "outdoor" | "studio" | "custom";

const LOCATION_OPTIONS: { id: UILocationType; label: string; desc: string }[] =
  [
    { id: "studio", label: "🎬 Studio", desc: "RAP Main Studio" },
    { id: "indoor", label: "🏠 Indoor", desc: "Choose venue" },
    { id: "outdoor", label: "🌿 Outdoor", desc: "Your choice" },
    { id: "custom", label: "📍 Custom", desc: "Any location" },
  ];

const SELECTED_STYLE = {
  background: "oklch(0.7 0.22 70 / 0.15)",
  borderColor: "oklch(0.7 0.22 70 / 0.6)",
};
const UNSELECTED_STYLE = {
  background: "oklch(0.165 0.018 280)",
  borderColor: "oklch(0.3 0.02 280)",
};
const COLOR_SELECTED = "oklch(0.85 0.18 70)";
const COLOR_UNSELECTED = "oklch(0.93 0.01 280)";
const SUPPORT_EMAIL = "ruchithabs550@gmail.com";
const WHATSAPP_NUMBER = "917338501228";

type FormStep = "form" | "review" | "success" | "paying";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deriveBackendSlot(hhmm: string): BackendTimeSlot {
  const preset = TIME_PRESETS.find((p) => p.time === hhmm);
  if (preset) return preset.backend;
  const hour = Number.parseInt(hhmm.split(":")[0] ?? "9", 10);
  if (hour >= 6 && hour < 12) return BackendTimeSlot.Morning;
  if (hour >= 12 && hour < 16) return BackendTimeSlot.Afternoon;
  if (hour >= 16 && hour < 20) return BackendTimeSlot.Evening;
  return BackendTimeSlot.Night;
}

function toBackendLocation(
  type: UILocationType,
  addr: string,
): BackendLocationType {
  if (type === "outdoor") return { __kind__: "Outdoor", Outdoor: null };
  if (type === "custom") return { __kind__: "Custom", Custom: addr };
  if (type === "indoor") return { __kind__: "Indoor", Indoor: null };
  return { __kind__: "Studio", Studio: null };
}

function formatDisplayTime(hhmm: string): string {
  const preset = TIME_PRESETS.find((p) => p.time === hhmm);
  if (preset) return preset.display;
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = (h ?? 0) >= 12 ? "PM" : "AM";
  const hr12 = (h ?? 0) % 12 || 12;
  return `${hr12}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

function saveToLocalStorage(booking: {
  id: string;
  selectedServices: SelectedServiceItem[];
  date: string;
  timeSlot: string;
  location: string;
  notes: string;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
}) {
  const existing = JSON.parse(
    localStorage.getItem("rap_bookings") ?? "[]",
  ) as (typeof booking)[];
  existing.push(booking);
  localStorage.setItem("rap_bookings", JSON.stringify(existing));
}

// ─── Price Breakdown Badge ────────────────────────────────────────────────────

function PriceBadge({ duration }: { duration: string }) {
  if (!duration) return null;
  const full = pricePerService(duration);
  const deposit = calcDepositPerService(duration);
  return (
    <motion.span
      key={duration}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        background: "oklch(0.7 0.22 70 / 0.15)",
        color: "oklch(0.88 0.18 70)",
        border: "1px solid oklch(0.7 0.22 70 / 0.3)",
      }}
    >
      ₹{full}/service · ₹{deposit} deposit (40%)
    </motion.span>
  );
}

// ─── Order Summary Panel ──────────────────────────────────────────────────────

function OrderSummary({
  items,
  duration,
  date,
  timeDisplay,
  onRemove,
}: {
  items: SelectedServiceItem[];
  duration: string;
  date?: string;
  timeDisplay?: string;
  onRemove?: (item: SelectedServiceItem) => void;
}) {
  const priceEach = pricePerService(duration);
  const depositEach = calcDepositPerService(duration);
  const totalFull = items.length * priceEach;
  const totalDeposit = items.length * depositEach;
  const rateLabel = depositRateLabel(duration);

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border p-4 text-center text-sm text-muted-foreground"
        style={{ borderColor: "oklch(0.28 0.02 280)" }}
        data-ocid="order-summary-empty"
      >
        <ShoppingCart className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>No services selected yet</p>
        <p className="text-xs mt-1 opacity-70">
          Expand a category below to pick sub-services
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{
        background: "oklch(0.7 0.22 70 / 0.06)",
        borderColor: "oklch(0.7 0.22 70 / 0.35)",
      }}
      data-ocid="order-summary"
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: "oklch(0.7 0.22 70 / 0.2)" }}
      >
        <p className="font-semibold text-primary text-sm flex items-center gap-2 flex-wrap">
          <ShoppingCart className="w-4 h-4 shrink-0" />
          Order Summary ({items.length}{" "}
          {items.length === 1 ? "service" : "services"})
          {duration && <PriceBadge duration={duration} />}
        </p>
      </div>

      <div className="px-4 py-3 space-y-2">
        {items.map((item, idx) => (
          <motion.div
            key={`${item.serviceId}-${item.subServiceId}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ delay: idx * 0.04 }}
            className="flex items-center justify-between gap-2 text-sm"
            data-ocid={`order-item.${idx + 1}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium truncate">
                {item.subServiceName}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {item.serviceName}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {duration && (
                <span className="text-primary font-semibold text-xs">
                  ₹{priceEach}
                </span>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
                  aria-label={`Remove ${item.subServiceName}`}
                  data-ocid={`order-remove.${idx + 1}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {(date || timeDisplay) && (
        <div
          className="px-4 py-2 text-xs text-muted-foreground border-t"
          style={{ borderColor: "oklch(0.7 0.22 70 / 0.15)" }}
        >
          {date && <span>📅 {date}</span>}
          {timeDisplay && <span> · {timeDisplay}</span>}
          {duration && <span> · ⏱ {duration}</span>}
        </div>
      )}

      <div
        className="px-4 py-3 border-t space-y-1.5"
        style={{ borderColor: "oklch(0.7 0.22 70 / 0.2)" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${items.length}-${depositEach}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            {duration && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Service total ({items.length} × ₹{priceEach})
                  </span>
                  <span className="font-semibold text-foreground">
                    ₹{totalFull}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Deposit now (40% · {rateLabel})
                  </span>
                  <span className="font-bold text-primary">
                    ₹{totalDeposit}
                  </span>
                </div>
                <div
                  className="flex justify-between text-xs text-muted-foreground pt-1 border-t"
                  style={{ borderColor: "oklch(0.7 0.22 70 / 0.15)" }}
                >
                  <span>Balance after delivery</span>
                  <span>₹{totalFull - totalDeposit}</span>
                </div>
              </>
            )}
            {!duration && (
              <p className="text-xs text-muted-foreground italic">
                Select a duration to see pricing
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Paying Screen ────────────────────────────────────────────────────────────

function PayingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center gap-5 py-8"
      data-ocid="booking-paying-state"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
      <div>
        <h3 className="text-xl font-display font-bold text-foreground">
          Preparing Secure Checkout…
        </h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">
          You'll be redirected to Stripe's secure payment page. Please do not
          close this window.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-primary/80">
        <ShieldCheck className="w-4 h-4" />
        256-bit SSL encrypted · Powered by Stripe
      </div>
    </motion.div>
  );
}

// ─── Auth Gate Banner ─────────────────────────────────────────────────────────

function AuthGateBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4 flex items-start gap-3 mb-4"
      style={{
        background: "oklch(0.68 0.2 290 / 0.08)",
        borderColor: "oklch(0.68 0.2 290 / 0.35)",
      }}
      data-ocid="booking-auth-gate"
    >
      <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Account required to book
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Please create an account or log in to submit your booking and make
          payment.
        </p>
        <Button
          size="sm"
          className="mt-2 h-8 text-xs font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.62 0.18 65))",
            color: "oklch(0.99 0.002 70)",
          }}
          onClick={() => {
            window.location.href = `/login?return=${encodeURIComponent(window.location.pathname)}`;
          }}
          data-ocid="booking-login-redirect-btn"
        >
          Login / Register →
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookingForm({
  initialService,
  initialSubService,
  onSuccess,
}: BookingFormProps) {
  const { actor } = useActor(createActor);
  const { isAuthenticated } = useAuth();
  const { initiatePayment, isLoading: isPaymentLoading } = useStripe();

  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    initialService?.id ?? null,
  );
  const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>(
    () => {
      if (initialService && initialSubService) {
        return [
          {
            serviceId: initialService.id,
            subServiceId: initialSubService.id,
            serviceName: initialService.name,
            subServiceName: initialSubService.name,
            price: initialSubService.price,
          },
        ];
      }
      return [];
    },
  );

  const [date, setDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [locationType, setLocationType] = useState<UILocationType>("studio");
  const [indoorVenue, setIndoorVenue] = useState(INDOOR_VENUES[0]);
  const [customAddress, setCustomAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<FormStep>("form");
  const [bookingRef, setBookingRef] = useState("");

  const effectiveDuration = duration === "Custom" ? customDuration : duration;
  const priceEach = pricePerService(effectiveDuration);
  const depositEach = calcDepositPerService(effectiveDuration);
  const totalAmount = selectedItems.length * priceEach;
  const depositAmount = selectedItems.length * depositEach;

  const toggleSubService = (service: ServiceCategory, sub: SubService) => {
    setSelectedItems((prev) => {
      const exists = prev.find(
        (i) => i.serviceId === service.id && i.subServiceId === sub.id,
      );
      if (exists)
        return prev.filter(
          (i) => !(i.serviceId === service.id && i.subServiceId === sub.id),
        );
      return [
        ...prev,
        {
          serviceId: service.id,
          subServiceId: sub.id,
          serviceName: service.name,
          subServiceName: sub.name,
          price: sub.price,
        },
      ];
    });
  };

  const removeItem = (item: SelectedServiceItem) => {
    setSelectedItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.serviceId === item.serviceId &&
            i.subServiceId === item.subServiceId
          ),
      ),
    );
  };

  const getSelectedSubsForService = (serviceId: string): SubService[] => {
    const svc = SERVICE_CATEGORIES.find((s) => s.id === serviceId);
    if (!svc) return [];
    return svc.subServices.filter((sub) =>
      selectedItems.some(
        (i) => i.serviceId === serviceId && i.subServiceId === sub.id,
      ),
    );
  };

  const handlePresetClick = (preset: (typeof TIME_PRESETS)[number]) => {
    setCustomTime(preset.time);
    setActivePreset(preset.label);
  };

  const handleTimeInputChange = (val: string) => {
    setCustomTime(val);
    const matched = TIME_PRESETS.find((p) => p.time === val);
    setActivePreset(matched ? matched.label : null);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor || selectedItems.length === 0) throw new Error("no_actor");
      const primary = selectedItems[0];
      const allServicesNote = selectedItems
        .map((i) => `${i.serviceName} — ${i.subServiceName}`)
        .join("; ");
      const fullDatetime = `${date}T${customTime}`;
      const backendSlot = deriveBackendSlot(customTime);
      const backendLocation = toBackendLocation(
        locationType,
        locationType === "indoor" ? (indoorVenue ?? "") : customAddress,
      );
      const input: BackendBookingInput = {
        serviceId: primary.serviceId,
        subService: primary.subServiceName,
        date: fullDatetime,
        timeSlot: backendSlot,
        duration: effectiveDuration,
        location: backendLocation,
        notes: `[MULTI-SERVICE] ${allServicesNote}${notes ? ` | Notes: ${notes}` : ""}`,
      };
      return actor.createBookingRequest(input);
    },
    onSuccess: () => {
      const ref = `BK-${Date.now()}`;
      setBookingRef(ref);
      setStep("review");
    },
    onError: () => {
      const ref = `BK-${Date.now()}`;
      const locationLabel =
        locationType === "studio"
          ? "RAP Studio"
          : locationType === "indoor"
            ? (indoorVenue ?? "")
            : customAddress || locationType;
      saveToLocalStorage({
        id: ref,
        selectedServices: selectedItems,
        date,
        timeSlot: customTime,
        location: locationLabel,
        notes,
        totalAmount,
        depositAmount,
        createdAt: new Date().toISOString(),
      });
      setBookingRef(ref);
      setStep("review");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0)
      return void toast.error("Please select at least one service");
    if (!date) return void toast.error("Please select a date");
    if (!customTime) return void toast.error("Please enter or pick a time");
    if (!duration) return void toast.error("Please select a duration");
    if (duration === "Custom" && !customDuration)
      return void toast.error("Please enter a custom duration (HH:MM)");
    mutation.mutate();
  };

  const triggerStripeCheckout = async () => {
    setStep("paying");
    await initiatePayment({
      amount: depositAmount,
      name: "RAP Studio Booking",
      description: `${selectedItems.length} service${selectedItems.length > 1 ? "s" : ""} · ${effectiveDuration || "booking"} · ₹${depositEach}/service deposit`,
      referenceId: bookingRef,
      paymentType: "booking_initial",
      onRedirecting: () => {
        setStep("paying");
      },
      onFailure: (err) => {
        toast.error(err || "Payment failed. Please try again.");
        setStep("review");
      },
    });
    toast.success(
      "Booking secured! Our team will contact you within 24 hours. 📸",
    );
    setStep("success");
    onSuccess();
  };

  // ── Paying step ─────────────────────────────────────────────────────────────
  if (step === "paying") return <PayingScreen />;

  // ── Success step ────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="flex flex-col items-center text-center gap-5 py-4"
        data-ocid="booking-success"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-display font-bold text-foreground">
            Booking Confirmed! 🎉
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ref: <span className="text-primary font-mono">{bookingRef}</span>
          </p>
        </div>
        <div
          className="rounded-xl p-4 text-sm text-left w-full border space-y-2"
          style={{
            background: "oklch(0.7 0.22 70 / 0.07)",
            borderColor: "oklch(0.7 0.22 70 / 0.3)",
          }}
        >
          <p className="font-semibold text-primary">Services booked:</p>
          {selectedItems.map((item) => (
            <p
              key={`${item.serviceId}-${item.subServiceId}`}
              className="text-muted-foreground text-xs"
            >
              ✦ {item.serviceName} — {item.subServiceName}
            </p>
          ))}
          <div
            className="border-t pt-2 mt-2"
            style={{ borderColor: "oklch(0.7 0.22 70 / 0.2)" }}
          >
            <p className="text-muted-foreground">
              📅 {date} at {formatDisplayTime(customTime)}
            </p>
            {effectiveDuration && (
              <p className="text-muted-foreground">
                ⏱ Duration: {effectiveDuration}
              </p>
            )}
            <p className="text-primary font-semibold mt-1">
              💳 Deposit paid: ₹{depositAmount}
            </p>
            <p className="text-muted-foreground text-xs">
              Balance ₹{totalAmount - depositAmount} due after delivery
            </p>
          </div>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground text-center">
          <p>
            Our team will confirm your booking within{" "}
            <strong className="text-foreground">24 hours</strong>.
          </p>
          <p>Confirmation sent to your registered email &amp; WhatsApp.</p>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20RAP%20Studio!%20I%20just%20booked%20(${bookingRef}).%20Please%20confirm%20my%20slot.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          data-ocid="booking-whatsapp-confirm"
        >
          <MessageCircle className="w-4 h-4" />
          Confirm via WhatsApp
        </a>
      </motion.div>
    );
  }

  // ── Review & Pay step ───────────────────────────────────────────────────────
  if (step === "review") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
        data-ocid="booking-review"
      >
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Review & Pay Deposit
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ref: <span className="text-primary font-mono">{bookingRef}</span>
          </p>
        </div>

        <OrderSummary
          items={selectedItems}
          duration={effectiveDuration}
          date={date}
          timeDisplay={formatDisplayTime(customTime)}
        />

        {/* What happens next */}
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{
            background: "oklch(0.12 0.015 280)",
            borderColor: "oklch(0.28 0.02 280)",
          }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            What happens next
          </p>
          {[
            "Pay the 40% deposit via Stripe to secure your slot",
            "Our team reviews your booking within 24 hours",
            "You receive confirmation on WhatsApp and email",
            "Pay the remaining 60% after service delivery",
          ].map((step, i) => (
            <div
              key={`step-${i + 1}`}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <span className="text-primary font-bold shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Payment method */}
        <div
          className="rounded-xl border p-4 flex items-start gap-3"
          style={{
            background: "oklch(0.68 0.2 290 / 0.06)",
            borderColor: "oklch(0.68 0.2 290 / 0.25)",
          }}
          data-ocid="payment-info-card"
        >
          <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              Secure Payment via Stripe
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Pay ₹{depositAmount} deposit now. Balance ₹
              {totalAmount - depositAmount} collected after delivery.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep("form")}
            data-ocid="booking-back-btn"
          >
            ← Edit Details
          </Button>
          <Button
            className="flex-1 h-12 text-base font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.62 0.18 65))",
              color: "oklch(0.99 0.002 70)",
            }}
            disabled={isPaymentLoading}
            onClick={() => void triggerStripeCheckout()}
            data-ocid="booking-pay-stripe-btn"
          >
            {isPaymentLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparing…
              </span>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ₹{depositAmount} Deposit
              </>
            )}
          </Button>
        </div>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="booking-support-email"
        >
          <Mail className="w-3.5 h-3.5" />
          Need help? Email {SUPPORT_EMAIL}
        </a>
      </motion.div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auth gate */}
      {!isAuthenticated && <AuthGateBanner />}

      {/* Order Summary */}
      <div className="space-y-2">
        <Label className="text-foreground font-semibold flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          Your Order
        </Label>
        <AnimatePresence mode="popLayout">
          <OrderSummary
            items={selectedItems}
            duration={effectiveDuration}
            onRemove={removeItem}
          />
        </AnimatePresence>
      </div>

      {/* Service Categories */}
      <div className="space-y-2">
        <Label className="text-foreground font-semibold">
          Select Services *
          <span className="text-muted-foreground font-normal ml-2 text-xs">
            (multiple allowed)
          </span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Click a category to expand, then select the sub-services you want.
        </p>
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 rounded-lg">
          {SERVICE_CATEGORIES.map((svc, idx) => {
            const isExpanded = expandedServiceId === svc.id;
            const selectedCount = selectedItems.filter(
              (i) => i.serviceId === svc.id,
            ).length;
            const hasSelected = selectedCount > 0;
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: hasSelected
                    ? "oklch(0.7 0.22 70 / 0.5)"
                    : "oklch(0.28 0.018 280)",
                  background: hasSelected
                    ? "oklch(0.7 0.22 70 / 0.05)"
                    : "oklch(0.14 0.015 280)",
                }}
                data-ocid={`service-category.${idx + 1}`}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                  onClick={() =>
                    setExpandedServiceId(isExpanded ? null : svc.id)
                  }
                  data-ocid={`service-toggle.${idx + 1}`}
                >
                  <span className="text-lg shrink-0">{svc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm"
                      style={{
                        color: hasSelected
                          ? "oklch(0.88 0.18 70)"
                          : "oklch(0.9 0.01 280)",
                      }}
                    >
                      {svc.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {svc.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{
                          background: "oklch(0.7 0.22 70 / 0.2)",
                          color: "oklch(0.88 0.18 70)",
                        }}
                      >
                        {selectedCount} selected
                      </motion.span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <MultiSubServiceSelector
                          service={svc}
                          selectedSubServices={getSelectedSubsForService(
                            svc.id,
                          )}
                          onToggle={(sub) => toggleSubService(svc, sub)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Duration — affects pricing */}
      <div className="space-y-2">
        <Label className="text-foreground font-semibold flex items-center gap-2 flex-wrap">
          <Clock className="w-4 h-4 text-primary" />
          Duration *
          {effectiveDuration && <PriceBadge duration={effectiveDuration} />}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DURATIONS.map((d) => {
            const isActive = duration === d.value;
            return (
              <motion.button
                type="button"
                key={d.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDuration(d.value)}
                className="rounded-lg py-2.5 px-3 text-left transition-all duration-200 border"
                style={isActive ? SELECTED_STYLE : UNSELECTED_STYLE}
                aria-pressed={isActive}
                data-ocid={`duration-${d.value.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <p
                  className="text-xs font-bold leading-tight"
                  style={{
                    color: isActive ? COLOR_SELECTED : COLOR_UNSELECTED,
                  }}
                >
                  {d.value === "Custom" ? "Custom" : d.value}
                </p>
                {d.price > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    ₹{d.price}/service
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Enter HH:MM</p>
                )}
              </motion.button>
            );
          })}
        </div>
        {duration === "Custom" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              placeholder="e.g. 05:30 (hours:minutes)"
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              style={{ color: "black" }}
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              data-ocid="booking-custom-duration"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Custom duration uses standard 2-hour rate (₹200/service, ₹80
              deposit)
            </p>
          </motion.div>
        )}
        {duration && duration !== "Custom" && (
          <motion.p
            key={duration}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground"
          >
            ₹{pricePerService(duration)} per service · ₹
            {calcDepositPerService(duration)} deposit (40%) per service
          </motion.p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label className="text-foreground font-semibold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Date *
        </Label>
        <input
          type="date"
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          style={{ colorScheme: "dark", color: "black" }}
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
          data-ocid="booking-date"
        />
      </div>

      {/* Time */}
      <div className="space-y-3">
        <Label className="text-foreground font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Time Slot *
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_PRESETS.map((preset) => {
            const isActive = activePreset === preset.label;
            return (
              <motion.button
                type="button"
                key={preset.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePresetClick(preset)}
                className="rounded-lg py-2 px-2 text-left transition-all duration-200 border"
                style={isActive ? SELECTED_STYLE : UNSELECTED_STYLE}
                aria-pressed={isActive}
                data-ocid={`time-preset-${preset.label.toLowerCase().replace(" ", "-")}`}
              >
                <p
                  className="text-xs font-semibold leading-tight"
                  style={{
                    color: isActive ? COLOR_SELECTED : COLOR_UNSELECTED,
                  }}
                >
                  {preset.label}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {preset.display}
                </p>
              </motion.button>
            );
          })}
        </div>
        <div>
          <input
            type="time"
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            style={{ color: "black" }}
            value={customTime}
            onChange={(e) => handleTimeInputChange(e.target.value)}
            data-ocid="booking-time-input"
          />
          {customTime && (
            <p className="text-xs text-muted-foreground mt-1">
              Selected:{" "}
              <span className="text-primary font-medium">
                {formatDisplayTime(customTime)}
              </span>
              {!activePreset && " (custom time)"}
            </p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-foreground font-semibold">Location *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LOCATION_OPTIONS.map((loc) => (
            <motion.button
              type="button"
              key={loc.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocationType(loc.id)}
              className="rounded-lg py-2.5 px-3 text-left transition-all duration-200 border"
              style={
                locationType === loc.id ? SELECTED_STYLE : UNSELECTED_STYLE
              }
              aria-pressed={locationType === loc.id}
              data-ocid={`location-${loc.id}`}
            >
              <p
                className="text-xs font-semibold"
                style={{
                  color:
                    locationType === loc.id ? COLOR_SELECTED : COLOR_UNSELECTED,
                }}
              >
                {loc.label}
              </p>
              <p className="text-xs text-muted-foreground">{loc.desc}</p>
            </motion.button>
          ))}
        </div>
        {locationType === "indoor" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Label className="text-sm text-muted-foreground mb-1 block">
              Select Indoor Venue
            </Label>
            <select
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              style={{ color: "black" }}
              value={indoorVenue}
              onChange={(e) => setIndoorVenue(e.target.value)}
              data-ocid="indoor-venue-select"
            >
              {INDOOR_VENUES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </motion.div>
        )}
        {(locationType === "custom" || locationType === "outdoor") && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              placeholder={
                locationType === "custom"
                  ? "Type location name or address..."
                  : "Describe the outdoor location..."
              }
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              style={{ color: "black" }}
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              data-ocid={
                locationType === "custom"
                  ? "custom-address-input"
                  : "outdoor-location-input"
              }
            />
          </motion.div>
        )}
        {locationType === "studio" && (
          <p className="text-xs text-muted-foreground">
            📍 RAP Integrated Studio, Bangalore — address shared upon
            confirmation
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-foreground font-semibold">
          Additional Notes{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          placeholder="Any special requirements, references, mood boards, or questions..."
          className="bg-card border-border placeholder:text-muted-foreground resize-none"
          style={{ color: "black" }}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-ocid="booking-notes"
        />
      </div>

      {/* Live Payment Breakdown */}
      {selectedItems.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedItems.length}-${depositEach}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-4 border text-sm space-y-2"
            style={{
              background: "oklch(0.7 0.22 70 / 0.08)",
              borderColor: "oklch(0.7 0.22 70 / 0.3)",
            }}
            data-ocid="payment-breakdown"
          >
            <p className="font-semibold text-primary flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Breakdown
            </p>
            {effectiveDuration ? (
              <>
                <div className="space-y-1">
                  {selectedItems.map((item, i) => (
                    <div
                      key={`item-${i + 1}`}
                      className="flex justify-between text-xs text-muted-foreground"
                    >
                      <span className="truncate max-w-[60%]">
                        {item.subServiceName}
                      </span>
                      <span>₹{priceEach}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="border-t pt-2 space-y-1"
                  style={{ borderColor: "oklch(0.7 0.22 70 / 0.2)" }}
                >
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total ({selectedItems.length} services)
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Deposit now (40%)
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: "oklch(0.88 0.18 70)" }}
                    >
                      ₹{depositAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Balance after delivery</span>
                    <span>₹{totalAmount - depositAmount}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs" style={{ color: "oklch(0.68 0.2 290)" }}>
                ⚡ Select a duration above to see your exact deposit amount
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <Button
        type="submit"
        disabled={
          mutation.isPending ||
          isPaymentLoading ||
          selectedItems.length === 0 ||
          !isAuthenticated
        }
        className="w-full h-12 text-base font-semibold"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.62 0.18 65))",
          color: "oklch(0.99 0.002 70)",
        }}
        data-ocid="booking-submit"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving Request...
          </span>
        ) : !isAuthenticated ? (
          "Login to Book"
        ) : selectedItems.length === 0 ? (
          "Select at least one service"
        ) : (
          `Review & Book ${selectedItems.length} Service${selectedItems.length > 1 ? "s" : ""} →`
        )}
      </Button>
    </form>
  );
}
