import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, Camera, CreditCard, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BookingCard } from "../components/dashboard/BookingCard";
import { FeedbackForm } from "../components/dashboard/FeedbackForm";
import { PaymentCard } from "../components/dashboard/PaymentCard";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import {
  useMyBookings,
  useMyNotifications,
  useMyPayments,
} from "../hooks/useBackend";
import type {
  FeedbackRecord,
  NotificationRecord,
  PaymentOrder,
} from "../types";

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function renderStars(rating: number) {
  return (
    <span
      className="text-yellow-400 text-sm tracking-tight"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= rating ? "text-yellow-400" : "text-muted-foreground/30"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

async function addFeedback(
  feedback: Omit<FeedbackRecord, "id" | "userId" | "createdAt">,
): Promise<{ ok: boolean }> {
  console.log("feedback submitted", feedback);
  return { ok: true };
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  initiated: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function PaymentHistoryCard({
  payment,
  index,
}: {
  payment: PaymentOrder;
  index: number;
}) {
  const date = payment.paidAt
    ? new Date(Number(payment.paidAt) / 1_000_000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date(Number(payment.createdAt) / 1_000_000).toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "short", year: "numeric" },
      );

  const typeLabel: Record<string, string> = {
    booking_initial: "Booking Deposit",
    booking_final: "Final Payment",
    course_enrollment: "Course Enrollment",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl border border-border/50 bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/20 transition-smooth"
      data-ocid={`payment-card.item.${index + 1}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground/60 truncate max-w-[180px]">
            {payment.razorpayOrderId}
          </span>
          <Badge
            className={`text-xs border capitalize ${PAYMENT_STATUS_COLORS[payment.status] ?? ""}`}
          >
            {payment.status}
          </Badge>
        </div>
        <p className="text-sm font-medium text-foreground">
          {typeLabel[payment.paymentType] ?? payment.paymentType}
        </p>
        {payment.referenceId && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Ref: {payment.referenceId}
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className="text-lg font-bold"
          style={{ color: "oklch(0.7 0.22 70)" }}
        >
          ₹{payment.amount}
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </motion.div>
  );
}

export function ClientDashboard() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: bookings = [], isLoading: bookingsLoading } = useMyBookings();
  const { data: payments = [], isLoading: paymentsLoading } = useMyPayments();
  const { data: notifications = [] } = useMyNotifications();
  const [activeTab, setActiveTab] = useState("bookings");

  const [submittedFeedback, setSubmittedFeedback] = useState<
    Record<string, FeedbackRecord>
  >({});
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const name = profile?.name ?? "there";

  async function handleFeedbackSubmit(
    bookingId: string,
    feedback: Omit<FeedbackRecord, "id" | "userId" | "createdAt">,
  ) {
    await addFeedback(feedback);
    setSubmittedFeedback((prev) => ({
      ...prev,
      [bookingId]: {
        ...feedback,
        id: `fb-${bookingId}`,
        userId: profile?.id ?? "me",
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      },
    }));
    setFeedbackOpen(null);
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center text-muted-foreground">
          Please log in to view your dashboard.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="section-label mb-1">Client Portal</p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {name} ✨
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bookings and track your sessions with RAP Studio.
          </p>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="client-dashboard-tabs"
        >
          <TabsList className="bg-card border border-border/50 mb-6">
            <TabsTrigger
              value="bookings"
              className="gap-2"
              data-ocid="tab-bookings"
            >
              <Camera className="w-4 h-4" />
              My Bookings
              {bookings.length > 0 && (
                <Badge className="ml-1 text-xs bg-primary/20 text-primary border-0 h-4 px-1">
                  {bookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="gap-2"
              data-ocid="tab-payments"
            >
              <CreditCard className="w-4 h-4" />
              Payments
              {payments.length > 0 && (
                <Badge className="ml-1 text-xs bg-primary/20 text-primary border-0 h-4 px-1">
                  {payments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2"
              data-ocid="tab-notifications"
            >
              <Bell className="w-4 h-4" />
              Alerts
              {unreadCount > 0 && (
                <Badge className="ml-1 text-xs bg-destructive/80 text-white border-0 h-4 px-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Bookings Tab ── */}
          <TabsContent value="bookings">
            <AnimatePresence mode="wait">
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {bookingsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-16 text-muted-foreground"
                    data-ocid="bookings-empty-state"
                  >
                    <Calendar className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No bookings yet</p>
                    <p className="text-sm opacity-60 mb-6">
                      Book your first photography session today!
                    </p>
                    <a
                      href="/booking"
                      className="btn-primary-luxury text-sm px-6 py-2"
                      data-ocid="bookings-empty-cta"
                    >
                      Book Now
                    </a>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking, i) => {
                      const fb = submittedFeedback[booking.id];
                      const isCompleted = booking.status === "completed";
                      return (
                        <div
                          key={booking.id}
                          data-ocid={`booking-card.item.${i + 1}`}
                        >
                          <BookingCard
                            booking={booking}
                            showPayButton={true}
                            index={i}
                          />
                          {isCompleted && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 + 0.2 }}
                              className="mt-2 ml-1 flex items-center gap-3 flex-wrap"
                            >
                              {fb ? (
                                <div
                                  className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border/40 rounded-lg px-3 py-1.5"
                                  data-ocid="feedback-submitted-indicator"
                                >
                                  {renderStars(fb.rating)}
                                  <span className="text-xs text-emerald-400 font-medium">
                                    Thank you for your feedback!
                                  </span>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/60 gap-1 h-7"
                                  onClick={() => setFeedbackOpen(booking.id)}
                                  data-ocid="leave-feedback-btn"
                                >
                                  <Star className="w-3 h-3" />
                                  Leave Feedback ★
                                </Button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Payments Tab ── */}
          <TabsContent value="payments">
            <AnimatePresence mode="wait">
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : payments.length === 0 ? (
                  <div
                    className="flex flex-col items-center py-16 text-muted-foreground"
                    data-ocid="payments-empty-state"
                  >
                    <CreditCard className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-1">No payments yet</p>
                    <p className="text-sm opacity-60 mb-6">
                      Your payment history will appear here once you make a
                      booking.
                    </p>
                    <a
                      href="/booking"
                      className="btn-primary-luxury text-sm px-6 py-2"
                      data-ocid="payments-empty-cta"
                    >
                      Book a Session
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3" data-ocid="payments-list">
                    {payments.map((payment: PaymentOrder, i: number) => (
                      <PaymentHistoryCard
                        key={payment.id}
                        payment={payment}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Notifications Tab ── */}
          <TabsContent value="notifications">
            <AnimatePresence mode="wait">
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {notifications.length === 0 ? (
                  <div
                    className="flex flex-col items-center py-16 text-muted-foreground"
                    data-ocid="notifications-empty-state"
                  >
                    <Bell className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm opacity-60">
                      No notifications at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n: NotificationRecord, i: number) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`rounded-xl border p-4 transition-smooth ${
                          n.isRead
                            ? "border-border/50 bg-card"
                            : "border-primary/30 bg-primary/5"
                        }`}
                        data-ocid={`notification-item.${i + 1}`}
                      >
                        <div className="flex items-start gap-3">
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-1">
                              {formatRelativeTime(n.createdAt)}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs capitalize ${
                              n.isRead
                                ? "bg-muted/40 text-muted-foreground border-border/30"
                                : "bg-primary/20 text-primary border-primary/30"
                            }`}
                          >
                            {n.isRead ? "Read" : "New"}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* Feedback modal */}
      <AnimatePresence>
        {feedbackOpen && (
          <FeedbackForm
            key={feedbackOpen}
            targetId={feedbackOpen}
            targetType="Service"
            onSubmit={(fb) => handleFeedbackSubmit(feedbackOpen, fb)}
            onClose={() => setFeedbackOpen(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
