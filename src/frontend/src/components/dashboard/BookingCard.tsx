import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import type { BookingRequest, BookingStatus } from "../../types";

interface BookingCardProps {
  booking: BookingRequest;
  showPayButton?: boolean;
  showActions?: boolean;
  isAdminView?: boolean;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onTriggerPayment?: (id: string) => void;
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

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (8AM–12PM)",
  afternoon: "Afternoon (12PM–4PM)",
  evening: "Evening (4PM–8PM)",
  night: "Night (8PM–11PM)",
  half_day: "Half Day",
  full_day: "Full Day",
};

const LOC_LABELS: Record<string, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  studio: "RAP Studio",
  custom: "Custom Location",
};

export function BookingCard({
  booking,
  showPayButton = false,
  showActions = false,
  isAdminView = false,
  onConfirm,
  onReject,
  onMarkDelivered,
  index = 0,
}: BookingCardProps) {
  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const isPending = booking.status === "pending";
  const whatsappMsg = encodeURIComponent(
    `Booking ID: ${booking.id}\nService: ${booking.serviceCategoryId}\nDate: ${booking.date}\nStatus: ${statusCfg.label}`,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={`rounded-2xl border transition-smooth ${
        isPending && isAdminView
          ? "border-yellow-500/40 bg-yellow-500/5 shadow-luxury"
          : "border-border/50 bg-card shadow-subtle hover:border-primary/30"
      }`}
      data-ocid={`booking-card.${index + 1}`}
    >
      {/* Pending banner — admin only */}
      {isPending && isAdminView && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-yellow-500/20 bg-yellow-500/10 rounded-t-2xl">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-xs font-semibold text-yellow-300">
            Action Required — New booking awaiting confirmation
          </p>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Camera className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-semibold font-display text-foreground text-sm truncate capitalize">
                {booking.serviceCategoryId.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground capitalize ml-6">
              {booking.subServiceId.replace(/_/g, " ")}
            </p>
            {booking.clientName && (
              <p className="text-xs text-muted-foreground ml-6 mt-0.5">
                Client:{" "}
                <span className="text-foreground/80 font-medium">
                  {booking.clientName}
                </span>
              </p>
            )}
          </div>
          <Badge
            className={`text-xs border flex-shrink-0 ${statusCfg.className}`}
          >
            {statusCfg.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary/70" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary/70" />
            <span>{TIME_LABELS[booking.timeSlot] ?? booking.timeSlot}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
            <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
            <span className="truncate">
              {LOC_LABELS[booking.location.type] ?? booking.location.type}
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
            &ldquo;{booking.notes}&rdquo;
          </p>
        )}

        {/* Payment row */}
        <div className="flex items-center gap-4 text-xs mb-4 bg-muted/20 rounded-xl px-3 py-2 border border-border/30">
          <div>
            <span className="text-muted-foreground">Deposit:</span>{" "}
            <span className="text-primary font-bold">
              ₹{booking.initialPaymentAmount}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Balance:</span>{" "}
            <span className="text-foreground font-semibold">
              ₹{booking.finalPaymentAmount}
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/50 ml-auto">
            #{booking.id}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {showPayButton && booking.status === "awaiting_payment" && (
            <Button
              type="button"
              size="sm"
              className="btn-primary-luxury text-xs flex-1"
              data-ocid="pay-upfront-btn"
            >
              Pay ₹{booking.initialPaymentAmount} Deposit
            </Button>
          )}
          {showPayButton && booking.status === "awaiting_final_payment" && (
            <Button
              type="button"
              size="sm"
              className="btn-primary-luxury text-xs flex-1"
              data-ocid="pay-balance-btn"
            >
              Pay Remaining ₹{booking.finalPaymentAmount}
            </Button>
          )}

          {showActions && booking.status === "pending" && onConfirm && (
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1"
              onClick={() => onConfirm(booking.id)}
              data-ocid="confirm-booking-btn"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
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
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
          )}
          {showActions && booking.status === "confirmed" && onMarkDelivered && (
            <Button
              type="button"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex-1"
              onClick={() => onMarkDelivered(booking.id)}
              data-ocid="mark-delivered-btn"
            >
              Mark Delivered
            </Button>
          )}

          <a
            href={`https://wa.me/917338501228?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors ml-auto"
            data-ocid="whatsapp-booking-link"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
