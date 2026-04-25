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
import type { BookingRequest } from "../../types";

interface ReceptionistBookingQueueProps {
  bookings: BookingRequest[];
  onConfirm: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onMarkDelivered?: (bookingId: string) => void;
  isLoading?: boolean;
}

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
  custom: "Custom",
};

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
        data-ocid="queue-empty-state"
      >
        <Inbox className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-base font-medium">Queue is clear</p>
        <p className="text-sm opacity-60">No pending booking requests</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="receptionist-queue">
      <AnimatePresence mode="popLayout">
        {bookings.map((booking, i) => {
          const timeLabel =
            TIME_SLOT_LABELS[booking.timeSlot] ?? booking.timeSlot;
          const locationLabel =
            LOCATION_LABELS[booking.location.type] ?? booking.location.type;

          const locationDetail = booking.location.placeName
            ? ` — ${booking.location.placeName}`
            : "";
          const whatsappMsg = encodeURIComponent(
            `📸 Booking Update from RAP Integrated Studio\n\nService: ${(booking.serviceCategoryId ?? "—").replace(/_/g, " ")}\nSub-service: ${(booking.subServiceId ?? "—").replace(/_/g, " ")}\nDate: ${booking.date}\nTime: ${timeLabel}\nLocation: ${locationLabel}${locationDetail}\nStatus: Confirmed\n\nPlease pay ₹2 to confirm your slot.\nBooking ID: ${booking.id}`,
          );

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.96 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="rounded-xl border border-border/50 bg-card p-5 hover:border-primary/20 transition-smooth"
              data-ocid="queue-booking-card"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Camera className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-foreground text-sm truncate capitalize">
                      {booking.serviceCategoryId?.replace(/_/g, " ") || "—"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize ml-6">
                    {booking.subServiceId?.replace(/_/g, " ") || "—"}
                  </p>
                </div>
                <Badge className="text-xs border bg-yellow-500/20 text-yellow-300 border-yellow-500/30 flex-shrink-0">
                  Pending
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 mb-3">
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

              {/* Client note (anonymized) */}
              <div className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg px-3 py-2 mb-3">
                <span className="text-muted-foreground">Client:</span>
                <span className="text-foreground font-medium">
                  {booking.clientName || "Client"}
                </span>
                <span className="ml-auto text-muted-foreground">
                  ₹{booking.initialPaymentAmount} upfront
                </span>
              </div>

              {booking.notes && (
                <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">
                  "{booking.notes}"
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1 gap-1"
                  onClick={() => onConfirm(booking.id)}
                  data-ocid="queue-confirm-btn"
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
                  data-ocid="queue-reject-btn"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </Button>
                {onMarkDelivered && booking.status === "confirmed" && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    onClick={() => onMarkDelivered(booking.id)}
                    data-ocid="queue-delivered-btn"
                  >
                    Mark Delivered
                  </Button>
                )}
                <a
                  href={`https://wa.me/917338501228?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors px-2"
                  data-ocid="queue-whatsapp-link"
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
