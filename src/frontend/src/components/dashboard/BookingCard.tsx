import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Camera, Clock, MapPin, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import type { BookingRequest, BookingStatus } from "../../types";
import { RazorpayButton } from "../ui/RazorpayButton";

interface BookingCardProps {
  booking: BookingRequest;
  showPayButton?: boolean;
  onPayUpfront?: (bookingId: string) => void;
  onPayBalance?: (bookingId: string) => void;
  showActions?: boolean;
  onConfirm?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onMarkDelivered?: (bookingId: string) => void;
  onTriggerPayment?: (bookingId: string) => void;
  index?: number;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  reviewing: {
    label: "Reviewing",
    className: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  },
  awaiting_payment: {
    label: "Payment Pending",
    className: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  delivered: {
    label: "Work Delivered",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  awaiting_final_payment: {
    label: "Final Payment Due",
    className: "bg-orange-400/20 text-orange-300 border-orange-400/30",
  },
  completed: {
    label: "Completed",
    className:
      "bg-yellow-600/20 text-yellow-400 border-yellow-600/30 font-semibold",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning (8AM–12PM)",
  afternoon: "Afternoon (12PM–4PM)",
  evening: "Evening (4PM–8PM)",
  night: "Night (8PM–11PM)",
  half_day: "Half Day",
  full_day: "Full Day",
};

const LOCATION_LABELS: Record<string, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  studio: "Studio",
  custom: "Custom Location",
};

export function BookingCard({
  booking,
  showPayButton = false,
  showActions = false,
  onConfirm,
  onReject,
  onMarkDelivered,
  onTriggerPayment,
  index = 0,
}: BookingCardProps) {
  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const locationLabel =
    LOCATION_LABELS[booking.location.type] ?? booking.location.type;
  const timeLabel = TIME_SLOT_LABELS[booking.timeSlot] ?? booking.timeSlot;

  const whatsappMsg = encodeURIComponent(
    `Booking Confirmation:\nService: ${booking.serviceCategoryId}\nDate: ${booking.date}\nTime: ${timeLabel}\nStatus: ${statusCfg.label}\nBooking ID: ${booking.id}`,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl border border-border/50 bg-card p-5 hover:border-primary/30 transition-smooth"
      data-ocid="booking-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Camera className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-semibold text-foreground text-sm truncate capitalize">
              {booking.serviceCategoryId.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground capitalize ml-6">
            {booking.subServiceId.replace(/_/g, " ")}
          </p>
        </div>
        <Badge
          className={`text-xs border flex-shrink-0 ${statusCfg.className}`}
        >
          {statusCfg.label}
        </Badge>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-primary/70" />
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-primary/70" />
          <span>{timeLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
          <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
          <span className="truncate">
            {locationLabel}
            {booking.location.placeName
              ? ` — ${booking.location.placeName}`
              : ""}
            {booking.location.customAddress
              ? ` — ${booking.location.customAddress}`
              : ""}
          </span>
        </div>
        {booking.duration && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-primary/70">⏱</span>
            <span>{booking.duration}</span>
          </div>
        )}
      </div>

      {booking.notes && (
        <p className="text-xs text-muted-foreground border-t border-border/40 pt-2 mb-3 italic line-clamp-2">
          "{booking.notes}"
        </p>
      )}

      {/* Payment info */}
      <div className="flex items-center gap-4 text-xs mb-4 bg-muted/30 rounded-lg px-3 py-2">
        <div>
          <span className="text-muted-foreground">Initial:</span>{" "}
          <span className="text-primary font-semibold">
            ₹{booking.initialPaymentAmount}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Balance:</span>{" "}
          <span className="text-foreground font-semibold">
            ₹{booking.finalPaymentAmount}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Payment buttons for client */}
        {showPayButton && booking.status === "awaiting_payment" && (
          <RazorpayButton
            amount={booking.initialPaymentAmount}
            label="Pay ₹2 Now"
            referenceId={booking.id}
            paymentType="booking_initial"
            description={`Booking upfront payment — ${booking.serviceCategoryId}`}
            className="btn-primary-luxury text-xs px-4 py-2 flex-1"
            data-ocid="pay-upfront-btn"
          />
        )}
        {showPayButton && booking.status === "awaiting_final_payment" && (
          <RazorpayButton
            amount={booking.finalPaymentAmount}
            label="Pay Remaining"
            referenceId={booking.id}
            paymentType="booking_final"
            description={`Booking balance payment — ${booking.serviceCategoryId}`}
            className="btn-primary-luxury text-xs px-4 py-2 flex-1"
            data-ocid="pay-balance-btn"
          />
        )}

        {/* Receptionist / admin actions */}
        {showActions && booking.status === "pending" && onConfirm && (
          <Button
            type="button"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
            onClick={() => onConfirm(booking.id)}
            data-ocid="confirm-booking-btn"
          >
            Confirm
          </Button>
        )}
        {showActions && booking.status === "pending" && onReject && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="text-xs flex-1"
            onClick={() => onReject(booking.id)}
            data-ocid="reject-booking-btn"
          >
            Reject
          </Button>
        )}
        {showActions && booking.status === "confirmed" && onMarkDelivered && (
          <Button
            type="button"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1"
            onClick={() => onMarkDelivered(booking.id)}
            data-ocid="mark-delivered-btn"
          >
            Mark Delivered
          </Button>
        )}
        {showActions && onTriggerPayment && (
          <Button
            type="button"
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
            onClick={() => onTriggerPayment(booking.id)}
            data-ocid="trigger-payment-btn"
          >
            Trigger Payment
          </Button>
        )}

        {/* WhatsApp */}
        <a
          href={`https://wa.me/917338501228?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          data-ocid="whatsapp-booking-link"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      </div>

      {/* Booking ID */}
      <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
        ID: {booking.id}
      </p>
    </motion.div>
  );
}
