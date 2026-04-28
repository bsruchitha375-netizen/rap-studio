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
import type { BookingRequest as BackendBooking } from "../../backend.d.ts";

interface BookingCardProps {
  booking: BackendBooking;
  showPayButton?: boolean;
  showActions?: boolean;
  isAdminView?: boolean;
  onConfirm?: (id: bigint) => void;
  onReject?: (id: bigint) => void;
  onMarkDelivered?: (id: bigint) => void;
  index?: number;
}

const TIME_LABELS: Record<string, string> = {
  Morning: "Morning (8AM–12PM)",
  Afternoon: "Afternoon (12PM–4PM)",
  Evening: "Evening (4PM–8PM)",
  Night: "Night (8PM–11PM)",
  HalfDay: "Half Day",
  FullDay: "Full Day",
  morning: "Morning (8AM–12PM)",
  afternoon: "Afternoon (12PM–4PM)",
  evening: "Evening (4PM–8PM)",
  night: "Night (8PM–11PM)",
  half_day: "Half Day",
  full_day: "Full Day",
};

function getStatusStr(status: BackendBooking["status"]): string {
  if (typeof status === "string") return status.toLowerCase();
  if (typeof status === "object" && status !== null) {
    return (Object.keys(status as object)[0] ?? "pending").toLowerCase();
  }
  return "pending";
}

function getLocationLabel(location: BackendBooking["location"]): string {
  if (!location) return "Studio";
  if (typeof location === "string") return location;
  const loc = location as { __kind__?: string; Custom?: string };
  if (loc.__kind__ === "Custom") return `Custom — ${loc.Custom ?? ""}`;
  return loc.__kind__ ?? "Studio";
}

function getStatusConfig(statusStr: string): { label: string; cls: string } {
  const map: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "Pending",
      cls: "bg-amber-500/20 text-amber-300 border-amber-500/30 dark:text-amber-300",
    },
    confirmed: {
      label: "Confirmed",
      cls: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:text-emerald-300",
    },
    rejected: {
      label: "Rejected",
      cls: "bg-red-500/20 text-red-600 border-red-500/30 dark:text-red-400",
    },
    completed: {
      label: "Completed",
      cls: "bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-300",
    },
    workdelivered: {
      label: "Work Delivered",
      cls: "bg-violet-500/20 text-violet-600 border-violet-500/30 dark:text-violet-300",
    },
    paymentpending: {
      label: "Payment Pending",
      cls: "bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-300",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-muted text-muted-foreground border-border/40",
    },
  };
  return (
    map[statusStr.replace(/_/g, "").toLowerCase()] ?? {
      label: statusStr,
      cls: "bg-muted text-muted-foreground border-border/40",
    }
  );
}

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
  const statusStr = getStatusStr(booking.status);
  const statusCfg = getStatusConfig(statusStr);
  const isPending = statusStr === "pending";
  const timeLabel =
    TIME_LABELS[String(booking.timeSlot ?? "")] ??
    String(booking.timeSlot ?? "—");
  const serviceLabel = (booking.serviceId ?? "—").replace(/_/g, " ");
  const subServiceLabel = (booking.subService ?? "—").replace(/_/g, " ");
  const locationLabel = getLocationLabel(booking.location);

  const whatsappMsg = encodeURIComponent(
    `Booking #${String(booking.id ?? "").slice(-6)}\nService: ${serviceLabel}\nDate: ${booking.date ?? ""}\nStatus: ${statusCfg.label}`,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={`rounded-2xl border transition-all duration-300 ${
        isPending && isAdminView
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-border/50 bg-card hover:border-primary/30"
      }`}
      style={{ backdropFilter: "blur(12px)" }}
      data-ocid={`booking-card.${index + 1}`}
    >
      {isPending && isAdminView && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/10 rounded-t-2xl">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-300">
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
                {serviceLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground capitalize ml-6">
              {subServiceLabel}
            </p>
          </div>
          <Badge className={`text-xs border flex-shrink-0 ${statusCfg.cls}`}>
            {statusCfg.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
            <span className="text-foreground/80">{booking.date ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
            <span className="text-foreground/80">{timeLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
            <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
            <span className="truncate text-foreground/80">{locationLabel}</span>
          </div>
          {booking.duration && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary/70">⏱</span>
              <span className="text-foreground/80">{booking.duration}</span>
            </div>
          )}
        </div>

        {booking.notes && (
          <p className="text-xs text-muted-foreground border-t border-border/40 pt-2 mb-3 italic line-clamp-2">
            &ldquo;{booking.notes}&rdquo;
          </p>
        )}

        {booking.rejectedReason && (
          <div className="rounded-lg px-3 py-2 mb-3 bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">
              Rejection reason: {booking.rejectedReason}
            </p>
          </div>
        )}

        <div className="text-xs font-mono text-muted-foreground/50 mb-3">
          Booking #{String(booking.id ?? "").slice(-8)}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {showPayButton && (
            <span className="text-xs text-muted-foreground italic self-center">
              Payment handled via admin
            </span>
          )}
          {showActions && isPending && onConfirm && (
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex-1 gap-1"
              onClick={() => onConfirm(booking.id)}
              data-ocid="confirm-booking-btn"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Confirm
            </Button>
          )}
          {showActions && isPending && onReject && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="text-xs flex-1 gap-1"
              onClick={() => onReject(booking.id)}
              data-ocid="reject-booking-btn"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          )}
          {showActions && statusStr === "confirmed" && onMarkDelivered && (
            <Button
              type="button"
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs flex-1 gap-1"
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
            className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors ml-auto"
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
