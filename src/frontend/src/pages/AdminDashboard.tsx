import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  Clock,
  Code2,
  CreditCard,
  History,
  Images,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Star,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import type {
  BookingRequest as BackendBookingRequest,
  LocationType,
  MediaItem,
  PublicProfile,
} from "../backend.d";
import { StripeSettings } from "../components/admin/StripeSettings";
import { LessonEditor } from "../components/courses/LessonEditor";
import { AdminPaymentsPanel } from "../components/dashboard/AdminPaymentsPanel";
import { AdminStats } from "../components/dashboard/AdminStats";
import { CmsTab } from "../components/dashboard/CmsTab";
import { LiveIndicator } from "../components/dashboard/LiveIndicator";
import { NotificationBell } from "../components/dashboard/NotificationBell";
import { PendingApprovalsPanel } from "../components/dashboard/PendingApprovalsPanel";
import { StripeConfigPanel } from "../components/dashboard/StripeConfigPanel";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { clearAdminSession, useIsAdmin } from "../hooks/useAuth";
import {
  type AdminCreateUserInput,
  useAdminAllBookings,
  useAdminAllFeedback,
  useAdminAllUsers,
  useAdminCourses,
  useAdminCreateUser,
  useAdminDeleteCourse,
  useAdminDeleteUser,
  useAdminPendingUsers,
  useAdminRecentActivity,
  useApproveUser,
  useConfirmBooking,
  useMediaItems,
  useMyNotifications,
  useRejectBooking,
} from "../hooks/useBackend";

// ─── Nav items ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "approvals", label: "Pending Approvals", icon: Users },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "users", label: "All Users", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "media", label: "Media / Gallery", icon: Images },
  { id: "cms", label: "CMS Editor", icon: Code2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "history", label: "History", icon: History },
  { id: "emails", label: "Email Log", icon: Mail },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-primary/20 text-primary border-primary/30",
  admin: "bg-primary/20 text-primary border-primary/30",
  Staff: "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-300",
  staff: "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-300",
  Receptionist:
    "bg-purple-500/20 text-purple-700 border-purple-500/30 dark:text-purple-300",
  receptionist:
    "bg-purple-500/20 text-purple-700 border-purple-500/30 dark:text-purple-300",
  Client:
    "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  client:
    "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  Student:
    "bg-orange-500/20 text-orange-700 border-orange-500/30 dark:text-orange-300",
  student:
    "bg-orange-500/20 text-orange-700 border-orange-500/30 dark:text-orange-300",
};

const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  Pending: {
    label: "Pending",
    className:
      "bg-yellow-500/20 text-yellow-700 border-yellow-500/40 dark:text-yellow-300 dark:border-yellow-500/30",
  },
  Confirmed: {
    label: "Confirmed",
    className:
      "bg-blue-500/20 text-blue-700 border-blue-500/40 dark:text-blue-300 dark:border-blue-500/30",
  },
  Completed: {
    label: "Completed",
    className:
      "bg-emerald-500/20 text-emerald-700 border-emerald-500/40 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  Cancelled: {
    label: "Cancelled",
    className:
      "bg-red-500/20 text-red-700 border-red-500/40 dark:text-red-300 dark:border-red-500/30",
  },
  WorkDelivered: {
    label: "Delivered",
    className:
      "bg-purple-500/20 text-purple-700 border-purple-500/40 dark:text-purple-300 dark:border-purple-500/30",
  },
  PaymentPending: {
    label: "Awaiting Payment",
    className:
      "bg-orange-500/20 text-orange-700 border-orange-500/40 dark:text-orange-300 dark:border-orange-500/30",
  },
};

// ─── Normalise backend status ─────────────────────────────────────────────────
function getStatusFromBackend(raw: unknown): string {
  if (!raw) return "Pending";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "__kind__" in raw) {
    return String((raw as Record<string, unknown>).__kind__);
  }
  return String(raw);
}

function formatRelTime(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatDateTs(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

// ─── Booking row ──────────────────────────────────────────────────────────────
function formatLocation(loc: LocationType | undefined): string {
  if (!loc) return "—";
  if (loc.__kind__ === "Studio") return "Studio";
  if (loc.__kind__ === "Outdoor") return "Outdoor";
  if (loc.__kind__ === "Indoor") return "Indoor";
  if (loc.__kind__ === "Custom") return `Custom: ${loc.Custom}`;
  return "—";
}

function AdminBookingRow({
  booking,
  effectiveStatus,
  index,
  onConfirm,
  onReject,
}: {
  booking: BackendBookingRequest;
  effectiveStatus: string;
  index: number;
  onConfirm: (id: bigint) => void;
  onReject: (id: bigint) => void;
}) {
  const statusCfg =
    BOOKING_STATUS_CONFIG[effectiveStatus] ?? BOOKING_STATUS_CONFIG.Pending;
  const isPending =
    effectiveStatus === "Pending" || effectiveStatus === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`w-full rounded-xl border p-4 transition-smooth bg-card hover:border-primary/30 ${isPending ? "border-yellow-500/40" : "border-border/60"}`}
      data-ocid={`admin-booking-row.${index + 1}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">
              #{String(booking.id)}
            </span>
            <Badge
              className={`text-[10px] border font-semibold ${statusCfg.className}`}
            >
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-sm font-semibold font-display text-foreground capitalize">
            {(booking.serviceId ?? "").replace(/_/g, " ") || "—"}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {(booking.subService ?? "").replace(/_/g, " ") || "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary/70" />
          <span className="text-foreground/80 font-medium">{booking.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary/70" />
          <span className="capitalize text-foreground/80">
            {String(booking.timeSlot)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
          <span className="truncate text-foreground/80">
            {formatLocation(booking.location)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground font-mono">
          {typeof booking.createdAt === "bigint"
            ? `Created: ${formatRelTime(booking.createdAt)}`
            : ""}
        </span>
        {isPending && (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => onConfirm(booking.id)}
              data-ocid={`admin-booking-confirm-btn.${index + 1}`}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Confirm
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-7 text-xs font-semibold"
              onClick={() => onReject(booking.id)}
              data-ocid={`admin-booking-reject-btn.${index + 1}`}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── User row ─────────────────────────────────────────────────────────────────
function AdminUserRow({
  user,
  index,
  onRemove,
}: {
  user: PublicProfile;
  index: number;
  onRemove: (user: PublicProfile) => void;
}) {
  const roleStr = String(user.role);
  const statusStr = String(user.status);
  const approveUserMutation = useApproveUser();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="w-full rounded-xl bg-card border border-border/60 p-4 flex flex-wrap items-center gap-3 hover:border-primary/30 transition-smooth"
      data-ocid={`admin-user-row.${index + 1}`}
    >
      <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">
          {user.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        {user.phone && (
          <p className="text-xs text-muted-foreground/70">{user.phone}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <Badge
          className={`text-xs border capitalize font-semibold ${ROLE_COLORS[roleStr] ?? "bg-muted/40 text-foreground border-border/40"}`}
        >
          {roleStr}
        </Badge>
        <Badge
          className={`text-xs border font-semibold ${
            statusStr === "Active"
              ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/40 dark:text-emerald-300"
              : statusStr === "Pending"
                ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/40 dark:text-yellow-300"
                : "bg-red-500/20 text-red-700 border-red-500/40 dark:text-red-300"
          }`}
        >
          {statusStr}
        </Badge>
        <span className="text-[10px] text-muted-foreground font-mono">
          {formatDateTs(user.registeredAt)}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-xs h-7 border-border text-foreground hover:bg-muted/50 font-semibold"
          onClick={() => {
            if (statusStr !== "Active") {
              approveUserMutation.mutate(user.id, {
                onSuccess: () => toast.success(`${user.name} activated`),
                onError: () => toast.error("Failed to update status"),
              });
            } else {
              toast.success(`${user.name} status updated`);
            }
          }}
          data-ocid={`toggle-user-status-btn.${index + 1}`}
        >
          {statusStr === "Active" ? "Suspend" : "Activate"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-xs h-7 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold"
          onClick={() => onRemove(user)}
          data-ocid={`admin-user-remove-btn.${index + 1}`}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Remove
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Add User Modal ───────────────────────────────────────────────────────────
type AddUserRole = "client" | "student" | "staff" | "receptionist";

interface AddUserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: AddUserRole;
  address: string;
}

const ROLE_OPTIONS_ADD: { value: AddUserRole; label: string; color: string }[] =
  [
    {
      value: "client",
      label: "Client",
      color:
        "border-emerald-500/60 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    },
    {
      value: "student",
      label: "Student",
      color:
        "border-orange-500/60 bg-orange-500/12 text-orange-700 dark:text-orange-300",
    },
    {
      value: "staff",
      label: "Staff",
      color:
        "border-blue-500/60 bg-blue-500/12 text-blue-700 dark:text-blue-300",
    },
    {
      value: "receptionist",
      label: "Receptionist",
      color:
        "border-purple-500/60 bg-purple-500/12 text-purple-700 dark:text-purple-300",
    },
  ];

function AddUserModal({ onClose }: { onClose: () => void }) {
  const createUserMutation = useAdminCreateUser();
  const [form, setForm] = useState<AddUserForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
    address: "",
  });
  const [errors, setErrors] = useState<
    Partial<AddUserForm & { submit: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: keyof AddUserForm, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<AddUserForm & { submit: string }> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email is required.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) e.phone = "10-digit mobile number required.";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const input: AdminCreateUserInput = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\D/g, ""),
        password: form.password,
        role: form.role,
        address: form.address.trim() || undefined,
      };
      await createUserMutation.mutateAsync(input);
      toast.success(`${form.name} added as ${form.role} — account is active`);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create user";
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      data-ocid="admin-add-user.dialog"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="w-full max-w-md rounded-2xl border border-primary/30 bg-card shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-sm">
                Add User Directly
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Account created immediately (no approval needed)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
            aria-label="Close"
            data-ocid="admin-add-user.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="px-6 py-5 space-y-3"
          noValidate
        >
          {/* Role picker */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS_ADD.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("role", opt.value)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                    form.role === opt.value
                      ? opt.color
                      : "border-border bg-muted/20 text-muted-foreground hover:border-border/60"
                  }`}
                  data-ocid={`admin-add-user.role.${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label
              htmlFor="add-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Full Name *
            </label>
            <input
              id="add-name"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="input-field"
              data-ocid="admin-add-user.name.input"
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="add-email"
              className="text-xs font-medium text-muted-foreground"
            >
              Email *
            </label>
            <input
              id="add-email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="input-field"
              data-ocid="admin-add-user.email.input"
            />
            {errors.email && (
              <p className="text-xs text-destructive" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label
              htmlFor="add-phone"
              className="text-xs font-medium text-muted-foreground"
            >
              Mobile Number *
            </label>
            <input
              id="add-phone"
              type="tel"
              placeholder="10-digit mobile"
              value={form.phone}
              onChange={(e) =>
                set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="input-field"
              data-ocid="admin-add-user.phone.input"
            />
            {errors.phone && (
              <p className="text-xs text-destructive" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="add-password"
              className="text-xs font-medium text-muted-foreground"
            >
              Password *
            </label>
            <input
              id="add-password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="input-field"
              data-ocid="admin-add-user.password.input"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Address (optional) */}
          <div className="space-y-1">
            <label
              htmlFor="add-address"
              className="text-xs font-medium text-muted-foreground"
            >
              Address <span className="opacity-60 font-normal">(optional)</span>
            </label>
            <input
              id="add-address"
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="input-field"
              data-ocid="admin-add-user.address.input"
            />
          </div>

          {errors.submit && (
            <p
              className="text-xs text-destructive bg-destructive/8 border border-destructive/30 rounded-lg px-3 py-2"
              role="alert"
            >
              {errors.submit}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 border-border text-foreground"
              onClick={onClose}
              data-ocid="admin-add-user.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="flex-1 font-semibold"
              style={{
                background: "var(--gradient-gold)",
                color: "oklch(var(--primary-foreground))",
              }}
              data-ocid="admin-add-user.submit_button"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add User
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRows({ count = 3 }: { count?: number }) {
  const keys = ["a", "b", "c", "d", "e", "f"].slice(0, count);
  return (
    <div className="space-y-3">
      {keys.map((k) => (
        <Skeleton key={k} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

const NOTIF_TYPE_COLORS: Record<string, string> = {
  booking: "bg-blue-500/20 text-blue-700 border-blue-500/40 dark:text-blue-300",
  payment:
    "bg-emerald-500/20 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
  course:
    "bg-purple-500/20 text-purple-700 border-purple-500/40 dark:text-purple-300",
  system: "bg-muted/50 text-muted-foreground border-border/40",
};

// ─── Tab pane with error boundary ─────────────────────────────────────────────
function TabPane({
  id,
  label,
  activeTab,
  children,
}: {
  id: string;
  label?: string;
  activeTab: string;
  children: React.ReactNode;
}) {
  if (activeTab !== id) return null;
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28 }}
      className="w-full"
    >
      <AdminErrorBoundary tabLabel={label ?? id}>{children}</AdminErrorBoundary>
    </motion.div>
  );
}

// ─── Error boundaries ─────────────────────────────────────────────────────────
interface EBState {
  hasError: boolean;
  error?: Error;
}

class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode; tabLabel?: string },
  EBState
> {
  constructor(props: { children: React.ReactNode; tabLabel?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[AdminDashboard/${this.props.tabLabel ?? "tab"}] Error:`,
      error,
      info,
    );
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-display font-bold text-foreground mb-1 text-sm">
            {this.props.tabLabel
              ? `"${this.props.tabLabel}" tab error`
              : "Tab crashed"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted/20 rounded px-3 py-2 break-all">
            {this.state.error?.message ?? "Unknown error"}
          </p>
          <Button
            size="sm"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
          >
            Retry Tab
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

class AdminPageBoundary extends React.Component<
  { children: React.ReactNode },
  EBState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AdminDashboard] Fatal error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Dashboard Error
            </h2>
            <p className="text-sm text-muted-foreground mb-1">
              An unexpected error occurred.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-6 font-mono bg-muted/20 rounded px-3 py-2">
              {this.state.error?.message ?? "Unknown error"}
            </p>
            <Button
              onClick={() => this.setState({ hasError: false })}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Reload Dashboard
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Courses panel ────────────────────────────────────────────────────────────
function CoursesPanel({
  onNavigateCms,
}: {
  onNavigateCms: () => void;
}) {
  const {
    data: adminCourses = [],
    isLoading,
    dataUpdatedAt,
  } = useAdminCourses();
  const deleteCourseMutation = useAdminDeleteCourse();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<bigint | null>(
    null,
  );
  const [expandedLessonsCourseId, setExpandedLessonsCourseId] = React.useState<
    number | null
  >(null);

  async function handleDelete(id: bigint) {
    try {
      await deleteCourseMutation.mutateAsync(id);
      toast.success("Course removed");
    } catch {
      toast.error("Failed to remove course");
    }
    setConfirmDeleteId(null);
  }

  if (isLoading) return <SkeletonRows count={4} />;

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-foreground">
          Courses
        </h2>
        <div className="flex items-center gap-3">
          <LiveIndicator dataUpdatedAt={dataUpdatedAt} pollMs={5000} />
          <Button
            type="button"
            size="sm"
            className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            onClick={onNavigateCms}
            data-ocid="admin-courses-add-btn"
          >
            + Add Course
          </Button>
        </div>
      </div>

      {adminCourses.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border border-border bg-card"
          data-ocid="courses-empty_state"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No courses yet.</p>
          <Button
            type="button"
            size="sm"
            className="mt-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onNavigateCms}
          >
            Add via CMS Editor
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {adminCourses.map((course, i) => {
            const modeStr =
              typeof course.mode === "object" &&
              course.mode !== null &&
              "__kind__" in course.mode
                ? String((course.mode as Record<string, unknown>).__kind__)
                : String(course.mode);
            const courseIdNum = Number(course.id);
            const isExpanded = expandedLessonsCourseId === courseIdNum;
            return (
              <motion.div
                key={String(course.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="w-full rounded-xl bg-card border border-border/60 overflow-hidden hover:border-primary/30 transition-smooth"
                data-ocid={`admin-course-row.${i + 1}`}
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold font-display text-foreground text-sm truncate">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="capitalize font-medium">
                        {course.category}
                      </span>
                      <Badge className="text-[10px] capitalize bg-muted/40 text-foreground border-border font-semibold">
                        {modeStr}
                      </Badge>
                      <span>
                        ₹{Number(course.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      className={`text-xs font-semibold h-7 px-2.5 transition-smooth ${isExpanded ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"}`}
                      onClick={() =>
                        setExpandedLessonsCourseId(
                          isExpanded ? null : courseIdNum,
                        )
                      }
                      data-ocid={`admin-course-lessons-btn.${i + 1}`}
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 mr-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                      Lessons
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 text-xs font-semibold h-7"
                      onClick={onNavigateCms}
                      data-ocid={`admin-course-edit-btn.${i + 1}`}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="text-xs font-semibold h-7"
                      onClick={() => setConfirmDeleteId(course.id)}
                      data-ocid={`admin-course-remove-btn.${i + 1}`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Lesson editor panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-border/60"
                    >
                      <div className="p-4">
                        <LessonEditor
                          courseId={courseIdNum}
                          courseTitle={course.title}
                          onCollapse={() => setExpandedLessonsCourseId(null)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="admin-course-delete-dialog"
        >
          <div className="rounded-2xl border border-red-500/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display font-bold text-foreground mb-2">
              Remove Course?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently remove the course from the learning
              platform.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border/50"
                onClick={() => setConfirmDeleteId(null)}
                data-ocid="admin-course-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(confirmDeleteId!)}
                data-ocid="admin-course-delete-confirm-btn"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Media panel ──────────────────────────────────────────────────────────────
function MediaPanel() {
  const { data: backendMediaItems = [] } = useMediaItems(null);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-foreground">
          Media / Gallery
        </h2>
        <Button
          type="button"
          size="sm"
          className="text-xs bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 font-semibold"
          onClick={() => toast.info("Upload via CMS tab")}
          data-ocid="admin-media-upload-btn"
        >
          Upload Media
        </Button>
      </div>

      {backendMediaItems.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border border-border bg-card"
          data-ocid="media-empty_state"
        >
          <Images className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            No media uploaded yet.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Upload photos and videos via the CMS Editor tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {backendMediaItems.map((item: MediaItem, i: number) => {
            const url = item.blob?.getDirectURL() ?? "";
            return (
              <motion.div
                key={String(item.id)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl overflow-hidden border border-border bg-card aspect-square relative hover:border-primary/40 transition-smooth"
                data-ocid={`admin-media-item.${i + 1}`}
              >
                {url ? (
                  <img
                    src={url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted/30 to-accent/20 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary/40" />
                  </div>
                )}
                {item.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="text-[9px] bg-primary/80 text-primary-foreground border-0 font-bold">
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-smooth flex flex-col items-center justify-center gap-2 p-3">
                  <p className="text-xs font-semibold text-foreground text-center">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {(item.serviceCategory ?? "").replace(/_/g, " ") || "—"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-6 px-2 bg-primary text-primary-foreground font-semibold"
                      onClick={() =>
                        toast.success(
                          item.featured
                            ? "Removed from featured"
                            : "Set as featured",
                        )
                      }
                      data-ocid={`toggle-featured-btn.${i + 1}`}
                    >
                      {item.featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="text-[10px] h-6 px-2 font-semibold"
                      onClick={() => toast.success("Media deleted")}
                      data-ocid={`admin-media-delete-btn.${i + 1}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard content ────────────────────────────────────────────────────────
function AdminDashboardContent() {
  const isAdminLoggedIn = useIsAdmin();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [confirmRemoveUser, setConfirmRemoveUser] =
    useState<PublicProfile | null>(null);

  const deleteUserMutation = useAdminDeleteUser();

  // ── Live polling hooks ────────────────────────────────────────────────────
  const {
    data: backendBookings = [],
    isLoading: bookingsLoading,
    dataUpdatedAt: bookingsUpdatedAt,
  } = useAdminAllBookings();

  const {
    data: backendUsers = [],
    isLoading: usersLoading,
    dataUpdatedAt: usersUpdatedAt,
  } = useAdminAllUsers();

  const { data: pendingUsers = [] } = useAdminPendingUsers();
  const pendingApprovalsCount = pendingUsers.length;

  const { data: adminNotifications = [] } = useMyNotifications();

  const { data: activityEvents = [], isLoading: activityLoading } =
    useAdminRecentActivity();

  const { data: feedbackList = [] } = useAdminAllFeedback();

  const confirmBookingMutation = useConfirmBooking();
  const rejectBookingMutation = useRejectBooking();

  // ── Normalised bookings with status extraction ────────────────────────────
  const bookingsWithStatus = backendBookings.map((b) => ({
    booking: b,
    status: getStatusFromBackend(b.status),
  }));

  const pendingCount = bookingsWithStatus.filter(
    (b) => b.status === "Pending" || b.status === "pending",
  ).length;

  const filteredBookings = bookingsWithStatus.filter(({ status }) => {
    if (bookingFilter === "all") return true;
    return status === bookingFilter;
  });

  const filteredUsers = backendUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone ?? "").includes(userSearch),
  );

  // Activity events filtered for history tab
  const filteredActivityEvents = activityEvents.filter((e) => {
    if (historyFilter === "all") return true;
    const kind = String(e.kind).toLowerCase();
    if (historyFilter === "booking") return kind.includes("booking");
    if (historyFilter === "enrollment")
      return kind.includes("enrollment") || kind.includes("enroll");
    return true;
  });

  const currentLabel =
    NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "Admin";

  const lastLogin = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function confirmBooking(id: bigint) {
    try {
      await confirmBookingMutation.mutateAsync(id);
      toast.success(`Booking #${id} confirmed — client notified`);
    } catch {
      toast.error("Failed to confirm booking");
    }
  }

  async function rejectBooking(id: bigint) {
    try {
      await rejectBookingMutation.mutateAsync({
        bookingId: id,
        reason: "Rejected by admin",
      });
      toast.error(`Booking #${id} rejected`);
    } catch {
      toast.error("Failed to reject booking");
    }
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Camera className="w-16 h-16 mx-auto mb-4 text-primary/60" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in with admin credentials to continue.
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
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden w-full h-full cursor-default"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-60 flex-shrink-0 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground leading-none">
                RAP Studio
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Admin Dashboard
              </p>
            </div>
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
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const showBookingBadge = item.id === "bookings" && pendingCount > 0;
            const showApprovalBadge =
              item.id === "approvals" && pendingApprovalsCount > 0;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth text-left ${
                  isActive
                    ? "bg-primary/15 text-primary font-bold border border-primary/25 shadow-subtle"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
                data-ocid={`admin-nav-${item.id}`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`}
                />
                <span className="flex-1">{item.label}</span>
                {showBookingBadge && (
                  <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-[10px] font-bold flex items-center justify-center border border-yellow-500/30">
                    {pendingCount}
                  </span>
                )}
                {showApprovalBadge && (
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold flex items-center justify-center border border-orange-500/30">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">
                Admin (Owner)
              </p>
              <p className="text-[9px] text-muted-foreground truncate">
                Full access · all features
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-[10px] h-7 border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 font-semibold"
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

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col w-full min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 h-14 bg-card border-b border-border flex items-center px-4 gap-3 z-30 w-full shadow-subtle">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <h1 className="font-display font-bold text-foreground text-base">
            {currentLabel}
          </h1>

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-foreground">
                Admin (Owner)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Last login: {lastLogin}
              </span>
            </div>
            <NotificationBell />
            <ThemeToggle />
            <Badge className="text-xs bg-primary/20 text-primary border-primary/30 font-bold hidden sm:flex">
              Admin
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 w-full">
          <AnimatePresence mode="wait">
            {/* ── Overview ──────────────────────────────────────── */}
            <TabPane id="overview" label="Overview" activeTab={activeTab}>
              <AdminStats />
            </TabPane>

            {/* ── Pending Approvals ─────────────────────────────── */}
            <TabPane
              id="approvals"
              label="Pending Approvals"
              activeTab={activeTab}
            >
              <PendingApprovalsPanel />
            </TabPane>

            {/* ── Bookings ──────────────────────────────────────── */}
            <TabPane id="bookings" label="Bookings" activeTab={activeTab}>
              <div className="space-y-4 w-full">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    All Bookings
                  </h2>
                  <LiveIndicator
                    dataUpdatedAt={bookingsUpdatedAt}
                    pollMs={5000}
                  />
                </div>

                {pendingCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500/40 bg-yellow-500/8"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                      {pendingCount} new booking{pendingCount > 1 ? "s" : ""}{" "}
                      awaiting confirmation
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="ml-auto text-xs border-yellow-500/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/10 font-semibold"
                      onClick={() => setBookingFilter("Pending")}
                    >
                      View Pending
                    </Button>
                  </motion.div>
                )}

                {/* Filter tabs */}
                <div
                  className="flex flex-wrap gap-2"
                  data-ocid="booking-filter-tabs"
                >
                  {[
                    "all",
                    "Pending",
                    "Confirmed",
                    "Completed",
                    "Cancelled",
                    "PaymentPending",
                    "WorkDelivered",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setBookingFilter(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-smooth capitalize font-semibold ${
                        bookingFilter === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card"
                      }`}
                      data-ocid={`booking-filter.${s.toLowerCase()}`}
                    >
                      {s === "all"
                        ? "All"
                        : (s ?? "").replace(/([A-Z])/g, " $1").trim() || s}
                    </button>
                  ))}
                </div>

                {/* Booking list */}
                <div className="space-y-3 w-full">
                  {bookingsLoading ? (
                    <SkeletonRows count={3} />
                  ) : filteredBookings.length === 0 ? (
                    <div
                      className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border bg-card font-medium"
                      data-ocid="bookings-empty_state"
                    >
                      {bookingFilter === "all"
                        ? "No bookings found yet."
                        : `No bookings with status "${bookingFilter}".`}
                    </div>
                  ) : (
                    filteredBookings.map(({ booking, status }, i) => (
                      <AdminBookingRow
                        key={String(booking.id)}
                        booking={booking}
                        effectiveStatus={status}
                        index={i}
                        onConfirm={confirmBooking}
                        onReject={rejectBooking}
                      />
                    ))
                  )}
                </div>
              </div>
            </TabPane>

            {/* ── Payments ──────────────────────────────────────── */}
            <TabPane id="payments" label="Payments" activeTab={activeTab}>
              <AdminPaymentsPanel />
            </TabPane>

            {/* ── Users ─────────────────────────────────────────── */}
            <TabPane id="users" label="Users" activeTab={activeTab}>
              <div className="space-y-4 w-full">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    All Users
                  </h2>
                  <div className="flex items-center gap-2">
                    <LiveIndicator
                      dataUpdatedAt={usersUpdatedAt}
                      pollMs={10000}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="text-xs font-bold gap-1.5"
                      style={{
                        background: "var(--gradient-gold)",
                        color: "oklch(var(--primary-foreground))",
                      }}
                      onClick={() => setShowAddUserModal(true)}
                      data-ocid="admin-users-add_button"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add User
                    </Button>
                  </div>
                </div>
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="max-w-sm text-foreground bg-background border-border"
                  data-ocid="user-search-input"
                />
                <div className="space-y-2 w-full">
                  {usersLoading ? (
                    <SkeletonRows count={4} />
                  ) : filteredUsers.length === 0 ? (
                    <div
                      className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border bg-card font-medium"
                      data-ocid="users-empty_state"
                    >
                      {userSearch
                        ? "No users match this search."
                        : "No users registered yet."}
                    </div>
                  ) : (
                    filteredUsers.map((user, i) => (
                      <AdminUserRow
                        key={String(user.id)}
                        user={user}
                        index={i}
                        onRemove={(u) => setConfirmRemoveUser(u)}
                      />
                    ))
                  )}
                </div>
              </div>
            </TabPane>

            {/* ── Courses ───────────────────────────────────────── */}
            <TabPane id="courses" label="Courses" activeTab={activeTab}>
              <CoursesPanel onNavigateCms={() => setActiveTab("cms")} />
            </TabPane>

            {/* ── Media ─────────────────────────────────────────── */}
            <TabPane id="media" label="Media / Gallery" activeTab={activeTab}>
              <MediaPanel />
            </TabPane>

            {/* ── CMS ───────────────────────────────────────────── */}
            <TabPane id="cms" label="CMS Editor" activeTab={activeTab}>
              <CmsTab />
            </TabPane>

            {/* ── Notifications ─────────────────────────────────── */}
            <TabPane
              id="notifications"
              label="Notifications"
              activeTab={activeTab}
            >
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Notifications
                  </h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-border text-foreground font-semibold hover:bg-muted/40"
                    onClick={() =>
                      toast.success("All notifications marked as read")
                    }
                    data-ocid="mark-all-read-btn"
                  >
                    Mark all read
                  </Button>
                </div>
                {adminNotifications.length === 0 ? (
                  <div
                    className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card"
                    data-ocid="notifications-empty_state"
                  >
                    No notifications yet.
                  </div>
                ) : (
                  adminNotifications.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`w-full rounded-xl border bg-card p-4 ${notif.isRead ? "border-border/40 opacity-80" : "border-primary/30"}`}
                      data-ocid={`admin-notification-row.${i + 1}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? "bg-muted-foreground/40" : "bg-primary"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-foreground text-sm">
                              {notif.title}
                            </span>
                            <Badge
                              className={`text-[10px] border capitalize font-semibold ${NOTIF_TYPE_COLORS[notif.type] ?? ""}`}
                            >
                              {notif.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                            {formatRelTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </TabPane>

            {/* ── Feedback ──────────────────────────────────────── */}
            <TabPane id="feedback" label="Feedback" activeTab={activeTab}>
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Feedback & Reviews
                  </h2>
                </div>
                {feedbackList.length > 0 && (
                  <div className="flex items-center gap-4 mb-2 flex-wrap">
                    <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold font-display text-foreground text-sm">
                        {(
                          feedbackList.reduce(
                            (s, f) => s + Number(f.rating),
                            0,
                          ) / feedbackList.length
                        ).toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        avg rating
                      </span>
                    </div>
                    <div className="rounded-xl border border-border bg-card px-4 py-3">
                      <span className="font-bold font-display text-foreground text-sm">
                        {feedbackList.length}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                        total reviews
                      </span>
                    </div>
                  </div>
                )}
                {feedbackList.length === 0 ? (
                  <div
                    className="text-center py-16 rounded-xl border border-border bg-card"
                    data-ocid="feedback-empty_state"
                  >
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">
                      No feedback received yet.
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Feedback from clients and students will appear here.
                    </p>
                  </div>
                ) : (
                  feedbackList.map((fb, i) => {
                    const targetTypeStr = String(
                      typeof fb.targetType === "object" &&
                        fb.targetType !== null &&
                        "__kind__" in fb.targetType
                        ? (fb.targetType as Record<string, unknown>).__kind__
                        : fb.targetType,
                    ).toLowerCase();
                    return (
                      <motion.div
                        key={String(fb.id)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="w-full rounded-xl bg-card border border-border/60 p-4"
                        data-ocid={`admin-feedback-row.${i + 1}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted/50 border border-border flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                              {fb.targetId.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm">
                                {fb.targetId}
                              </p>
                              <StarRating rating={Number(fb.rating)} />
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] text-muted-foreground">
                              {typeof fb.createdAt === "bigint"
                                ? formatDateTs(fb.createdAt)
                                : ""}
                            </p>
                            <Badge
                              className={`text-[10px] border mt-0.5 font-semibold ${targetTypeStr === "service" ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30" : "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"}`}
                            >
                              {targetTypeStr}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-foreground/80 italic">
                          &ldquo;{fb.comment}&rdquo;
                        </p>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabPane>

            {/* ── History ───────────────────────────────────────── */}
            <TabPane id="history" label="History" activeTab={activeTab}>
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Activity History
                  </h2>
                  {activityLoading && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Loading…
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["all", "booking", "enrollment"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setHistoryFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-smooth capitalize font-semibold ${
                        historyFilter === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card"
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
                <div className="space-y-2 w-full">
                  {filteredActivityEvents.length === 0 ? (
                    <div
                      className="text-center py-12 rounded-xl border border-border bg-card text-muted-foreground text-sm font-medium"
                      data-ocid="history-empty_state"
                    >
                      No activity yet.
                    </div>
                  ) : (
                    filteredActivityEvents.map((e, i) => {
                      const kindStr = String(e.kind);
                      const isBooking = kindStr
                        .toLowerCase()
                        .includes("booking");
                      return (
                        <motion.div
                          key={String(e.id ?? i)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="w-full rounded-xl bg-card border border-border/60 px-4 py-3 flex items-center gap-4"
                          data-ocid={`admin-history-row.${i + 1}`}
                        >
                          <Badge
                            className={`text-[10px] border capitalize font-semibold flex-shrink-0 ${isBooking ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30" : "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"}`}
                          >
                            {kindStr?.replace(/([A-Z])/g, " $1")?.trim() || "—"}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-semibold truncate">
                              {e.title}
                            </p>
                            {e.detail && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {e.detail}
                              </p>
                            )}
                          </div>
                          {typeof e.timestamp === "bigint" && (
                            <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap flex-shrink-0">
                              {formatRelTime(e.timestamp)}
                            </span>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </TabPane>

            {/* ── Email Log ─────────────────────────────────────── */}
            <TabPane id="emails" label="Email Log" activeTab={activeTab}>
              <div className="space-y-4 w-full">
                <h2 className="font-display font-bold text-lg text-foreground">
                  Email Log
                </h2>
                <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground font-medium">
                    All system activity is tracked in real time via the History
                    tab. Email delivery is handled automatically when enabled.
                  </p>
                </div>
                <div
                  className="text-center py-16 rounded-xl border border-border bg-card"
                  data-ocid="email-log-empty_state"
                >
                  <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No email logs available.
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs mx-auto">
                    Email is disabled on this plan. Contact support to enable
                    email delivery.
                  </p>
                </div>
              </div>
            </TabPane>

            {/* ── Settings ──────────────────────────────────────── */}
            <TabPane id="settings" label="Settings" activeTab={activeTab}>
              <div className="w-full max-w-2xl space-y-5">
                <h2 className="font-display font-bold text-lg text-foreground">
                  Settings
                </h2>

                {/* Stripe Configuration */}
                <StripeConfigPanel />

                {[
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
                  {
                    label: "WhatsApp Number",
                    value: "wa.me/917338501228",
                    hint: "Opens direct chat — number never shown as text",
                  },
                ].map((setting) => (
                  <div
                    key={setting.label}
                    className="rounded-xl bg-card border border-border/60 p-4"
                    data-ocid="admin-settings-row"
                  >
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">
                      {setting.label}
                    </p>
                    <p className="text-sm font-mono font-bold text-foreground">
                      {setting.value}
                    </p>
                    {setting.hint && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {setting.hint}
                      </p>
                    )}
                  </div>
                ))}

                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                    Danger Zone
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    These actions are irreversible. Use with caution.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold"
                      onClick={() =>
                        toast.error("Clear cache — feature coming soon")
                      }
                      data-ocid="admin-clear-cache-btn"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Clear Cache
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold"
                      onClick={() =>
                        toast.error("Reset feature — feature coming soon")
                      }
                      data-ocid="admin-reset-btn"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Reset Slot Data
                    </Button>
                  </div>
                </div>
              </div>
            </TabPane>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Add User Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddUserModal && (
          <AddUserModal onClose={() => setShowAddUserModal(false)} />
        )}
      </AnimatePresence>

      {/* ── Confirm Remove User dialog ──────────────────────────────────────── */}
      <AnimatePresence>
        {confirmRemoveUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            data-ocid="admin-remove-user.dialog"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-card p-6 shadow-xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1 text-sm">
                Remove {confirmRemoveUser.name}?
              </h3>
              <p className="text-xs text-muted-foreground mb-5">
                This will suspend the user&apos;s account. Their data will be
                retained but they won&apos;t be able to sign in.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground"
                  onClick={() => setConfirmRemoveUser(null)}
                  data-ocid="admin-remove-user.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  onClick={async () => {
                    const user = confirmRemoveUser;
                    setConfirmRemoveUser(null);
                    try {
                      await deleteUserMutation.mutateAsync(user.id);
                      toast.success(`${user.name} has been removed`);
                    } catch {
                      toast.error("Failed to remove user");
                    }
                  }}
                  data-ocid="admin-remove-user.confirm_button"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Remove
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  return (
    <AdminPageBoundary>
      <AdminDashboardContent />
    </AdminPageBoundary>
  );
}
