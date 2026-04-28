import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CreditCard,
  Edit2,
  GraduationCap,
  LogOut,
  Moon,
  Play,
  RefreshCw,
  Save,
  Sun,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { UserRole } from "../backend";
import { CertificateCard } from "../components/courses/CertificateCard";
import { LiveIndicator } from "../components/dashboard/LiveIndicator";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import {
  useCourseProgress,
  useCourses,
  useMyEnrollments,
  useMyPayments,
} from "../hooks/useBackend";
import type {
  Certificate,
  CourseEnrollment,
  CourseLessonProgress as FrontendCourseLessonProgress,
  PaymentOrder,
} from "../types";

// ── Error Boundary ─────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
}
interface ErrorBoundaryProps {
  children: ReactNode;
  label?: string;
}

class TabErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[TabErrorBoundary:${this.props.label}]`, error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center py-16 text-center rounded-2xl gap-3 bg-card/30"
          style={{ border: "1px dashed oklch(var(--destructive) / 0.4)" }}
          data-ocid="tab.error_state"
        >
          <AlertTriangle className="w-10 h-10 text-destructive opacity-70" />
          <p className="text-foreground font-semibold">
            Unable to load {this.props.label ?? "data"}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Something went wrong. Please refresh the page.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-border/40"
            onClick={() => this.setState({ hasError: false })}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Course gradients ───────────────────────────────────────────────────────────

const COURSE_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.28 0.08 280), oklch(0.38 0.14 300))",
  "linear-gradient(135deg, oklch(0.22 0.06 240), oklch(0.35 0.12 260))",
  "linear-gradient(135deg, oklch(0.25 0.10 310), oklch(0.38 0.16 330))",
  "linear-gradient(135deg, oklch(0.30 0.08 180), oklch(0.40 0.12 200))",
  "linear-gradient(135deg, oklch(0.28 0.10 60), oklch(0.38 0.14 80))",
];

function CourseThumbnail({
  image,
  title,
  index,
}: { image?: string; title: string; index: number }) {
  const [imgError, setImgError] = useState(false);
  const gradient = COURSE_GRADIENTS[index % COURSE_GRADIENTS.length];
  if (image && !imgError) {
    return (
      <div className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
  return (
    <div
      className="w-20 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
      style={{ background: gradient }}
      aria-hidden="true"
    >
      <BookOpen className="w-6 h-6 opacity-60 text-white" />
    </div>
  );
}

function getModeBadgeCls(mode: string) {
  if (mode === "online")
    return "bg-teal-500/20 text-teal-700 border-teal-500/30 dark:text-teal-300";
  if (mode === "offline")
    return "bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-300";
  return "bg-violet-500/20 text-violet-700 border-violet-500/30 dark:text-violet-300";
}

// ── Enrolled Course Card ───────────────────────────────────────────────────────

function EnrolledCourseCard({
  enrollment,
  courseName,
  courseMode,
  courseImage,
  index,
}: {
  enrollment: CourseEnrollment;
  courseName: string;
  courseMode: string;
  courseImage?: string;
  index: number;
}) {
  const numericId = Number.parseInt(enrollment.courseId, 10);
  const isValidId = !Number.isNaN(numericId) && numericId > 0;
  const { data: courseProgress } = useCourseProgress(
    isValidId ? numericId : null,
  );

  const isCompleted = enrollment.status === "completed";
  const overallPercent =
    (courseProgress as FrontendCourseLessonProgress | null)?.overallPercent ??
    enrollment.progress ??
    0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden transition-all duration-300 bg-card border border-border/40"
      style={{ backdropFilter: "blur(12px)" }}
      data-ocid={`enrolled-course.item.${index + 1}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <CourseThumbnail
            image={courseImage}
            title={courseName}
            index={index}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground text-base leading-tight mb-1.5 truncate">
              {courseName}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={`text-xs border ${getModeBadgeCls(courseMode)}`}
              >
                {courseMode}
              </Badge>
              {isCompleted && (
                <Badge className="text-xs border bg-primary/15 text-primary border-primary/30">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5 items-center">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-bold text-primary">{overallPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-muted/50">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.72 0.14 82), oklch(0.78 0.18 82))",
                boxShadow:
                  overallPercent > 0
                    ? "0 0 8px oklch(0.72 0.14 82 / 0.5)"
                    : "none",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${overallPercent}%` }}
              transition={{
                duration: 1.2,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          {!isCompleted ? (
            <Button
              type="button"
              size="sm"
              className="text-xs gap-1.5 font-medium btn-primary-luxury"
              onClick={() => {
                window.location.href = `/course/${enrollment.courseId}/learn`;
              }}
              data-ocid={`course.continue_button.${index + 1}`}
            >
              <Play className="w-3 h-3" /> Continue Learning
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs gap-1 h-7 border-border/40"
              onClick={() => {
                window.location.href = `/course/${enrollment.courseId}/learn`;
              }}
              data-ocid={`course.view_button.${index + 1}`}
            >
              <BookOpen className="w-3 h-3" /> View Course
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileTab({
  name,
  email,
  phone,
  role,
}: { name: string; email: string; phone: string; role: string }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editPhone, setEditPhone] = useState(phone);
  const [saving, setSaving] = useState(false);
  const { actor } = useActor(createActor);

  async function handleSave() {
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }
    setSaving(true);
    try {
      const roleVariant =
        role === "student"
          ? UserRole.Student
          : role === "staff"
            ? UserRole.Staff
            : role === "receptionist"
              ? UserRole.Receptionist
              : UserRole.Client;
      await actor.saveCallerUserProfile(
        editName.trim(),
        editPhone.trim(),
        roleVariant,
      );
      toast.success("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      console.error("[ProfileTab] saveCallerUserProfile error", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
      data-ocid="student-profile.panel"
    >
      <div
        className="rounded-2xl p-6 space-y-5 bg-card border border-border/40"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="flex flex-col items-center gap-3 pb-4 border-b border-border/20">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-display flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.68 0.2 290 / 0.25), oklch(0.68 0.2 290 / 0.1))",
              border: "2px solid oklch(0.68 0.2 290 / 0.5)",
              color: "oklch(0.68 0.2 290)",
            }}
          >
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || <User className="w-8 h-8" />}
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-foreground text-lg">
              {name}
            </p>
            <Badge className="text-xs border mt-1 capitalize bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300">
              {role}
            </Badge>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Full Name
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-background border-input text-foreground"
                data-ocid="student-profile.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Phone Number
              </Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="bg-background border-input text-foreground"
                data-ocid="student-profile.phone_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Email
              </Label>
              <Input
                value={email}
                disabled
                className="bg-muted/20 border-border/20 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground/60">
                Email cannot be changed
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                className="flex-1 gap-1.5 btn-primary-luxury"
                onClick={() => void handleSave()}
                disabled={saving}
                data-ocid="student-profile.save_button"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 border-border/40"
                onClick={() => {
                  setEditName(name);
                  setEditPhone(phone);
                  setEditing(false);
                }}
                data-ocid="student-profile.cancel_button"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: "Full Name", value: name || "—" },
              { label: "Email", value: email || "—" },
              { label: "Phone", value: phone || "—" },
              {
                label: "Role",
                value: role
                  ? role.charAt(0).toUpperCase() + role.slice(1)
                  : "Student",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-border/15 last:border-0"
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-sm text-foreground font-medium text-right">
                  {value}
                </span>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full gap-2 mt-2 border-border/40"
              onClick={() => setEditing(true)}
              data-ocid="student-profile.edit_button"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Payments Tab ───────────────────────────────────────────────────────────────

function PaymentsTab({ payments }: { payments: PaymentOrder[] }) {
  if (payments.length === 0) {
    return (
      <div
        className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl bg-card/30"
        style={{ border: "1px dashed oklch(var(--border) / 0.5)" }}
        data-ocid="payments.empty_state"
      >
        <div className="w-20 h-20 rounded-full mb-5 flex items-center justify-center bg-primary/10 border border-primary/30">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg font-display font-semibold text-foreground mb-2">
          No payments yet
        </p>
        <p className="text-sm opacity-60 max-w-xs text-center">
          Certificate payments will appear here after you complete a course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="payments.list">
      {payments.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/40"
          style={{ backdropFilter: "blur(12px)" }}
          data-ocid={`payment.item.${i + 1}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-semibold truncate">
              {String(p.paymentType ?? "Payment")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {p.referenceId ?? "—"} ·{" "}
              {new Date(Number(p.createdAt) / 1_000_000).toLocaleDateString(
                "en-IN",
                { year: "numeric", month: "short", day: "numeric" },
              )}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-4 space-y-1">
            <p className="text-base font-bold text-primary">
              ₹{p.amount.toLocaleString("en-IN")}
            </p>
            <Badge
              className={`text-[10px] border ${
                p.status === "paid"
                  ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                  : p.status === "failed"
                    ? "bg-destructive/20 text-destructive border-destructive/30"
                    : "bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-300"
              }`}
            >
              {p.status}
            </Badge>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Theme Toggle ──────────────────────────────────────────────────────────────

function ThemeToggleBtn() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs border-border/40"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      data-ocid="student-dashboard.theme_toggle"
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

// ── Main Component ────────────────────────────────────────────────────────────

export function StudentDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: profile } = useUserProfile();
  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
    dataUpdatedAt: enrollmentsUpdatedAt,
  } = useMyEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: payments = [] } = useMyPayments();
  const [activeTab, setActiveTab] = useState("courses");
  const navigate = useNavigate();

  const name = profile?.name ?? user?.name ?? "there";
  const email = profile?.email ?? user?.email ?? "";
  const phone = profile?.phone ?? "";
  const role = profile?.role ?? user?.role ?? "student";

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const enrolledCourses = enrollments.map((e) => ({
    enrollment: e,
    course: courses.find((c) => String(c.id) === String(e.courseId)),
  }));

  const certificates: Certificate[] = enrollments
    .filter(
      (e) =>
        e.status === "completed" &&
        e.certificateCode &&
        e.paymentStatus === "paid",
    )
    .map((e) => ({
      code: e.certificateCode ?? "",
      studentName: profile?.name ?? "Student",
      courseName:
        courses.find((c) => String(c.id) === String(e.courseId))?.title ??
        "Course",
      issuedAt: e.completedAt ?? e.enrolledAt,
      isValid: true,
    }));

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
            "linear-gradient(135deg, oklch(0.10 0.018 280), oklch(0.16 0.028 285), oklch(0.12 0.022 290))",
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
                    "linear-gradient(135deg, oklch(0.68 0.2 290 / 0.25), oklch(0.68 0.2 290 / 0.1))",
                  border: "2px solid oklch(0.68 0.2 290 / 0.5)",
                  color: "oklch(0.78 0.18 290)",
                  boxShadow: "0 0 16px oklch(0.68 0.2 290 / 0.2)",
                }}
                aria-label="Student avatar"
              >
                {initials || <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-xs uppercase tracking-widest text-violet-300/70">
                    Student Portal
                  </p>
                  <Badge
                    className="text-[10px] border"
                    style={{
                      background: "oklch(0.68 0.2 290 / 0.15)",
                      color: "oklch(0.78 0.18 290)",
                      borderColor: "oklch(0.68 0.2 290 / 0.35)",
                    }}
                  >
                    Student
                  </Badge>
                </div>
                <h1 className="text-2xl font-display font-bold text-white">
                  Welcome back, <span className="text-violet-300">{name}</span>
                </h1>
                <p className="text-xs text-white/60 mt-0.5">
                  Track your learning journey at RAP Integrated Studio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {enrolledCourses.length > 0 && (
                <div className="hidden sm:flex gap-3">
                  <div className="text-center px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="text-lg font-bold text-violet-300">
                      {enrolledCourses.length}
                    </div>
                    <div className="text-[10px] text-white/50">Enrolled</div>
                  </div>
                  {certificates.length > 0 && (
                    <div className="text-center px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-lg font-bold text-primary">
                        {certificates.length}
                      </div>
                      <div className="text-[10px] text-white/50">Certs</div>
                    </div>
                  )}
                </div>
              )}
              <ThemeToggleBtn />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-white/20 text-white/80 hover:border-destructive/40 hover:text-destructive"
                onClick={handleLogout}
                data-ocid="student-dashboard.logout_button"
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
          data-ocid="student-dashboard.tab"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <TabsList className="border border-border/50 bg-card/50">
              <TabsTrigger
                value="courses"
                className="gap-2"
                data-ocid="student-dashboard.courses.tab"
              >
                <BookOpen className="w-4 h-4" />
                My Courses
                {enrolledCourses.length > 0 && (
                  <Badge className="ml-1 text-xs bg-primary/20 text-primary border-0 h-4 px-1">
                    {enrolledCourses.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="certificates"
                className="gap-2"
                data-ocid="student-dashboard.certificates.tab"
              >
                <Award className="w-4 h-4" />
                Certificates
                {certificates.length > 0 && (
                  <Badge className="ml-1 text-xs bg-primary/20 text-primary border-0 h-4 px-1">
                    {certificates.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="gap-2"
                data-ocid="student-dashboard.payments.tab"
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
                value="profile"
                className="gap-2"
                data-ocid="student-dashboard.profile.tab"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>
            {activeTab === "courses" && (
              <LiveIndicator
                updatedAt={enrollmentsUpdatedAt}
                pollMs={5000}
                label="courses"
              />
            )}
          </div>

          {/* ── My Courses Tab ── */}
          <TabsContent value="courses">
            <TabErrorBoundary label="courses">
              <AnimatePresence mode="wait">
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {enrollmentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-2xl" />
                      ))}
                    </div>
                  ) : enrollmentsError ? (
                    <div
                      className="flex flex-col items-center py-16 text-center rounded-2xl gap-3 bg-card/30"
                      style={{
                        border: "1px dashed oklch(var(--destructive) / 0.4)",
                      }}
                      data-ocid="courses.error_state"
                    >
                      <AlertTriangle className="w-10 h-10 text-destructive opacity-70" />
                      <p className="text-foreground font-semibold">
                        Unable to load courses
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please refresh the page to try again.
                      </p>
                    </div>
                  ) : enrolledCourses.length === 0 ? (
                    <div
                      className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl bg-card/30"
                      style={{
                        border: "1px dashed oklch(var(--border) / 0.5)",
                      }}
                      data-ocid="courses.empty_state"
                    >
                      <div
                        className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
                        style={{
                          background: "oklch(0.68 0.2 290 / 0.1)",
                          border: "1px solid oklch(0.68 0.2 290 / 0.3)",
                        }}
                      >
                        <GraduationCap className="w-8 h-8 text-violet-400" />
                      </div>
                      <p className="text-lg font-display font-semibold text-foreground mb-2">
                        No courses enrolled yet
                      </p>
                      <p className="text-sm text-muted-foreground mb-6 max-w-xs text-center">
                        Browse our courses — enrollment is free, start learning
                        today.
                      </p>
                      <a
                        href="/courses"
                        className="btn-primary-luxury text-sm px-6 py-2"
                        data-ocid="courses.empty_state.primary_button"
                      >
                        Browse Courses
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4" data-ocid="courses.list">
                      {enrolledCourses.map(({ enrollment, course }, i) => (
                        <EnrolledCourseCard
                          key={enrollment.id}
                          enrollment={enrollment}
                          courseName={
                            course?.title ?? `Course #${enrollment.courseId}`
                          }
                          courseMode={course?.mode ?? "offline"}
                          courseImage={course?.thumbnail ?? course?.image}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabErrorBoundary>
          </TabsContent>

          {/* ── Certificates Tab ── */}
          <TabsContent value="certificates">
            <TabErrorBoundary label="certificates">
              <AnimatePresence mode="wait">
                <motion.div
                  key="certs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {certificates.length === 0 ? (
                    <div
                      className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl bg-card/30"
                      style={{
                        border: "1px dashed oklch(var(--border) / 0.5)",
                      }}
                      data-ocid="certificates.empty_state"
                    >
                      <div className="w-20 h-20 rounded-full mb-5 flex items-center justify-center bg-primary/10 border border-primary/30">
                        <Award className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-display font-semibold text-foreground mb-2">
                        No certificates yet
                      </p>
                      <p className="text-sm text-muted-foreground mb-2 max-w-xs text-center">
                        Complete all lessons in a course to earn your
                        certificate.
                      </p>
                      <p className="text-xs text-muted-foreground/50 mb-6 max-w-xs text-center">
                        Certificate is issued after course completion + payment
                        confirmation.
                      </p>
                      <a
                        href="/courses"
                        className="btn-primary-luxury text-sm px-6 py-2"
                        data-ocid="certificates.empty_state.primary_button"
                      >
                        Browse Courses
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {certificates.map((cert) => (
                        <CertificateCard key={cert.code} certificate={cert} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabErrorBoundary>
          </TabsContent>

          {/* ── Payments Tab ── */}
          <TabsContent value="payments">
            <TabErrorBoundary label="payments">
              <AnimatePresence mode="wait">
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentsTab payments={payments} />
                </motion.div>
              </AnimatePresence>
            </TabErrorBoundary>
          </TabsContent>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile">
            <TabErrorBoundary label="profile">
              <AnimatePresence mode="wait">
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileTab
                    name={name}
                    email={email}
                    phone={phone}
                    role={String(role)}
                  />
                </motion.div>
              </AnimatePresence>
            </TabErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
