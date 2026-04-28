import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Inbox,
  MapPin,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { BookingRequest as BackendBooking } from "../../backend.d.ts";

interface ReceptionistBookingQueueProps {
  bookings: BackendBooking[];
  onConfirm: (bookingId: bigint) => void;
  onReject: (bookingId: bigint) => void;
  onMarkDelivered?: (bookingId: bigint) => void;
  isLoading?: boolean;
}

const TIME_SLOT_LABELS: Record<string, string> = {
  Morning: "Morning (8AM–12PM)",
  Afternoon: "Afternoon (12PM–4PM)",
  Evening: "Evening (4PM–8PM)",
  Night: "Night (8PM–11PM)",
  HalfDay: "Half Day",
  FullDay: "Full Day",
};

function getLocationLabel(location: BackendBooking["location"]): string {
  if (!location) return "Studio";
  if (typeof location === "string") return location;
  const loc = location as { __kind__?: string; Custom?: string };
  if (loc.__kind__ === "Custom") return `Custom — ${loc.Custom ?? ""}`;
  return loc.__kind__ ?? "Studio";
}

function getStatusStr(status: BackendBooking["status"]): string {
  if (typeof status === "string") return status.toLowerCase();
  if (typeof status === "object" && status !== null) {
    return (Object.keys(status as object)[0] ?? "pending").toLowerCase();
  }
  return "pending";
}

export function ReceptionistBookingQueue({
  bookings,
  onConfirm,
  onReject,
  onMarkDelivered,
  isLoading = false,
}: ReceptionistBookingQueueProps) {
  if (!isLoading && bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        data-ocid="queue.empty_state"
      >
        <Inbox className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-base font-medium text-foreground">Queue is clear</p>
        <p className="text-sm opacity-60">No pending booking requests</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="receptionist.queue">
      <AnimatePresence mode="popLayout">
        {bookings.map((booking, i) => {
          const timeLabel =
            TIME_SLOT_LABELS[String(booking.timeSlot ?? "")] ??
            String(booking.timeSlot ?? "—");
          const locationLabel = getLocationLabel(booking.location);
          const statusStr = getStatusStr(booking.status);
          const isPending = statusStr === "pending";
          const isConfirmed = statusStr === "confirmed";

          const whatsappMsg = encodeURIComponent(
            `📸 Booking Update from RAP Integrated Studio\n\nService: ${(booking.serviceId ?? "—").replace(/_/g, " ")}\nSub-service: ${(booking.subService ?? "—").replace(/_/g, " ")}\nDate: ${booking.date ?? ""}\nTime: ${timeLabel}\nLocation: ${locationLabel}\nStatus: ${isPending ? "Pending Review" : "Confirmed"}\n\nBooking ID: ${String(booking.id ?? "").slice(-6)}`,
          );

          return (
            <motion.div
              key={String(booking.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.96 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className={`rounded-xl border p-5 transition-all duration-300 ${
                isPending
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border/50 bg-card hover:border-primary/20"
              }`}
              style={{ backdropFilter: "blur(12px)" }}
              data-ocid={`queue.item.${i + 1}`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Camera className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-foreground text-sm truncate capitalize">
                      {(booking.serviceId ?? "—").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize ml-6">
                    {(booking.subService ?? "—").replace(/_/g, " ")}
                  </p>
                </div>
                <Badge
                  className={`text-xs border flex-shrink-0 ${
                    isPending
                      ? "bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-300"
                      : isConfirmed
                        ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground border-border/40"
                  }`}
                >
                  {isPending
                    ? "Pending"
                    : isConfirmed
                      ? "Confirmed"
                      : statusStr}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                  <span className="text-foreground/80">
                    {booking.date ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                  <span className="text-foreground/80">{timeLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                  <span className="truncate text-foreground/80">
                    {locationLabel}
                  </span>
                </div>
                {booking.duration && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary/70">⏱</span>
                    <span className="text-foreground/80">
                      {booking.duration}
                    </span>
                  </div>
                )}
              </div>

              {booking.notes && (
                <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">
                  &ldquo;{booking.notes}&rdquo;
                </p>
              )}

              <div className="text-xs font-mono text-muted-foreground/50 mb-3">
                #{String(booking.id ?? "").slice(-8)}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {isPending && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex-1 gap-1"
                      onClick={() => onConfirm(booking.id)}
                      data-ocid={`queue.confirm_button.${i + 1}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="text-xs flex-1 gap-1"
                      onClick={() => onReject(booking.id)}
                      data-ocid={`queue.delete_button.${i + 1}`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </>
                )}
                {onMarkDelivered && isConfirmed && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1"
                    onClick={() => onMarkDelivered(booking.id)}
                    data-ocid={`queue.delivered_button.${i + 1}`}
                  >
                    Mark Delivered
                  </Button>
                )}
                <a
                  href={`https://wa.me/917338501228?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors px-2"
                  data-ocid={`queue.whatsapp.${i + 1}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Notify via WhatsApp
                </a>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
