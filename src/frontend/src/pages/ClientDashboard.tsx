import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  Camera,
  CreditCard,
  LogOut,
  Star,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BookingCard } from "../components/dashboard/BookingCard";
import { FeedbackForm } from "../components/dashboard/FeedbackForm";
import { LiveIndicator } from "../components/dashboard/LiveIndicator";
import { PaymentCard } from "../components/dashboard/PaymentCard";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import {
  useMyBookings,
  useMyNotifications,
  useMyPayments,
} from "../hooks/useBackend";
import type { FeedbackRecord } from "../types";

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
      className="text-sm tracking-tight"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            color: s <= rating ? "oklch(0.8 0.2 70)" : "oklch(0.3 0.02 280)",
          }}
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

export function ClientDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: profile } = useUserProfile();
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    dataUpdatedAt: bookingsUpdatedAt,
  } = useMyBookings();
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    dataUpdatedAt: paymentsUpdatedAt,
  } = useMyPayments();
  const { data: notifications = [] } = useMyNotifications();
  const [activeTab, setActiveTab] = useState("bookings");
  const [submittedFeedback, setSubmittedFeedback] = useState<
    Record<string, FeedbackRecord>
  >({});
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const name = profile?.name ?? user?.name ?? "there";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

  function handleLogout() {
    logout();
    void navigate({ to: "/login" });
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
      {/* Dashboard Header */}
      <div
        className="border-b border-border/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.02 280), oklch(0.19 0.03 285))",
        }}
      >
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                    "linear-gradient(135deg, oklch(0.7 0.22 70 / 0.25), oklch(0.7 0.22 70 / 0.1))",
                  border: "2px solid oklch(0.7 0.22 70 / 0.5)",
                  color: "oklch(0.82 0.2 70)",
                }}
                aria-label="User avatar"
              >
                {initials || <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "oklch(0.7 0.22 70 / 0.7)" }}
                  >
                    Client Portal
                  </p>
                  <Badge
                    className="text-[10px] border"
                    style={{
                      background: "oklch(0.7 0.22 70 / 0.15)",
                      color: "oklch(0.82 0.2 70)",
                      borderColor: "oklch(0.7 0.22 70 / 0.35)",
                    }}
                  >
                    Client
                  </Badge>
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Welcome back,{" "}
                  <span style={{ color: "oklch(0.82 0.2 70)" }}>{name}</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your bookings and sessions with RAP Studio
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 text-xs border-border/40 hover:border-destructive/40 hover:text-destructive"
              onClick={handleLogout}
              data-ocid="client-dashboard.logout_button"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="client-dashboard.tab"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <TabsList
              className="border border-border/50"
              style={{ background: "oklch(var(--card) / 0.5)" }}
            >
              <TabsTrigger
                value="bookings"
                className="gap-2"
                data-ocid="client-dashboard.bookings.tab"
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
                data-ocid="client-dashboard.payments.tab"
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
                data-ocid="client-dashboard.notifications.tab"
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

            {/* Live indicator */}
            {activeTab === "bookings" && (
              <LiveIndicator
                updatedAt={bookingsUpdatedAt}
                pollMs={5000}
                label="bookings"
              />
            )}
            {activeTab === "payments" && (
              <LiveIndicator
                updatedAt={paymentsUpdatedAt}
                pollMs={5000}
                label="payments"
              />
            )}
          </div>

          {/* Bookings Tab */}
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
                      <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl"
                    style={{
                      background: "oklch(var(--card) / 0.3)",
                      border: "1px dashed oklch(var(--border) / 0.5)",
                    }}
                    data-ocid="bookings.empty_state"
                  >
                    <div
                      className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
                      style={{
                        background: "oklch(0.7 0.22 70 / 0.1)",
                        border: "1px solid oklch(0.7 0.22 70 / 0.3)",
                      }}
                    >
                      <Calendar
                        className="w-8 h-8"
                        style={{ color: "oklch(0.7 0.22 70)" }}
                      />
                    </div>
                    <p className="text-lg font-display font-semibold text-foreground mb-2">
                      No bookings yet
                    </p>
                    <p className="text-sm opacity-60 mb-6">
                      Book your first photography session today!
                    </p>
                    <a
                      href="/booking"
                      className="btn-primary-luxury text-sm px-6 py-2"
                      data-ocid="bookings.empty_state.primary_button"
                    >
                      Book Now
                    </a>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking, i) => {
                      const bookingKey = String(booking.id);
                      const fb = submittedFeedback[bookingKey];
                      const isCompleted =
                        String(booking.status).toLowerCase() === "completed";
                      return (
                        <div
                          key={bookingKey}
                          data-ocid={`booking.item.${i + 1}`}
                        >
                          <BookingCard
                            booking={booking}
                            showPayButton
                            index={i}
                          />
                          {isCompleted && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 + 0.2 }}
                              className="mt-2 ml-1"
                            >
                              {fb ? (
                                <div
                                  className="flex items-center gap-2 text-sm glass-effect border border-border/40 rounded-lg px-3 py-1.5 w-fit"
                                  data-ocid="feedback.success_state"
                                >
                                  {renderStars(fb.rating)}
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: "oklch(0.65 0.18 150)" }}
                                  >
                                    Thank you for your feedback!
                                  </span>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs gap-1 h-7"
                                  style={{
                                    borderColor: "oklch(0.7 0.22 70 / 0.4)",
                                    color: "oklch(0.7 0.22 70)",
                                  }}
                                  onClick={() => setFeedbackOpen(bookingKey)}
                                  data-ocid="booking.feedback_button"
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

          {/* Payments Tab */}
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
                    className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl"
                    style={{
                      background: "oklch(var(--card) / 0.3)",
                      border: "1px dashed oklch(var(--border) / 0.5)",
                    }}
                    data-ocid="payments.empty_state"
                  >
                    <div
                      className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
                      style={{
                        background: "oklch(0.7 0.22 70 / 0.1)",
                        border: "1px solid oklch(0.7 0.22 70 / 0.3)",
                      }}
                    >
                      <CreditCard
                        className="w-8 h-8"
                        style={{ color: "oklch(0.7 0.22 70)" }}
                      />
                    </div>
                    <p className="text-lg font-display font-semibold text-foreground mb-1">
                      No payments yet
                    </p>
                    <p className="text-sm opacity-60 mb-6">
                      Your payment history will appear here.
                    </p>
                    <a
                      href="/booking"
                      className="btn-primary-luxury text-sm px-6 py-2"
                      data-ocid="payments.empty_state.primary_button"
                    >
                      Book a Session
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3" data-ocid="payments.list">
                    {payments.map((payment, i) => (
                      <PaymentCard
                        key={String(payment.id)}
                        payment={payment}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Notifications Tab */}
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
                    className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl"
                    style={{
                      background: "oklch(var(--card) / 0.3)",
                      border: "1px dashed oklch(var(--border) / 0.5)",
                    }}
                    data-ocid="notifications.empty_state"
                  >
                    <Bell className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-lg font-display font-semibold text-foreground">
                      All caught up!
                    </p>
                    <p className="text-sm opacity-60">
                      No notifications at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl p-4 transition-smooth"
                        style={{
                          background: n.isRead
                            ? "oklch(var(--card) / 0.4)"
                            : "oklch(0.7 0.22 70 / 0.06)",
                          border: n.isRead
                            ? "1px solid oklch(var(--border) / 0.4)"
                            : "1px solid oklch(0.7 0.22 70 / 0.3)",
                        }}
                        data-ocid={`notification.item.${i + 1}`}
                      >
                        <div className="flex items-start gap-3">
                          {!n.isRead && (
                            <span
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ background: "oklch(0.7 0.22 70)" }}
                            />
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
