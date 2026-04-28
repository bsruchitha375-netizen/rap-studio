import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  CreditCard,
  LogOut,
  MapPin,
  Moon,
  Pencil,
  Phone,
  Star,
  Sun,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import type { BookingRequest as BackendBookingRequest } from "../backend.d.ts";
import { BookingCard } from "../components/dashboard/BookingCard";
import { FeedbackForm } from "../components/dashboard/FeedbackForm";
import { LiveIndicator } from "../components/dashboard/LiveIndicator";
import { PaymentCard } from "../components/dashboard/PaymentCard";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import { useMyBookings, useMyPayments } from "../hooks/useBackend";
import type { FeedbackRecord } from "../types";

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
            color: s <= rating ? "oklch(0.8 0.2 70)" : "oklch(0.4 0.02 280)",
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

function ThemeToggleBtn() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs border-white/20 text-white/80 hover:text-foreground hover:border-border"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      data-ocid="client-dashboard.theme_toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}

interface ClientProfileTabProps {
  name: string;
  user: { email?: string; phone?: string; name?: string } | null;
  profile:
    | {
        email?: string;
        phone?: string;
        address?: string;
        status?: string;
        role?: string;
      }
    | null
    | undefined;
}

function ClientProfileTab({ name, user, profile }: ClientProfileTabProps) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fields = [
    { label: "Full Name", value: displayName, isName: true, icon: User },
    { label: "Email", value: profile?.email ?? user?.email ?? "—", icon: Bell },
    {
      label: "Phone",
      value: profile?.phone ?? user?.phone ?? "—",
      icon: Phone,
    },
    { label: "Role", value: "Client", icon: Camera },
    {
      label: "Status",
      value: String(profile?.status ?? "Active"),
      icon: CheckCircle2,
    },
    { label: "Address", value: profile?.address ?? "—", icon: MapPin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex flex-col items-center py-8 mb-6 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.02 280 / 0.8), oklch(0.12 0.014 275 / 0.6))",
          border: "1px solid oklch(0.7 0.22 70 / 0.2)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-display mb-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.7 0.22 70 / 0.25), oklch(0.7 0.22 70 / 0.1))",
            border: "2px solid oklch(0.7 0.22 70 / 0.5)",
            color: "oklch(0.82 0.2 70)",
          }}
        >
          {initials || <User className="w-8 h-8" />}
        </div>
        <h2 className="text-xl font-display font-bold text-white">
          {displayName}
        </h2>
        <p className="text-xs text-white/50 mt-1">RAP Studio · Client</p>
        <Badge
          className="mt-2 text-[10px] border"
          style={{
            background: "oklch(0.7 0.22 70 / 0.15)",
            color: "oklch(0.82 0.2 70)",
            borderColor: "oklch(0.7 0.22 70 / 0.35)",
          }}
        >
          Client
        </Badge>
      </div>

      <div
        className="rounded-2xl overflow-hidden mb-4 bg-card border border-border/40"
        style={{ backdropFilter: "blur(10px)" }}
      >
        {fields.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.label}
              className={`flex items-center gap-4 px-5 py-3.5 ${i < fields.length - 1 ? "border-b border-border/20" : ""}`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {f.label}
                </p>
                {editing && f.isName ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-0.5 h-7 text-sm bg-background border-input text-foreground"
                    data-ocid="client-profile.name_input"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium truncate">
                    {f.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant={editing ? "default" : "outline"}
        className={`w-full gap-2 ${editing ? "btn-primary-luxury" : ""}`}
        onClick={() => setEditing((v) => !v)}
        data-ocid="client-profile.edit_button"
      >
        {editing ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Save Changes
          </>
        ) : (
          <>
            <Pencil className="w-4 h-4" />
            Edit Profile
          </>
        )}
      </Button>
    </motion.div>
  );
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
  const [activeTab, setActiveTab] = useState("bookings");
  const [submittedFeedback, setSubmittedFeedback] = useState<
    Record<string, FeedbackRecord>
  >({});
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const navigate = useNavigate();

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
                  <p className="text-xs uppercase tracking-widest text-amber-300/70">
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
                <h1 className="text-2xl font-display font-bold text-white">
                  Welcome back,{" "}
                  <span style={{ color: "oklch(0.82 0.2 70)" }}>{name}</span>
                </h1>
                <p className="text-xs text-white/60 mt-0.5">
                  Manage your bookings and sessions with RAP Studio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ThemeToggleBtn />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-white/20 text-white/80 hover:border-destructive/40 hover:text-destructive"
                onClick={handleLogout}
                data-ocid="client-dashboard.logout_button"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="client-dashboard.tabs"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <TabsList className="border border-border/50 bg-card/50">
              <TabsTrigger
                value="bookings"
                className="gap-2"
                data-ocid="client-dashboard.bookings.tab"
              >
                <Camera className="w-4 h-4" /> My Bookings
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
                <CreditCard className="w-4 h-4" /> My Payments
                {payments.length > 0 && (
                  <Badge className="ml-1 text-xs bg-primary/20 text-primary border-0 h-4 px-1">
                    {payments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="gap-2"
                data-ocid="client-dashboard.profile.tab"
              >
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
            </TabsList>
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
                    className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl bg-card/30"
                    style={{ border: "1px dashed oklch(var(--border) / 0.5)" }}
                    data-ocid="bookings.empty_state"
                  >
                    <div className="w-20 h-20 rounded-full mb-5 flex items-center justify-center bg-primary/10 border border-primary/30">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-display font-semibold text-foreground mb-2">
                      No bookings yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
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
                      const bookingKey = String(booking.id ?? i);
                      const fb = submittedFeedback[bookingKey];
                      const isCompleted =
                        String(booking.status ?? "").toLowerCase() ===
                        "completed";
                      return (
                        <div
                          key={bookingKey}
                          data-ocid={`booking.item.${i + 1}`}
                        >
                          <BookingCard
                            booking={
                              booking as unknown as BackendBookingRequest
                            }
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
                                  className="flex items-center gap-2 text-sm bg-card border border-border/40 rounded-lg px-3 py-1.5 w-fit"
                                  data-ocid="feedback.success_state"
                                >
                                  {renderStars(fb.rating)}
                                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    Thank you for your feedback!
                                  </span>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs gap-1 h-7 text-primary border-primary/40"
                                  onClick={() => setFeedbackOpen(bookingKey)}
                                  data-ocid="booking.feedback_button"
                                >
                                  <Star className="w-3 h-3" /> Leave Feedback ★
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
                    className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl bg-card/30"
                    style={{ border: "1px dashed oklch(var(--border) / 0.5)" }}
                    data-ocid="payments.empty_state"
                  >
                    <div className="w-20 h-20 rounded-full mb-5 flex items-center justify-center bg-primary/10 border border-primary/30">
                      <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-display font-semibold text-foreground mb-1">
                      No payments yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
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
                        key={String(payment.id ?? i)}
                        payment={payment}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="profile">
            <AnimatePresence mode="wait">
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ClientProfileTab
                  name={name}
                  user={
                    user
                      ? {
                          email: (user as { email?: string }).email,
                          phone: (user as { phone?: string }).phone,
                          name: (user as { name?: string }).name,
                        }
                      : null
                  }
                  profile={profile}
                />
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
