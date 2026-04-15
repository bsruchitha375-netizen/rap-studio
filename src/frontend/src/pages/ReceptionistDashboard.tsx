import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle,
  Clock,
  Inbox,
  MessageCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ReceptionistBookingQueue } from "../components/dashboard/ReceptionistBookingQueue";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import { useMyBookings } from "../hooks/useBackend";
import type { BookingRequest } from "../types";

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

const SAMPLE_PENDING: BookingRequest[] = [
  {
    id: "BK003",
    clientId: "u3",
    clientName: "Client",
    serviceCategoryId: "couple_shoot",
    subServiceId: "engagement",
    date: "2026-04-25",
    timeSlot: "afternoon",
    duration: "3 hours",
    location: { type: "outdoor", placeName: "Lalbagh Botanical Garden" },
    notes: "Engagement shoot, need romantic props.",
    status: "pending",
    initialPaymentAmount: 2,
    finalPaymentAmount: 3,
    createdAt: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
  },
];

const SAMPLE_CONFIRMED: BookingRequest[] = [
  {
    id: "BK002",
    clientId: "u2",
    clientName: "Client",
    serviceCategoryId: "wedding_shoot",
    subServiceId: "candid_photography",
    date: "2026-04-22",
    timeSlot: "full_day",
    duration: "8 hours",
    location: { type: "studio", placeName: "RAP Studio, Bengaluru" },
    status: "confirmed",
    initialPaymentAmount: 2,
    finalPaymentAmount: 3,
    createdAt: BigInt(Date.now() - 86400000 * 2) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now() - 86400000 * 2) * BigInt(1_000_000),
  },
];

function MiniCalendar({ bookings }: { bookings: BookingRequest[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const bookedDates = new Set(bookings.map((b) => b.date));
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  type CalendarCell = { key: string; day: number | null };
  const cells: CalendarCell[] = [
    ...Array.from({ length: firstDay }, (_, i) => ({
      key: `empty-${i}`,
      day: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      key: dateStr(i + 1),
      day: i + 1,
    })),
  ];

  const dateStr = (day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            if (month === 0) {
              setMonth(11);
              setYear((y) => y - 1);
            } else {
              setMonth((m) => m - 1);
            }
          }}
        >
          ‹
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            if (month === 11) {
              setMonth(0);
              setYear((y) => y + 1);
            } else {
              setMonth((m) => m + 1);
            }
          }}
        >
          ›
        </Button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-muted-foreground font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ key, day }) => {
          if (day === null) return <div key={key} aria-hidden="true" />;
          const ds = dateStr(day);
          const isBooked = bookedDates.has(ds);
          const isToday =
            day === now.getDate() &&
            month === now.getMonth() &&
            year === now.getFullYear();
          return (
            <button
              type="button"
              key={`day-${ds}`}
              className={`aspect-square rounded text-xs flex items-center justify-center transition-smooth
                ${isToday ? "ring-1 ring-primary text-primary font-bold" : ""}
                ${isBooked ? "bg-primary/20 text-primary font-semibold" : "text-foreground hover:bg-muted/40"}
              `}
              title={isBooked ? `Slot taken on ${ds}` : ds}
              onClick={() => {
                if (isBooked) {
                  const booking = bookings.find((b) => b.date === ds);
                  toast.info(
                    `Slot taken on ${ds} at ${booking?.timeSlot ?? "some time"}`,
                  );
                }
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Gold = booked slot • Click to see slot info
      </p>
    </div>
  );
}

export function ReceptionistDashboard() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: bookings = [], refetch } = useMyBookings();
  const [activeTab, setActiveTab] = useState("pending");
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  const name = profile?.name ?? "there";

  const pendingBookings = [
    ...bookings.filter((b) => b.status === "pending"),
    ...SAMPLE_PENDING,
  ].filter(
    (b, idx, arr) =>
      arr.findIndex((x) => x.id === b.id) === idx && !confirmedIds.has(b.id),
  );

  const confirmedBookings = [
    ...bookings.filter(
      (b) => b.status === "confirmed" || b.status === "in_progress",
    ),
    ...SAMPLE_CONFIRMED,
  ].filter((b, idx, arr) => arr.findIndex((x) => x.id === b.id) === idx);

  const allBookings = [
    ...bookings,
    ...SAMPLE_CONFIRMED,
    ...SAMPLE_PENDING,
  ].filter((b, idx, arr) => arr.findIndex((x) => x.id === b.id) === idx);

  const handleConfirm = (bookingId: string) => {
    setConfirmedIds((prev) => new Set([...prev, bookingId]));
    toast.success("Booking confirmed! Admin notified.");
    void refetch();
  };

  const handleReject = (bookingId: string) => {
    toast.error(`Booking ${bookingId} rejected.`);
    void refetch();
  };

  const handleMarkDelivered = (bookingId: string) => {
    toast.success(
      `Work delivered for ${bookingId}. Payment request triggered.`,
    );
    void refetch();
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center text-muted-foreground">
          Access denied. Please log in.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between gap-4 mb-8 flex-wrap"
        >
          <div>
            <p className="section-label mb-1">Receptionist Portal</p>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome, {name} 📋
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage booking requests and coordinate with the team.
            </p>
          </div>
          <a
            href="https://wa.me/917338501228"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg transition-smooth"
            data-ocid="whatsapp-admin-link"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Admin
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              label: "Pending",
              value: pendingBookings.length,
              color: "text-yellow-400",
            },
            {
              label: "Confirmed",
              value: confirmedBookings.length,
              color: "text-blue-400",
            },
            {
              label: "Total",
              value: allBookings.length,
              color: "text-primary",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/50 bg-card px-4 py-3 text-center"
            >
              <p className={`text-2xl font-bold font-display ${s.color}`}>
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="receptionist-dashboard-tabs"
        >
          <TabsList className="bg-card border border-border/50 mb-6">
            <TabsTrigger
              value="pending"
              className="gap-2"
              data-ocid="tab-pending"
            >
              <Inbox className="w-4 h-4" />
              Pending
              {pendingBookings.length > 0 && (
                <Badge className="ml-1 text-xs bg-yellow-500/20 text-yellow-300 border-0 h-4 px-1">
                  {pendingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="confirmed"
              className="gap-2"
              data-ocid="tab-confirmed"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmed
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="gap-2"
              data-ocid="tab-calendar"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <AnimatePresence mode="wait">
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ReceptionistBookingQueue
                  bookings={pendingBookings}
                  onConfirm={handleConfirm}
                  onReject={handleReject}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="confirmed">
            <AnimatePresence mode="wait">
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {confirmedBookings.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-base font-medium">
                      No confirmed bookings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {confirmedBookings.map((booking, i) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-xl border border-border/50 bg-card p-5 hover:border-blue-500/30 transition-smooth"
                        data-ocid="confirmed-booking-card"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-foreground capitalize">
                              {booking.serviceCategoryId.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {booking.subServiceId.replace(/_/g, " ")}
                            </p>
                          </div>
                          <Badge className="text-xs border bg-blue-500/20 text-blue-300 border-blue-500/30">
                            Confirmed
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {booking.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.timeSlot}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={() => handleMarkDelivered(booking.id)}
                            data-ocid="mark-delivered-btn"
                          >
                            Mark Work Delivered
                          </Button>
                          <a
                            href={`https://wa.me/917338501228?text=${encodeURIComponent(`Booking ${booking.id} confirmed. Work has been delivered.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors px-2"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Notify Client
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="calendar">
            <AnimatePresence mode="wait">
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click on a highlighted date to see slot info. No client
                    details are shown.
                  </p>
                  <MiniCalendar bookings={allBookings} />
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
