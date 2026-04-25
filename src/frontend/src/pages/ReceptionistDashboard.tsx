import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Inbox,
  List,
  LogOut,
  MapPin,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { BookingRequest as BackendBooking } from "../backend.d.ts";
import { LiveIndicator } from "../components/dashboard/LiveIndicator";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import {
  useAllBookings,
  useBookingsByDate,
  useConfirmBooking,
  useRejectBooking,
  useRescheduleBooking,
} from "../hooks/useBackend";

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TIME_SLOT_LABELS: Record<string, string> = {
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

type StatusFilter = "all" | "pending" | "confirmed" | "rejected" | "completed";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusFromBackend(status: BackendBooking["status"]): string {
  if (typeof status === "string") return status.toLowerCase();
  if (typeof status === "object" && status !== null) {
    const key = Object.keys(status as object)[0];
    return (key ?? "pending").toLowerCase();
  }
  return "pending";
}

function getStatusLabel(statusStr: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    rejected: "Rejected",
    completed: "Completed",
    workdelivered: "Work Delivered",
    paymentpending: "Payment Pending",
    cancelled: "Cancelled",
    in_progress: "In Progress",
  };
  return map[statusStr] ?? statusStr;
}

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "pending").toLowerCase().replace(/_/g, "");
  const styles: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    workdelivered: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    paymentpending: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    cancelled: "bg-muted text-muted-foreground border-border/40",
  };
  const cls = styles[s] ?? "bg-muted text-muted-foreground border-border/40";
  return (
    <Badge className={`text-[10px] font-semibold border px-2 py-0.5 ${cls}`}>
      {getStatusLabel(s)}
    </Badge>
  );
}

function getLocationLabel(location: BackendBooking["location"]): string {
  if (typeof location === "string") return location;
  if (typeof location === "object" && location !== null) {
    const kind = (location as { __kind__?: string }).__kind__;
    if (kind === "Custom") {
      const c = location as { __kind__: "Custom"; Custom: string };
      return `Custom — ${c.Custom}`;
    }
    return kind ?? "Studio";
  }
  return "Studio";
}

function bookingIdToNumber(id: BackendBooking["id"]): bigint {
  if (typeof id === "bigint") return id;
  if (typeof id === "number") return BigInt(id);
  return BigInt(String(id));
}

function formatTimestamp(ts: BackendBooking["createdAt"]): string {
  try {
    const ms = Number(ts) / 1_000_000;
    const diff = Date.now() - ms;
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ms).toLocaleDateString();
  } catch {
    return "";
  }
}

// ── Reject Modal ──────────────────────────────────────────────────────────────

interface RejectModalProps {
  bookingId: string;
  open: boolean;
  isPending: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

function RejectModal({
  bookingId,
  open,
  isPending,
  onConfirm,
  onClose,
}: RejectModalProps) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border) / 0.5)",
        }}
        data-ocid="reject-booking.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <XCircle className="w-5 h-5 text-destructive" />
            Reject Booking #{String(bookingId).slice(-6)}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Please provide a reason. The client will be notified.
        </p>
        <div className="space-y-2">
          <Label htmlFor="reject-reason" className="text-foreground text-sm">
            Reason for rejection
          </Label>
          <Textarea
            id="reject-reason"
            placeholder="e.g. Date not available, team unavailable..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="resize-none"
            data-ocid="reject-booking.textarea"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-ocid="reject-booking.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 gap-1"
            disabled={!reason.trim() || isPending}
            onClick={() => onConfirm(reason.trim())}
            data-ocid="reject-booking.confirm_button"
          >
            {isPending ? (
              <span className="spinner" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Reschedule Modal ──────────────────────────────────────────────────────────

interface RescheduleModalProps {
  bookingId: string;
  currentDate: string;
  open: boolean;
  isPending: boolean;
  onConfirm: (newDate: string, newTime: string) => void;
  onClose: () => void;
}

function RescheduleModal({
  bookingId,
  currentDate,
  open,
  isPending,
  onConfirm,
  onClose,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState(currentDate);
  const [newTime, setNewTime] = useState("10:00");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border) / 0.5)",
        }}
        data-ocid="reschedule-booking.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <RotateCcw className="w-5 h-5 text-primary" />
            Reschedule Booking #{String(bookingId).slice(-6)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-date" className="text-foreground text-sm">
              New Date
            </Label>
            <Input
              id="new-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              data-ocid="reschedule-booking.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-time" className="text-foreground text-sm">
              New Time
            </Label>
            <Input
              id="new-time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              data-ocid="reschedule-booking.time_input"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-ocid="reschedule-booking.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 gap-1 btn-primary-luxury"
            disabled={!newDate || !newTime || isPending}
            onClick={() => onConfirm(newDate, newTime)}
            data-ocid="reschedule-booking.confirm_button"
          >
            {isPending ? (
              <span className="spinner" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Confirm Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── View Details Modal ────────────────────────────────────────────────────────

interface ViewDetailsModalProps {
  booking: BackendBooking | null;
  open: boolean;
  onClose: () => void;
}

function ViewDetailsModal({ booking, open, onClose }: ViewDetailsModalProps) {
  if (!booking) return null;
  const status = getStatusFromBackend(booking.status);
  const timeLabel =
    TIME_SLOT_LABELS[String(booking.timeSlot)] ?? String(booking.timeSlot);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border) / 0.5)",
        }}
        data-ocid="view-booking.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <CalendarDays className="w-5 h-5 text-primary" />
            Booking Details
            <StatusBadge status={status} />
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Booking ID
            </p>
            <p className="text-foreground font-mono font-medium">
              #{String(booking.id).slice(-8)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Service
            </p>
            <p className="text-foreground font-medium capitalize">
              {booking.serviceId?.replace(/_/g, " ") || "—"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Sub-Service
            </p>
            <p className="text-foreground capitalize">
              {booking.subService?.replace(/_/g, " ") || "—"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Date
            </p>
            <p className="text-foreground">{booking.date}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Time Slot
            </p>
            <p className="text-foreground">{timeLabel}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Duration
            </p>
            <p className="text-foreground">{booking.duration}</p>
          </div>
          <div className="col-span-2 space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Location
            </p>
            <p className="text-foreground">
              {getLocationLabel(booking.location)}
            </p>
          </div>
          {booking.notes && (
            <div className="col-span-2 space-y-0.5">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Client Notes
              </p>
              <p className="text-foreground italic">"{booking.notes}"</p>
            </div>
          )}
          {booking.rejectedReason && (
            <div className="col-span-2 rounded-lg px-3 py-2 bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-xs">
                Rejection reason: {booking.rejectedReason}
              </p>
            </div>
          )}
          <div className="col-span-2 space-y-0.5">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Created
            </p>
            <p className="text-foreground">
              {formatTimestamp(booking.createdAt)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={onClose}
          data-ocid="view-booking.close_button"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Calendar Tab ──────────────────────────────────────────────────────────────

interface CalendarTabProps {
  bookedDates: Set<string>;
}

function CalendarTab({ bookedDates }: CalendarTabProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: dateBookings = [], isLoading: dateLoading } =
    useBookingsByDate(selectedDate);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function dateStr(day: number) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  type CalCell = { key: string; day: number | null };
  const cells: CalCell[] = [
    ...Array.from({ length: firstDay }, (_, i) => ({
      key: `e-${i}`,
      day: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      key: dateStr(i + 1),
      day: i + 1,
    })),
  ];

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar grid */}
      <div
        className="rounded-2xl p-5 flex-shrink-0"
        style={{
          background: "oklch(var(--card) / 0.55)",
          backdropFilter: "blur(14px)",
          border: "1px solid oklch(var(--border) / 0.4)",
          minWidth: "280px",
        }}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground font-display">
            {MONTHS[month]} {year}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-muted-foreground font-semibold py-1 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ key, day }) => {
            if (day === null) return <div key={key} aria-hidden="true" />;
            const ds = dateStr(day);
            const isBooked = bookedDates.has(ds);
            const isToday =
              day === now.getDate() &&
              month === now.getMonth() &&
              year === now.getFullYear();
            const isSelected = ds === selectedDate;
            return (
              <button
                type="button"
                key={`day-${ds}`}
                className={[
                  "aspect-square rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 transition-smooth relative",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-glow-gold"
                    : "",
                  !isSelected && isToday
                    ? "ring-1 ring-primary text-primary font-bold"
                    : "",
                  !isSelected && isBooked
                    ? "bg-primary/15 text-primary font-semibold hover:bg-primary/25"
                    : "",
                  !isSelected && !isBooked
                    ? "text-foreground hover:bg-muted/40"
                    : "",
                ].join(" ")}
                title={isBooked ? `Slots booked on ${ds}` : ds}
                onClick={() => setSelectedDate(isSelected ? null : ds)}
                data-ocid={`calendar.day.${ds}`}
              >
                {day}
                {isBooked && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" />
          <span>= date has bookings · click to view</span>
        </div>
      </div>

      {/* Date detail panel */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {!selectedDate ? (
            <motion.div
              key="no-date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground rounded-2xl"
              style={{ border: "1px dashed oklch(var(--border) / 0.4)" }}
              data-ocid="calendar.empty_state"
            >
              <CalendarDays className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">
                Select a date to view bookings
              </p>
              <p className="text-xs opacity-60 mt-1">
                Gold dot = session booked
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground font-display">
                  Sessions on{" "}
                  <span className="text-primary">{selectedDate}</span>
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 text-muted-foreground"
                  onClick={() => setSelectedDate(null)}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Clear
                </Button>
              </div>

              {dateLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : dateBookings.length === 0 ? (
                <div
                  className="flex flex-col items-center py-12 text-muted-foreground rounded-xl"
                  style={{ border: "1px dashed oklch(var(--border) / 0.4)" }}
                  data-ocid="calendar-date.empty_state"
                >
                  <Calendar className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No sessions on this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dateBookings.map((b, i) => {
                    const timeLabel =
                      TIME_SLOT_LABELS[String(b.timeSlot)] ??
                      String(b.timeSlot);
                    const status = getStatusFromBackend(b.status);
                    return (
                      <motion.div
                        key={String(b.id)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        style={{
                          background: "oklch(var(--card) / 0.5)",
                          border: "1px solid oklch(var(--border) / 0.35)",
                        }}
                        data-ocid={`calendar-booking.item.${i + 1}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "oklch(var(--primary) / 0.12)",
                            }}
                          >
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Session booked at{" "}
                              <span className="text-primary">{timeLabel}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              #{String(b.id).slice(-6)} ·{" "}
                              {b.serviceId?.replace(/_/g, " ") || "—"}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={status} />
                      </motion.div>
                    );
                  })}
                  <p className="text-[10px] text-muted-foreground px-1">
                    <AlertCircle className="w-3 h-3 inline mr-1 opacity-60" />
                    Client details are hidden for privacy. Use Booking ID to
                    look up full details.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── All Bookings Tab ──────────────────────────────────────────────────────────

interface AllBookingsTabProps {
  bookings: BackendBooking[];
  isLoading: boolean;
  onReschedule: (b: BackendBooking) => void;
  onViewDetails: (b: BackendBooking) => void;
}

function AllBookingsTab({
  bookings,
  isLoading,
  onReschedule,
  onViewDetails,
}: AllBookingsTabProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const sorted = [...bookings].sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt),
    );
    if (filter === "all") return sorted;
    return sorted.filter((b) => {
      const s = getStatusFromBackend(b.status);
      if (filter === "pending") return s === "pending";
      if (filter === "confirmed")
        return s === "confirmed" || s === "workdelivered";
      if (filter === "rejected") return s === "rejected" || s === "cancelled";
      if (filter === "completed") return s === "completed";
      return true;
    });
  }, [bookings, filter]);

  const filterChips: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: bookings.length },
    {
      key: "pending",
      label: "Pending",
      count: bookings.filter(
        (b) => getStatusFromBackend(b.status) === "pending",
      ).length,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: bookings.filter((b) =>
        ["confirmed", "workdelivered"].includes(getStatusFromBackend(b.status)),
      ).length,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: bookings.filter((b) =>
        ["rejected", "cancelled"].includes(getStatusFromBackend(b.status)),
      ).length,
    },
    {
      key: "completed",
      label: "Completed",
      count: bookings.filter(
        (b) => getStatusFromBackend(b.status) === "completed",
      ).length,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-smooth border",
              filter === chip.key
                ? "bg-primary text-primary-foreground border-primary shadow-glow-gold"
                : "bg-card/50 text-muted-foreground border-border/40 hover:border-primary/30 hover:text-foreground",
            ].join(" ")}
            onClick={() => setFilter(chip.key)}
            data-ocid={`all-bookings.filter.${chip.key}`}
          >
            {chip.label}
            {chip.count !== undefined && chip.count > 0 && (
              <span
                className={`text-[10px] px-1 rounded-full ${filter === chip.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {chip.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center py-16 text-muted-foreground rounded-2xl"
          style={{ border: "1px dashed oklch(var(--border) / 0.5)" }}
          data-ocid="all-bookings.empty_state"
        >
          <List className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No bookings found</p>
          <p className="text-xs opacity-60">Try a different filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((booking, i) => {
              const status = getStatusFromBackend(booking.status);
              const timeLabel =
                TIME_SLOT_LABELS[String(booking.timeSlot)] ??
                String(booking.timeSlot);
              return (
                <motion.div
                  key={String(booking.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="glass-card rounded-xl p-4 service-card-hover"
                  data-ocid={`all-bookings.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{String(booking.id).slice(-8)}
                        </span>
                        <span className="font-semibold text-foreground text-sm capitalize truncate">
                          {booking.serviceId?.replace(/_/g, " ") || "—"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {booking.subService?.replace(/_/g, " ") || "—"}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-primary/70" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary/70" />
                      {timeLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary/70" />
                      {getLocationLabel(booking.location)}
                    </span>
                    <span className="ml-auto text-[10px] opacity-60">
                      {formatTimestamp(booking.createdAt)}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 border-primary/20 hover:border-primary/50 hover:text-primary"
                      onClick={() => onViewDetails(booking)}
                      data-ocid={`all-bookings.view_details.${i + 1}`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                    {(status === "confirmed" || status === "pending") && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1 border-amber-500/20 text-amber-400 hover:border-amber-500/50"
                        onClick={() => onReschedule(booking)}
                        data-ocid={`all-bookings.reschedule.${i + 1}`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reschedule
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Pending Bookings Tab ──────────────────────────────────────────────────────

interface PendingTabProps {
  bookings: BackendBooking[];
  isLoading: boolean;
  onConfirm: (b: BackendBooking) => void;
  onReject: (b: BackendBooking) => void;
}

function PendingTab({
  bookings,
  isLoading,
  onConfirm,
  onReject,
}: PendingTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-muted-foreground rounded-2xl"
        style={{ border: "1px dashed oklch(var(--border) / 0.4)" }}
        data-ocid="pending-bookings.empty_state"
      >
        <Inbox className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-base font-medium">Queue is clear</p>
        <p className="text-sm opacity-60 mt-1">No pending booking requests</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="pending-bookings.list">
      <AnimatePresence mode="popLayout">
        {bookings.map((booking, i) => {
          const timeLabel =
            TIME_SLOT_LABELS[String(booking.timeSlot)] ??
            String(booking.timeSlot);
          const locationLabel = getLocationLabel(booking.location);
          return (
            <motion.div
              key={String(booking.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24, scale: 0.96 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="rounded-xl p-5 service-card-hover"
              style={{
                background: "oklch(var(--card) / 0.55)",
                backdropFilter: "blur(12px)",
                border: "1px solid oklch(var(--border) / 0.45)",
              }}
              data-ocid={`pending-booking.item.${i + 1}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{
                        background: "oklch(var(--primary) / 0.12)",
                        color: "oklch(var(--primary))",
                      }}
                    >
                      #{String(booking.id).slice(-6)}
                    </span>
                    <span className="font-semibold text-foreground text-sm truncate capitalize">
                      {booking.serviceId?.replace(/_/g, " ") || "—"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {booking.subService?.replace(/_/g, " ") || "—"}
                  </p>
                </div>
                <Badge className="text-[10px] font-semibold border bg-amber-500/15 text-amber-400 border-amber-500/30 flex-shrink-0">
                  Pending
                </Badge>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary/70" />
                  {booking.date}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary/70" />
                  {timeLabel}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                  <span className="truncate">{locationLabel}</span>
                </div>
                {booking.duration && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary/70">⏱</span>
                    {booking.duration}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-primary/70">🕐</span>
                  {formatTimestamp(booking.createdAt)}
                </div>
              </div>

              {booking.notes && (
                <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2 bg-muted/20 rounded-lg px-3 py-2">
                  "{booking.notes}"
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                  onClick={() => onConfirm(booking)}
                  data-ocid={`pending-booking.confirm_button.${i + 1}`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Confirm Booking
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-1.5 text-xs font-semibold"
                  onClick={() => onReject(booking)}
                  data-ocid={`pending-booking.delete_button.${i + 1}`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </Button>
                <a
                  href={`https://wa.me/917338501228?text=${encodeURIComponent(`Booking #${String(booking.id).slice(-6)} — ${(booking.serviceId ?? "—").replace(/_/g, " ")} on ${booking.date} at ${timeLabel}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors px-2"
                  data-ocid={`pending-booking.whatsapp.${i + 1}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function ReceptionistDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();

  // Real backend data with 5s polling
  const {
    data: allBookings = [],
    isLoading: bookingsLoading,
    dataUpdatedAt,
    refetch,
  } = useAllBookings();

  // Mutations
  const confirmMutation = useConfirmBooking();
  const rejectMutation = useRejectBooking();
  const rescheduleMutation = useRescheduleBooking();

  // Tabs
  const [activeTab, setActiveTab] = useState("pending");

  // Modal state
  const [rejectTarget, setRejectTarget] = useState<BackendBooking | null>(null);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<BackendBooking | null>(null);
  const [viewTarget, setViewTarget] = useState<BackendBooking | null>(null);

  // Live indicator: "Updated Ns ago"
  const [secsAgo, setSecsAgo] = useState(0);
  const dataUpdatedAtRef = useRef(dataUpdatedAt);
  useEffect(() => {
    if (dataUpdatedAt !== dataUpdatedAtRef.current) {
      dataUpdatedAtRef.current = dataUpdatedAt;
      setSecsAgo(0);
    }
    const id = setInterval(() => setSecsAgo((s) => s + 1), 1000);
    return () => clearInterval(id);
  });

  const name = profile?.name ?? user?.name ?? "there";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Derived data
  const pendingBookings = useMemo(
    () =>
      allBookings.filter((b) => getStatusFromBackend(b.status) === "pending"),
    [allBookings],
  );
  const confirmedCount = useMemo(
    () =>
      allBookings.filter((b) =>
        ["confirmed", "workdelivered"].includes(getStatusFromBackend(b.status)),
      ).length,
    [allBookings],
  );

  // Booked dates set for calendar (all bookings)
  const bookedDates = useMemo(
    () => new Set(allBookings.map((b) => b.date)),
    [allBookings],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleConfirm(booking: BackendBooking) {
    try {
      await confirmMutation.mutateAsync(bookingIdToNumber(booking.id));
      toast.success(`Booking #${String(booking.id).slice(-6)} confirmed!`);
    } catch (err) {
      toast.error("Failed to confirm booking. Please try again.");
      console.error(err);
    }
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync({
        bookingId: bookingIdToNumber(rejectTarget.id),
        reason,
      });
      toast.success(`Booking #${String(rejectTarget.id).slice(-6)} rejected.`);
      setRejectTarget(null);
    } catch (err) {
      toast.error("Failed to reject booking. Please try again.");
      console.error(err);
    }
  }

  async function handleRescheduleConfirm(newDate: string, newTime: string) {
    if (!rescheduleTarget) return;
    try {
      await rescheduleMutation.mutateAsync({
        bookingId: bookingIdToNumber(rescheduleTarget.id),
        newDate,
        newTime,
      });
      toast.success(
        `Booking #${String(rescheduleTarget.id).slice(-6)} rescheduled to ${newDate}.`,
      );
      setRescheduleTarget(null);
    } catch (err) {
      toast.error("Failed to reschedule booking. Please try again.");
      console.error(err);
    }
  }

  function handleLogout() {
    logout();
    void navigate({ to: "/login" });
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center text-muted-foreground">
          Access denied. Please{" "}
          <a href="/login" className="text-primary underline">
            log in
          </a>
          .
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Dashboard Header */}
      <div
        className="border-b border-border/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.018 280), oklch(0.17 0.025 285), oklch(0.14 0.02 275))",
        }}
      >
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-display flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.18 200 / 0.25), oklch(0.62 0.18 200 / 0.08))",
                  border: "2px solid oklch(0.62 0.18 200 / 0.5)",
                  color: "oklch(0.72 0.16 200)",
                }}
                aria-label="Receptionist avatar"
              >
                {initials || <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "oklch(0.62 0.18 200 / 0.7)" }}
                  >
                    Receptionist Portal
                  </p>
                  <Badge
                    className="text-[10px] border"
                    style={{
                      background: "oklch(0.62 0.18 200 / 0.12)",
                      color: "oklch(0.72 0.16 200)",
                      borderColor: "oklch(0.62 0.18 200 / 0.35)",
                    }}
                  >
                    Receptionist
                  </Badge>
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Welcome,{" "}
                  <span style={{ color: "oklch(0.72 0.16 200)" }}>{name}</span>{" "}
                  📋
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage booking requests and coordinate with the RAP Studio
                  team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://wa.me/917338501228"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-3 py-2 rounded-lg transition-smooth"
                data-ocid="receptionist.whatsapp_admin_link"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Admin
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => void refetch()}
                data-ocid="receptionist.refresh_button"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-border/40 hover:border-destructive/40 hover:text-destructive"
                onClick={handleLogout}
                data-ocid="receptionist.logout_button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              label: "Pending",
              value: pendingBookings.length,
              color: "text-amber-400",
              bg: "oklch(0.72 0.18 85 / 0.08)",
              border: "oklch(0.72 0.18 85 / 0.25)",
            },
            {
              label: "Confirmed",
              value: confirmedCount,
              color: "text-emerald-400",
              bg: "oklch(0.65 0.18 150 / 0.08)",
              border: "oklch(0.65 0.18 150 / 0.25)",
            },
            {
              label: "Total",
              value: allBookings.length,
              color: "text-primary",
              bg: "oklch(var(--primary) / 0.08)",
              border: "oklch(var(--primary) / 0.25)",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="rounded-xl px-4 py-3 text-center"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                backdropFilter: "blur(8px)",
              }}
            >
              <p className={`text-2xl font-bold font-display ${s.color}`}>
                {bookingsLoading ? "—" : s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="receptionist.tabs"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <TabsList
              className="border"
              style={{
                background: "oklch(var(--card) / 0.6)",
                borderColor: "oklch(var(--border) / 0.4)",
              }}
            >
              <TabsTrigger
                value="pending"
                className="gap-2 text-sm"
                data-ocid="receptionist.tab.pending"
              >
                <Inbox className="w-4 h-4" />
                Pending
                {pendingBookings.length > 0 && !bookingsLoading && (
                  <Badge className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 border-0 h-4 px-1.5">
                    {pendingBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="gap-2 text-sm"
                data-ocid="receptionist.tab.all_bookings"
              >
                <List className="w-4 h-4" />
                All Bookings
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="gap-2 text-sm"
                data-ocid="receptionist.tab.calendar"
              >
                <CalendarDays className="w-4 h-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            {/* Live indicator */}
            <div className="flex items-center gap-3">
              <LiveIndicator
                updatedAt={dataUpdatedAt}
                pollMs={5000}
                label="bookings"
              />
              {secsAgo < 60 && (
                <span className="text-[10px] text-muted-foreground/50">
                  Updated {secsAgo}s ago
                </span>
              )}
            </div>
          </div>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <AnimatePresence mode="wait">
              <motion.div
                key="tab-pending"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <PendingTab
                  bookings={pendingBookings}
                  isLoading={bookingsLoading}
                  onConfirm={handleConfirm}
                  onReject={(b) => setRejectTarget(b)}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* All Bookings Tab */}
          <TabsContent value="all">
            <AnimatePresence mode="wait">
              <motion.div
                key="tab-all"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <AllBookingsTab
                  bookings={allBookings}
                  isLoading={bookingsLoading}
                  onReschedule={(b) => setRescheduleTarget(b)}
                  onViewDetails={(b) => setViewTarget(b)}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <AnimatePresence mode="wait">
              <motion.div
                key="tab-calendar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <CalendarTab bookedDates={bookedDates} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <RejectModal
        bookingId={rejectTarget ? String(rejectTarget.id) : ""}
        open={!!rejectTarget}
        isPending={rejectMutation.isPending}
        onConfirm={handleRejectConfirm}
        onClose={() => setRejectTarget(null)}
      />

      <RescheduleModal
        bookingId={rescheduleTarget ? String(rescheduleTarget.id) : ""}
        currentDate={rescheduleTarget?.date ?? ""}
        open={!!rescheduleTarget}
        isPending={rescheduleMutation.isPending}
        onConfirm={handleRescheduleConfirm}
        onClose={() => setRescheduleTarget(null)}
      />

      <ViewDetailsModal
        booking={viewTarget}
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </Layout>
  );
}
