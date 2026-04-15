import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  Code2,
  CreditCard,
  History,
  Images,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Star,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPaymentsPanel } from "../components/dashboard/AdminPaymentsPanel";
import { AdminStats } from "../components/dashboard/AdminStats";
import { CmsTab } from "../components/dashboard/CmsTab";
import { RazorpayButton } from "../components/ui/RazorpayButton";
import { clearAdminSession, useIsAdmin } from "../hooks/useAuth";
import { useAdminStats, useMyBookings } from "../hooks/useBackend";
import type { BookingRequest, BookingStats } from "../types";

// ─── Nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "users", label: "Users", icon: Users },
  { id: "media", label: "Media", icon: Images },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "emails", label: "Email Log", icon: Mail },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "history", label: "History", icon: History },
  { id: "cms", label: "CMS", icon: Code2 },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Sample data ─────────────────────────────────────────────────────────────
const SAMPLE_STATS: BookingStats = {
  totalBookings: 142,
  pendingBookings: 12,
  confirmedBookings: 38,
  completedBookings: 88,
  totalRevenue: 710,
  totalStudents: 267,
  totalCourseEnrollments: 89,
  recentActivity: [
    {
      id: "1",
      type: "booking",
      description: "New booking: Pre-Wedding Shoot",
      timestamp: BigInt(Date.now() - 600000) * BigInt(1_000_000),
    },
    {
      id: "2",
      type: "payment",
      description: "₹2 deposit received for booking BK041",
      timestamp: BigInt(Date.now() - 1800000) * BigInt(1_000_000),
    },
    {
      id: "3",
      type: "course",
      description: "New enrollment: Photography Fundamentals",
      timestamp: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
    },
    {
      id: "4",
      type: "booking",
      description: "Wedding shoot confirmed — 22 Apr",
      timestamp: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
    },
    {
      id: "5",
      type: "payment",
      description: "Certificate issued: RAP-PHO-2026-041",
      timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    },
  ],
};

const SAMPLE_BOOKINGS: BookingRequest[] = [
  {
    id: "BK041",
    clientId: "u1",
    clientName: "Priya Sharma",
    serviceCategoryId: "wedding_shoot",
    subServiceId: "candid_photography",
    date: "2026-04-28",
    timeSlot: "full_day",
    duration: "8 hours",
    location: { type: "studio", placeName: "RAP Studio" },
    status: "confirmed",
    initialPaymentAmount: 2,
    finalPaymentAmount: 3,
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
  },
  {
    id: "BK042",
    clientId: "u2",
    clientName: "Arjun Kumar",
    serviceCategoryId: "corporate_shoot",
    subServiceId: "business_headshots",
    date: "2026-04-29",
    timeSlot: "morning",
    duration: "2 hours",
    location: { type: "indoor", customAddress: "MG Road, Bengaluru" },
    status: "pending",
    initialPaymentAmount: 2,
    finalPaymentAmount: 3,
    createdAt: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
  },
  {
    id: "BK043",
    clientId: "u3",
    clientName: "Meera Nair",
    serviceCategoryId: "fashion_shoot",
    subServiceId: "editorial_shoot",
    date: "2026-04-30",
    timeSlot: "afternoon",
    duration: "4 hours",
    location: { type: "studio" },
    status: "awaiting_payment",
    initialPaymentAmount: 2,
    finalPaymentAmount: 3,
    createdAt: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
  },
];

const SAMPLE_USERS = [
  {
    id: "u1",
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    role: "client",
    isActive: true,
    joinedDaysAgo: 30,
  },
  {
    id: "u2",
    name: "Arjun Kumar",
    phone: "+91 87654 32109",
    role: "student",
    isActive: true,
    joinedDaysAgo: 15,
  },
  {
    id: "u3",
    name: "Meera Nair",
    phone: "+91 76543 21098",
    role: "client",
    isActive: true,
    joinedDaysAgo: 7,
  },
  {
    id: "u4",
    name: "Ravi Shankar",
    phone: "+91 65432 10987",
    role: "staff",
    isActive: true,
    joinedDaysAgo: 90,
  },
  {
    id: "u5",
    name: "Deepa Iyer",
    phone: "+91 54321 09876",
    role: "receptionist",
    isActive: false,
    joinedDaysAgo: 60,
  },
];

const SAMPLE_COURSES = [
  {
    id: "c1",
    title: "Photography Fundamentals",
    category: "photography",
    enrollments: 28,
    completed: 12,
  },
  {
    id: "c2",
    title: "Lightroom Mastery",
    category: "editing",
    enrollments: 19,
    completed: 8,
  },
  {
    id: "c3",
    title: "Wedding Cinematography",
    category: "videography",
    enrollments: 15,
    completed: 5,
  },
  {
    id: "c4",
    title: "Studio Management",
    category: "business",
    enrollments: 11,
    completed: 3,
  },
  {
    id: "c5",
    title: "Drone Photography & Videography",
    category: "specialized",
    enrollments: 9,
    completed: 2,
  },
];

const SAMPLE_MEDIA = [
  {
    id: "m1",
    title: "Pre-Wedding — Cubbon Park",
    category: "couple_shoot",
    featured: true,
  },
  {
    id: "m2",
    title: "Corporate — Tech Summit",
    category: "corporate_shoot",
    featured: false,
  },
  {
    id: "m3",
    title: "Fashion Editorial",
    category: "fashion_shoot",
    featured: true,
  },
  {
    id: "m4",
    title: "Food Photography — Zomato",
    category: "food_shoot",
    featured: false,
  },
  {
    id: "m5",
    title: "Newborn Session",
    category: "kids_shoot",
    featured: false,
  },
  {
    id: "m6",
    title: "Real Estate — Whitefield",
    category: "real_estate",
    featured: false,
  },
];

const SAMPLE_NOTIFICATIONS = [
  {
    id: "n1",
    userId: "u1",
    user: "Priya Sharma",
    title: "Booking Confirmed",
    message:
      "Your wedding shoot booking BK041 has been confirmed for 28 Apr 2026.",
    type: "booking",
    isRead: false,
    createdAt: Date.now() - 600000,
  },
  {
    id: "n2",
    userId: "u2",
    user: "Arjun Kumar",
    title: "Payment Received",
    message: "₹2 deposit received for booking BK042. Your slot is now secured.",
    type: "payment",
    isRead: true,
    createdAt: Date.now() - 3600000,
  },
  {
    id: "n3",
    userId: "u3",
    user: "Meera Nair",
    title: "Course Enrollment",
    message:
      "Welcome to Photography Fundamentals! Your course starts 1 May 2026.",
    type: "course",
    isRead: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: "n4",
    userId: "u4",
    user: "Ravi Shankar",
    title: "Certificate Ready",
    message: "Your certificate RAP-PHO-2026-041 is now available for download.",
    type: "system",
    isRead: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: "n5",
    userId: "u1",
    user: "Priya Sharma",
    title: "Final Payment Due",
    message: "Please complete your final payment of ₹3 for booking BK041.",
    type: "payment",
    isRead: false,
    createdAt: Date.now() - 172800000,
  },
];

const SAMPLE_EMAIL_LOGS = [
  {
    id: "e1",
    to: "ruchithabs550@gmail.com",
    subject: "New Booking: Wedding Shoot — Priya Sharma",
    body: "A new booking has been placed by Priya Sharma for Pre-Wedding Candid Photography on 28 Apr 2026. Booking ID: BK041. Please confirm.",
    timestamp: Date.now() - 600000,
  },
  {
    id: "e2",
    to: "ruchithabs550@gmail.com",
    subject: "Payment Confirmation: ₹2 deposit — BK042",
    body: "Arjun Kumar has paid the ₹2 deposit for booking BK042 (Corporate Business Headshots). Booking is now awaiting your confirmation.",
    timestamp: Date.now() - 3600000,
  },
  {
    id: "e3",
    to: "ruchithabs550@gmail.com",
    subject: "Course Enrollment: Photography Fundamentals",
    body: "Meera Nair has enrolled in Photography Fundamentals (Course ID: c1). Payment of ₹5 confirmed. Session starts 1 May 2026.",
    timestamp: Date.now() - 7200000,
  },
  {
    id: "e4",
    to: "ruchithabs550@gmail.com",
    subject: "Certificate Issued: RAP-PHO-2026-041",
    body: "Certificate RAP-PHO-2026-041 issued to Ravi Shankar for completing Lightroom Mastery. QR verification active.",
    timestamp: Date.now() - 86400000,
  },
];

const SAMPLE_FEEDBACK = [
  {
    id: "f1",
    user: "Priya Sharma",
    role: "client",
    target: "Wedding Shoot — Candid Photography",
    targetType: "service",
    rating: 5,
    comment:
      "Absolutely stunning work! Every moment captured perfectly. Will definitely book again.",
    date: "2026-04-10",
  },
  {
    id: "f2",
    user: "Arjun Kumar",
    role: "student",
    target: "Photography Fundamentals",
    targetType: "course",
    rating: 4,
    comment:
      "Very well structured course. The practical sessions were especially helpful for beginners.",
    date: "2026-04-08",
  },
  {
    id: "f3",
    user: "Meera Nair",
    role: "client",
    target: "Fashion Editorial Shoot",
    targetType: "service",
    rating: 5,
    comment:
      "The team is incredibly professional. The final photos were beyond my expectations.",
    date: "2026-04-05",
  },
  {
    id: "f4",
    user: "Ravi Shankar",
    role: "student",
    target: "Lightroom Mastery",
    targetType: "course",
    rating: 4,
    comment:
      "Detailed modules on color grading. Would love to see more advanced techniques covered.",
    date: "2026-04-01",
  },
  {
    id: "f5",
    user: "Sanya Kapoor",
    role: "client",
    target: "Corporate Headshots",
    targetType: "service",
    rating: 5,
    comment:
      "Quick turnaround and outstanding quality. Our team's LinkedIn profiles look stellar now.",
    date: "2026-03-28",
  },
];

const SAMPLE_HISTORY = [
  {
    id: "bk041",
    type: "booking",
    user: "Priya Sharma",
    target: "Wedding Shoot — Candid Photography",
    date: "2026-04-28",
    status: "confirmed",
    paymentStatus: "Deposit paid ₹2",
  },
  {
    id: "enr021",
    type: "enrollment",
    user: "Arjun Kumar",
    target: "Photography Fundamentals",
    date: "2026-04-15",
    status: "active",
    paymentStatus: "Paid ₹5",
  },
  {
    id: "bk040",
    type: "booking",
    user: "Meera Nair",
    target: "Fashion Editorial Shoot",
    date: "2026-04-12",
    status: "completed",
    paymentStatus: "Full ₹5 paid",
  },
  {
    id: "enr020",
    type: "enrollment",
    user: "Ravi Shankar",
    target: "Lightroom Mastery",
    date: "2026-04-03",
    status: "completed",
    paymentStatus: "Paid ₹5",
  },
  {
    id: "bk039",
    type: "booking",
    user: "Sanya Kapoor",
    target: "Corporate Headshots",
    date: "2026-03-28",
    status: "completed",
    paymentStatus: "Full ₹5 paid",
  },
  {
    id: "enr019",
    type: "enrollment",
    user: "Deepa Iyer",
    target: "Wedding Cinematography",
    date: "2026-03-20",
    status: "overdue",
    paymentStatus: "Pending ₹5",
  },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  staff: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  receptionist: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  client: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  student: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const NOTIF_TYPE_COLORS: Record<string, string> = {
  booking: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  payment: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  course: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  system: "bg-muted/50 text-muted-foreground border-border/30",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const isAdminLoggedIn = useIsAdmin();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  const { data: bookings = [] } = useMyBookings();
  const { data: adminStats } = useAdminStats();

  const stats = adminStats ?? SAMPLE_STATS;
  const displayBookings = bookings.length > 0 ? bookings : SAMPLE_BOOKINGS;

  const filteredBookings = displayBookings.filter(
    (b) => bookingFilter === "all" || b.status === bookingFilter,
  );
  const filteredUsers = SAMPLE_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch),
  );
  const filteredHistory = SAMPLE_HISTORY.filter(
    (h) => historyFilter === "all" || h.type === historyFilter,
  );

  const currentLabel =
    NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "Admin";

  // Admin is always unrestricted — no permission gate
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Camera className="w-16 h-16 mx-auto mb-4 text-primary/60" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Admin Access
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in with admin credentials.
          </p>
          <a
            href="/admin/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-smooth"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden w-full h-full cursor-default"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 flex-shrink-0 bg-card border-r border-border/50 flex flex-col z-50 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display font-bold text-sm text-foreground">
                RAP Studio
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground ml-9">
              Admin Dashboard
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden h-7 w-7"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth text-left ${
                  activeTab === item.id
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
                data-ocid={`admin-nav-${item.id}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
              A
            </div>
            <div>
              <p className="text-[10px] font-semibold text-foreground">
                Admin (Owner)
              </p>
              <p className="text-[9px] text-muted-foreground">Full access</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-[10px] h-7 border-border/50 text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearAdminSession();
              window.location.href = "/admin/login";
            }}
            data-ocid="admin-logout-btn"
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main area — expands to fill all remaining space */}
      <div className="flex-1 min-w-0 flex flex-col w-full">
        {/* Top bar */}
        <header className="sticky top-0 h-14 bg-card border-b border-border/50 flex items-center px-4 gap-4 z-30 w-full">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground">{currentLabel}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
              Admin
            </Badge>
          </div>
        </header>

        {/* Content — full width, no max-w constraints */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
          <AnimatePresence mode="wait">
            {/* ── Overview ────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <AdminStats stats={stats} />
              </motion.div>
            )}

            {/* ── Bookings ────────────────────────────────────────── */}
            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 w-full"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    "all",
                    "pending",
                    "confirmed",
                    "awaiting_payment",
                    "completed",
                    "cancelled",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setBookingFilter(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-smooth capitalize ${
                        bookingFilter === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/50 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
                <div className="space-y-3 w-full">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="w-full rounded-xl border border-border/50 bg-card p-4"
                      data-ocid="admin-booking-row"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground capitalize text-sm">
                              {booking.serviceCategoryId.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              #{booking.id}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {booking.subServiceId.replace(/_/g, " ")} •{" "}
                            {booking.date} • {booking.timeSlot}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Client: {booking.clientName} • Location:{" "}
                            {booking.location.type}
                            {booking.location.placeName
                              ? ` — ${booking.location.placeName}`
                              : ""}
                          </p>
                        </div>
                        <Badge className="text-xs border bg-muted/30 text-foreground border-border/30 flex-shrink-0 capitalize">
                          {booking.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {booking.status === "pending" && (
                          <Button
                            type="button"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            onClick={() =>
                              toast.success(`Booking ${booking.id} confirmed`)
                            }
                            data-ocid="admin-confirm-btn"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {booking.status === "pending" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={() =>
                              toast.error(`Booking ${booking.id} rejected`)
                            }
                            data-ocid="admin-reject-btn"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={() =>
                              toast.success(
                                `Marked delivered for ${booking.id}`,
                              )
                            }
                            data-ocid="admin-delivered-btn"
                          >
                            Mark Delivered
                          </Button>
                        )}
                        <RazorpayButton
                          amount={booking.initialPaymentAmount}
                          label="Trigger Payment"
                          referenceId={booking.id}
                          paymentType="booking_initial"
                          description={`Admin triggered payment for booking ${booking.id}`}
                          className="text-xs px-3 py-1.5 h-auto bg-orange-600 hover:bg-orange-700 text-white rounded-md"
                          data-ocid="admin-trigger-payment-btn"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground/40 mt-2 font-mono">
                        Upfront: ₹{booking.initialPaymentAmount} | Balance: ₹
                        {booking.finalPaymentAmount}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Payments ────────────────────────────────────────── */}
            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <AdminPaymentsPanel />
              </motion.div>
            )}

            {/* ── Courses ─────────────────────────────────────────── */}
            {activeTab === "courses" && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 w-full"
              >
                {SAMPLE_COURSES.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="w-full rounded-xl border border-border/50 bg-card p-4"
                    data-ocid="admin-course-row"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="capitalize">{course.category}</span>
                          <span>{course.enrollments} enrolled</span>
                          <span className="text-emerald-400">
                            {course.completed} completed
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 text-xs"
                        onClick={() => toast.success("Certificate issued!")}
                        data-ocid="issue-cert-btn"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Issue Cert
                      </Button>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{
                          width: `${Math.round((course.completed / Math.max(course.enrollments, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Users ───────────────────────────────────────────── */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 w-full"
              >
                <Input
                  placeholder="Search by name or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-muted/20 border-border/50 max-w-sm text-foreground"
                  data-ocid="user-search-input"
                />
                <div className="space-y-2 w-full">
                  {filteredUsers.map((user, i) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-full rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4"
                      data-ocid="admin-user-row"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Badge
                          className={`text-xs border capitalize ${ROLE_COLORS[user.role] ?? ""}`}
                        >
                          {user.role}
                        </Badge>
                        <Badge
                          className={`text-xs border ${user.isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}
                        >
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-border/50"
                          onClick={() =>
                            toast.success(
                              user.isActive
                                ? `${user.name} suspended`
                                : `${user.name} activated`,
                            )
                          }
                          data-ocid="toggle-user-status-btn"
                        >
                          {user.isActive ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Media ───────────────────────────────────────────── */}
            {activeTab === "media" && (
              <motion.div
                key="media"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {SAMPLE_MEDIA.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="group rounded-xl overflow-hidden border border-border/50 bg-card aspect-square relative"
                      data-ocid="admin-media-item"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted/30 to-accent/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-primary/40" />
                      </div>
                      {item.featured && (
                        <div className="absolute top-2 left-2">
                          <Badge className="text-[9px] bg-primary/80 text-primary-foreground border-0">
                            Featured
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-background/85 opacity-0 group-hover:opacity-100 transition-smooth flex flex-col items-center justify-center gap-2 p-3">
                        <p className="text-xs font-semibold text-foreground text-center">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {item.category.replace(/_/g, " ")}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className={`text-[10px] h-6 px-2 ${item.featured ? "bg-muted" : "bg-primary"}`}
                            onClick={() =>
                              toast.success(
                                item.featured
                                  ? "Removed from featured"
                                  : "Set as featured",
                              )
                            }
                            data-ocid="toggle-featured-btn"
                          >
                            {item.featured ? "Unfeature" : "Feature"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="text-[10px] h-6 px-2"
                            onClick={() => toast.success("Media deleted")}
                            data-ocid="admin-media-delete-btn"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Notifications ───────────────────────────────────── */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 w-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    {SAMPLE_NOTIFICATIONS.length} total notifications
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-border/50"
                    onClick={() =>
                      toast.success("All notifications marked as read")
                    }
                    data-ocid="mark-all-read-btn"
                  >
                    Mark all read
                  </Button>
                </div>
                {SAMPLE_NOTIFICATIONS.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-full rounded-xl border bg-card p-4 ${notif.isRead ? "border-border/30 opacity-70" : "border-primary/20"}`}
                    data-ocid="admin-notification-row"
                  >
                    <div className="flex items-start gap-3">
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      )}
                      {notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-muted/60 mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-foreground text-sm">
                            {notif.title}
                          </span>
                          <Badge
                            className={`text-[10px] border capitalize ${NOTIF_TYPE_COLORS[notif.type] ?? ""}`}
                          >
                            {notif.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground/60">
                          <span>User: {notif.user}</span>
                          <span>{formatRelativeTime(notif.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Email Simulation Log ─────────────────────────────── */}
            {activeTab === "emails" && (
              <motion.div
                key="emails"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 w-full"
              >
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <p className="text-xs text-yellow-300">
                    Email simulation log — real delivery is disabled. Emails are
                    stored here for admin review only.
                  </p>
                </div>
                <div className="space-y-3 w-full">
                  {SAMPLE_EMAIL_LOGS.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="w-full rounded-xl border border-border/50 bg-card p-4"
                      data-ocid="admin-email-log-row"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {log.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            To:{" "}
                            <span className="text-foreground">{log.to}</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 font-mono">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 bg-muted/20 rounded-lg px-3 py-2">
                        {log.body}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Feedback / Ratings ──────────────────────────────── */}
            {activeTab === "feedback" && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 w-full"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="rounded-xl border border-border/50 bg-card px-4 py-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-foreground text-sm">
                      {(
                        SAMPLE_FEEDBACK.reduce((s, f) => s + f.rating, 0) /
                        SAMPLE_FEEDBACK.length
                      ).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      avg rating
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card px-4 py-3">
                    <span className="font-bold text-foreground text-sm">
                      {SAMPLE_FEEDBACK.length}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">
                      total reviews
                    </span>
                  </div>
                </div>
                {SAMPLE_FEEDBACK.map((fb, i) => (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="w-full rounded-xl border border-border/50 bg-card p-4"
                    data-ocid="admin-feedback-row"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                          {fb.user.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {fb.user}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-[10px] border capitalize ${ROLE_COLORS[fb.role] ?? ""}`}
                            >
                              {fb.role}
                            </Badge>
                            <StarRating rating={fb.rating} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-muted-foreground/60">
                          {fb.date}
                        </p>
                        <Badge
                          className={`text-[10px] border mt-0.5 ${fb.targetType === "service" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30"}`}
                        >
                          {fb.targetType}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground/80 font-medium mb-1">
                      {fb.target}
                    </p>
                    <p className="text-xs text-foreground/80 italic">
                      &ldquo;{fb.comment}&rdquo;
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── History ─────────────────────────────────────────── */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 w-full"
              >
                <div className="flex flex-wrap gap-2">
                  {["all", "booking", "enrollment"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setHistoryFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-smooth capitalize ${
                        historyFilter === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/50 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {f === "all"
                        ? "All"
                        : f === "booking"
                          ? "Bookings"
                          : "Enrollments"}
                    </button>
                  ))}
                </div>
                <div className="w-full rounded-xl border border-border/50 bg-card overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-4 py-2.5 border-b border-border/50 bg-muted/20 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span>Type</span>
                    <span>Details</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span className="text-right">Payment</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {filteredHistory.map((h, i) => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-4 py-3"
                        data-ocid="admin-history-row"
                      >
                        <div>
                          <Badge
                            className={`text-[10px] border capitalize ${h.type === "booking" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30"}`}
                          >
                            {h.type}
                          </Badge>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {h.target}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {h.user}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {h.date}
                        </span>
                        <Badge
                          className={`text-[10px] border capitalize ${
                            h.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : h.status === "active"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                : h.status === "overdue"
                                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                                  : "bg-muted/50 text-muted-foreground border-border/30"
                          }`}
                        >
                          {h.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground text-right whitespace-nowrap">
                          {h.paymentStatus}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── CMS Editor ──────────────────────────────────────── */}
            {activeTab === "cms" && (
              <motion.div
                key="cms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <CmsTab />
              </motion.div>
            )}

            {/* ── Settings ────────────────────────────────────────── */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl space-y-4"
              >
                {[
                  {
                    label: "Razorpay Key ID",
                    value: "rzp_test_SZm0CNQyCUq5Zt",
                    hint: "Live key: replace with rzp_live_... in production",
                  },
                  {
                    label: "Admin Contact Email",
                    value: "ruchithabs550@gmail.com",
                    hint: "All booking and notification emails go here",
                  },
                  {
                    label: "Admin Password",
                    value: "••••••••••••",
                    hint: "rapstudio2024 — change in production",
                  },
                  {
                    label: "Studio Name",
                    value: "RAP Integrated Studio",
                    hint: "Used in certificates and invoices",
                  },
                ].map((setting) => (
                  <div
                    key={setting.label}
                    className="rounded-xl border border-border/50 bg-card p-4"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {setting.label}
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {setting.value}
                    </p>
                    {setting.hint && (
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {setting.hint}
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
