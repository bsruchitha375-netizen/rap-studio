import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
  ExternalLink,
  GraduationCap,
  Lock,
  LogOut,
  Play,
  RefreshCw,
  Share2,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { CertificateCard } from "../components/courses/CertificateCard";
import { FeedbackForm } from "../components/dashboard/FeedbackForm";
import { LiveIndicator } from "../components/dashboard/LiveIndicator";
import { PaymentCard } from "../components/dashboard/PaymentCard";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import {
  useAddFeedback,
  useCourseProgress,
  useCourses,
  useLessonProgress,
  useLessons,
  useMyEnrollments,
  useMyNotifications,
  useMyPayments,
} from "../hooks/useBackend";
import type {
  Certificate,
  CourseEnrollment,
  CourseLessonProgress,
  FeedbackRecord,
  Lesson,
  LessonProgress,
} from "../types";

// ── Error Boundary ────────────────────────────────────────────────────────────

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
          className="flex flex-col items-center py-16 text-center rounded-2xl gap-3"
          style={{
            background: "oklch(var(--card) / 0.3)",
            border: "1px dashed oklch(var(--destructive) / 0.4)",
          }}
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

// ── Constants ─────────────────────────────────────────────────────────────────

const MODE_COLORS: Record<string, string> = {
  online: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  offline: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  hybrid: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  overdue: "bg-red-500/20 text-red-300 border-red-500/30",
  completed: "bg-primary/20 text-primary border-primary/30",
  certificate_blocked: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
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

// ── Step Marker Ring ──────────────────────────────────────────────────────────

type LessonRingStatus = "pending" | "active" | "completed";

function LessonRing({
  index,
  status,
}: { index: number; status: LessonRingStatus }) {
  const ringStyles: Record<
    LessonRingStatus,
    { outer: string; inner: string; text: string }
  > = {
    pending: {
      outer: "border-2 border-muted-foreground/30",
      inner: "bg-muted-foreground/10",
      text: "text-muted-foreground/50",
    },
    active: {
      outer: "border-2 border-accent shadow-[0_0_12px_oklch(0.68_0.2_290/0.5)]",
      inner: "bg-accent/20",
      text: "text-accent",
    },
    completed: {
      outer:
        "border-2 border-primary shadow-[0_0_10px_oklch(0.72_0.14_82/0.4)]",
      inner: "bg-primary/20",
      text: "text-primary",
    },
  };
  const s = ringStyles[status];
  return (
    <div
      className={`relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${s.outer}`}
      aria-label={`Lesson ${index + 1} ${status}`}
    >
      <div className={`absolute inset-1 rounded-full ${s.inner}`} />
      {status === "completed" ? (
        <CheckCircle2
          className="w-4 h-4 relative z-10"
          style={{ color: "oklch(0.72 0.14 82)" }}
        />
      ) : (
        <span className={`text-xs font-bold relative z-10 ${s.text}`}>
          {index + 1}
        </span>
      )}
    </div>
  );
}

// ── Lesson Row ────────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  progress,
  isCurrent,
  index,
  courseId,
}: {
  lesson: Lesson;
  progress: LessonProgress | undefined;
  isCurrent: boolean;
  index: number;
  courseId: string;
}) {
  const isCompleted = (progress?.videoWatched && progress?.quizPassed) ?? false;
  const videoWatched = progress?.videoWatched ?? false;
  const quizPassed = progress?.quizPassed ?? false;
  const quizScore = progress?.quizScore;
  const hasQuiz = lesson.quizQuestions.length > 0;

  const status: LessonRingStatus = isCompleted
    ? "completed"
    : isCurrent
      ? "active"
      : "pending";

  const borderColor = isCompleted
    ? "oklch(0.72 0.14 82 / 0.5)"
    : isCurrent
      ? "oklch(0.68 0.2 290 / 0.5)"
      : "oklch(var(--border) / 0.3)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200"
      style={{
        background: isCompleted
          ? "oklch(0.72 0.14 82 / 0.06)"
          : isCurrent
            ? "oklch(0.68 0.2 290 / 0.06)"
            : "oklch(var(--card) / 0.2)",
        borderLeft: `3px solid ${borderColor}`,
        border: `1px solid ${borderColor}`,
      }}
      data-ocid={`lesson.item.${index + 1}`}
    >
      <LessonRing index={index} status={status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-medium truncate"
            style={{
              color: isCompleted
                ? "oklch(0.72 0.14 82)"
                : isCurrent
                  ? "oklch(0.78 0.18 290)"
                  : "oklch(var(--foreground))",
            }}
          >
            {lesson.title}
          </span>
          {isCompleted && (
            <Badge
              className="text-[10px] px-1.5 py-0.5 h-auto"
              style={{
                background: "oklch(0.72 0.14 82 / 0.18)",
                color: "oklch(0.82 0.18 82)",
                borderColor: "oklch(0.72 0.14 82 / 0.35)",
              }}
            >
              ✓ Complete
            </Badge>
          )}
          {isCurrent && !isCompleted && (
            <Badge
              className="text-[10px] px-1.5 py-0.5 h-auto"
              style={{
                background: "oklch(0.68 0.2 290 / 0.18)",
                color: "oklch(0.78 0.18 290)",
                borderColor: "oklch(0.68 0.2 290 / 0.35)",
              }}
            >
              ▶ Current
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1.5">
          {/* Video status */}
          <div className="flex items-center gap-1 text-xs">
            {videoWatched ? (
              <>
                <Play
                  className="w-3 h-3"
                  style={{ color: "oklch(0.65 0.18 150)" }}
                />
                <span style={{ color: "oklch(0.65 0.18 150)" }}>
                  Video watched
                </span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 opacity-30 text-muted-foreground" />
                <span className="text-muted-foreground/50">Video pending</span>
              </>
            )}
          </div>

          {/* Quiz status */}
          {hasQuiz && (
            <div className="flex items-center gap-1 text-xs">
              {quizPassed ? (
                <>
                  <Star
                    className="w-3 h-3"
                    style={{ color: "oklch(0.72 0.14 82)" }}
                  />
                  <span style={{ color: "oklch(0.72 0.14 82)" }}>
                    Quiz passed{quizScore != null ? ` (${quizScore}%)` : ""}
                  </span>
                </>
              ) : progress?.quizScore != null && !quizPassed ? (
                <>
                  <XCircle
                    className="w-3 h-3"
                    style={{ color: "oklch(0.62 0.2 25)" }}
                  />
                  <span style={{ color: "oklch(0.62 0.2 25)" }}>
                    Quiz failed ({quizScore}%)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full border border-muted-foreground/30 inline-flex" />
                  <span className="text-muted-foreground/50">
                    Quiz not started
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Continue link */}
      {(isCurrent || (!isCompleted && videoWatched)) && (
        <a
          href={`/course/${courseId}/learn`}
          className="text-xs flex items-center gap-1 flex-shrink-0 transition-colors duration-200"
          style={{ color: "oklch(0.68 0.2 290)" }}
          data-ocid={`lesson.continue_link.${index + 1}`}
        >
          <ExternalLink className="w-3 h-3" />
          Go
        </a>
      )}
    </motion.div>
  );
}

// ── Course Progress Inline ─────────────────────────────────────────────────────

function CourseProgressSection({
  courseId,
  mode,
}: { courseId: string; mode: string }) {
  const numericId = Number.parseInt(courseId, 10);
  const isValidId = !Number.isNaN(numericId) && numericId > 0;

  const { data: courseProgress } = useCourseProgress(
    isValidId ? numericId : null,
  );
  const { data: lessonProgressList = [] } = useLessonProgress(
    isValidId ? numericId : null,
  );
  const { data: lessons = [] } = useLessons(isValidId ? numericId : null);

  if (!isValidId || mode !== "online") return null;

  const progressMap = new Map<number, LessonProgress>(
    lessonProgressList.map((lp) => [lp.lessonId, lp]),
  );

  const completedCount = courseProgress?.completedLessonIds?.length ?? 0;
  const totalLessons = lessons.length;
  const currentLessonId = courseProgress?.currentLessonId;

  if (totalLessons === 0) {
    return (
      <div className="mt-3 pt-3 border-t border-border/20">
        <p className="text-xs text-muted-foreground italic">
          No lessons added yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          <span className="font-bold" style={{ color: "oklch(0.72 0.14 82)" }}>
            {completedCount}
          </span>{" "}
          of{" "}
          <span className="text-foreground font-semibold">{totalLessons}</span>{" "}
          lessons completed
        </span>
        <a
          href={`/course/${courseId}/learn`}
          className="text-xs flex items-center gap-1 font-medium transition-colors duration-200 hover:underline"
          style={{ color: "oklch(0.68 0.2 290)" }}
          data-ocid="course-progress.learn_link"
        >
          <BookOpen className="w-3 h-3" />
          Open Course
        </a>
      </div>

      <div
        className="space-y-1.5 max-h-64 overflow-y-auto pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {lessons.map((lesson: Lesson, i: number) => {
          const prog = progressMap.get(lesson.id);
          const isCurrent = currentLessonId === lesson.id;
          return (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              progress={prog}
              isCurrent={isCurrent}
              index={i}
              courseId={courseId}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Certificate Status Section ────────────────────────────────────────────────

function CertificateStatus({
  enrollment,
  courseName,
  courseProgress,
}: {
  enrollment: CourseEnrollment;
  courseName: string;
  courseProgress: CourseLessonProgress | null | undefined;
}) {
  const certEarned = courseProgress?.certificateEarned ?? false;
  const certReady =
    (enrollment.status === "completed" &&
      enrollment.paymentStatus === "paid" &&
      !!enrollment.certificateCode) ||
    certEarned;

  if (certReady && enrollment.certificateCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 pt-3 border-t border-border/20"
        data-ocid="certificate.earned_state"
      >
        <div
          className="rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.14 82 / 0.12), oklch(0.72 0.14 82 / 0.04))",
            border: "1px solid oklch(0.72 0.14 82 / 0.4)",
            boxShadow: "0 0 20px oklch(0.72 0.14 82 / 0.15)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.72 0.14 82 / 0.2)",
                boxShadow: "0 0 12px oklch(0.72 0.14 82 / 0.4)",
              }}
            >
              <Award
                className="w-5 h-5"
                style={{ color: "oklch(0.82 0.18 82)" }}
              />
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-display font-semibold"
                style={{ color: "oklch(0.82 0.18 82)" }}
              >
                Certificate Earned!
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {courseName}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1"
              style={{
                borderColor: "oklch(0.72 0.14 82 / 0.5)",
                color: "oklch(0.82 0.18 82)",
              }}
              onClick={() =>
                window.open(`/verify/${enrollment.certificateCode}`, "_blank")
              }
              data-ocid="certificate.view_button"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1"
              style={{
                borderColor: "oklch(0.72 0.14 82 / 0.5)",
                color: "oklch(0.82 0.18 82)",
              }}
              onClick={() => {
                const url = `/verify/${enrollment.certificateCode}`;
                if (navigator.share) {
                  void navigator.share({
                    title: `Certificate — ${courseName}`,
                    url,
                  });
                } else {
                  void navigator.clipboard.writeText(
                    window.location.origin + url,
                  );
                }
              }}
              data-ocid="certificate.share_button"
            >
              <Share2 className="w-3 h-3" />
              Share
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs h-7 gap-1"
              style={{
                background: "oklch(0.72 0.14 82)",
                color: "oklch(0.08 0.01 280)",
              }}
              onClick={() =>
                window.open(`/verify/${enrollment.certificateCode}`, "_blank")
              }
              data-ocid="certificate.download_button"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Locked state
  return (
    <div
      className="mt-3 pt-3 border-t border-border/20"
      data-ocid="certificate.locked_state"
    >
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{
          background: "oklch(var(--muted) / 0.3)",
          border: "1px dashed oklch(var(--border) / 0.5)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(var(--muted) / 0.5)" }}
        >
          <Lock className="w-4 h-4 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground">
          Complete all lessons &amp; quizzes to unlock your certificate
        </p>
      </div>
    </div>
  );
}

// ── Enrolled Course Card ───────────────────────────────────────────────────────

function EnrolledCourseCard({
  enrollment,
  courseName,
  courseMode,
  courseInstructor,
  index,
  onFeedback,
  hasFeedback,
  feedbackRating,
}: {
  enrollment: CourseEnrollment;
  courseName: string;
  courseMode: string;
  courseInstructor: string;
  index: number;
  onFeedback: () => void;
  hasFeedback: boolean;
  feedbackRating?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const numericId = Number.parseInt(enrollment.courseId, 10);
  const isValidId = !Number.isNaN(numericId) && numericId > 0;
  const { data: courseProgress } = useCourseProgress(
    isValidId ? numericId : null,
  );

  const isCompleted = enrollment.status === "completed";
  const overallPercent = courseProgress?.overallPercent ?? enrollment.progress;
  const completedCount = courseProgress?.completedLessonIds?.length ?? 0;
  const isOnline = courseMode === "online";

  return (
    <motion.div
      key={enrollment.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "oklch(var(--card) / 0.45)",
        backdropFilter: "blur(12px)",
        border: "1px solid oklch(var(--border) / 0.4)",
      }}
      data-ocid={`enrolled-course.item.${index + 1}`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate text-base">
              {courseName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {courseInstructor}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Badge
              className={`text-xs border ${MODE_COLORS[courseMode] ?? ""}`}
            >
              {courseMode}
            </Badge>
            <Badge
              className={`text-xs border ${STATUS_COLORS[enrollment.status] ?? ""}`}
            >
              {(enrollment.status ?? "active").replace(/_/g, " ")}
            </Badge>
            {enrollment.paymentStatus === "paid" ? (
              <Badge className="text-xs border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                Paid
              </Badge>
            ) : (
              <Badge className="text-xs border bg-yellow-500/15 text-yellow-300 border-yellow-500/30">
                {enrollment.paymentStatus ?? "pending"}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5 items-center">
            <span className="text-muted-foreground font-medium">
              {isOnline && completedCount > 0
                ? `Lesson ${completedCount} completed`
                : "Progress"}
            </span>
            <span className="font-bold" style={{ color: "oklch(0.7 0.22 70)" }}>
              {overallPercent}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden relative"
            style={{ background: "oklch(var(--muted) / 0.5)" }}
          >
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

        {/* Action row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isOnline && (
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setExpanded((e) => !e)}
                data-ocid={`course.expand_lessons_button.${index + 1}`}
                aria-expanded={expanded}
              >
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {expanded ? "Hide lessons" : "Show lesson progress"}
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {isCompleted && !hasFeedback && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-7"
                style={{
                  borderColor: "oklch(0.7 0.22 70 / 0.4)",
                  color: "oklch(0.7 0.22 70)",
                }}
                onClick={onFeedback}
                data-ocid={`course.feedback_button.${index + 1}`}
              >
                <Star className="w-3 h-3" />
                Leave Feedback ★
              </Button>
            )}
            {isCompleted && hasFeedback && feedbackRating && (
              <div
                className="flex items-center gap-1.5 text-xs"
                data-ocid="student-feedback.success_state"
              >
                {renderStars(feedbackRating)}
                <span
                  className="font-medium"
                  style={{ color: "oklch(0.65 0.18 150)" }}
                >
                  Reviewed!
                </span>
              </div>
            )}
            {!isCompleted && (
              <Button
                type="button"
                size="sm"
                className="text-xs gap-1.5 font-medium"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.2 290 / 0.9), oklch(0.58 0.22 295 / 0.9))",
                  color: "oklch(0.99 0.002 290)",
                }}
                onClick={() => {
                  window.location.href = `/course/${enrollment.courseId}/learn`;
                }}
                data-ocid={`course.continue_button.${index + 1}`}
              >
                <Play className="w-3 h-3" />
                Continue Learning
              </Button>
            )}
            {isCompleted && (
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
                <BookOpen className="w-3 h-3" />
                View Course
              </Button>
            )}
          </div>
        </div>

        {/* Certificate status */}
        <CertificateStatus
          enrollment={enrollment}
          courseName={courseName}
          courseProgress={courseProgress}
        />
      </div>

      {/* Expandable lesson checklist — only for online courses */}
      <AnimatePresence>
        {expanded && isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            data-ocid={`course.lessons_panel.${index + 1}`}
          >
            <div
              className="px-5 pb-5"
              style={{ borderTop: "1px solid oklch(var(--border) / 0.25)" }}
            >
              <CourseProgressSection
                courseId={enrollment.courseId}
                mode={courseMode}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    dataUpdatedAt: paymentsUpdatedAt,
  } = useMyPayments();
  const { data: notifications = [] } = useMyNotifications();
  const addFeedbackMutation = useAddFeedback();

  const [activeTab, setActiveTab] = useState("courses");
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
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  async function handleFeedbackSubmit(
    enrollmentId: string,
    courseId: string,
    feedback: Omit<FeedbackRecord, "id" | "userId" | "createdAt">,
  ) {
    try {
      await addFeedbackMutation.mutateAsync({
        targetId: courseId,
        targetType: "Course",
        rating: feedback.rating,
        comment: feedback.comment,
      });
    } catch {
      // record locally so UI doesn't look broken
    }
    setSubmittedFeedback((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...feedback,
        id: `fb-${enrollmentId}`,
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
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "oklch(0.68 0.2 290 / 0.7)" }}
                  >
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
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Welcome back,{" "}
                  <span style={{ color: "oklch(0.78 0.18 290)" }}>{name}</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track your learning journey at RAP Integrated Studio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Summary badges */}
              {enrolledCourses.length > 0 && (
                <div className="hidden sm:flex gap-3">
                  <div
                    className="text-center px-3 py-2 rounded-lg"
                    style={{
                      background: "oklch(0.68 0.2 290 / 0.1)",
                      border: "1px solid oklch(0.68 0.2 290 / 0.2)",
                    }}
                  >
                    <div
                      className="text-lg font-bold"
                      style={{ color: "oklch(0.78 0.18 290)" }}
                    >
                      {enrolledCourses.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Enrolled
                    </div>
                  </div>
                  {certificates.length > 0 && (
                    <div
                      className="text-center px-3 py-2 rounded-lg"
                      style={{
                        background: "oklch(0.72 0.14 82 / 0.1)",
                        border: "1px solid oklch(0.72 0.14 82 / 0.2)",
                      }}
                    >
                      <div
                        className="text-lg font-bold"
                        style={{ color: "oklch(0.82 0.18 82)" }}
                      >
                        {certificates.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Certs
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-border/40 hover:border-destructive/40 hover:text-destructive"
                onClick={handleLogout}
                data-ocid="student-dashboard.logout_button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
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
            <TabsList
              className="border border-border/50"
              style={{ background: "oklch(var(--card) / 0.5)" }}
            >
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
                value="notifications"
                className="gap-2"
                data-ocid="student-dashboard.notifications.tab"
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

            {activeTab === "courses" && (
              <LiveIndicator
                updatedAt={enrollmentsUpdatedAt}
                pollMs={5000}
                label="courses"
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

          {/* ── Courses Tab ────────────────────────────────────────────────── */}
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
                      className="flex flex-col items-center py-16 text-center rounded-2xl gap-3"
                      style={{
                        background: "oklch(var(--card) / 0.3)",
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
                      className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl"
                      style={{
                        background: "oklch(var(--card) / 0.3)",
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
                        <GraduationCap
                          className="w-8 h-8"
                          style={{ color: "oklch(0.7 0.18 290)" }}
                        />
                      </div>
                      <p className="text-lg font-display font-semibold text-foreground mb-2">
                        No enrollments yet
                      </p>
                      <p className="text-sm opacity-60 mb-6">
                        Browse courses to start your photography journey.
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
                      {enrolledCourses.map(({ enrollment, course }, i) => {
                        const fb = submittedFeedback[enrollment.id];
                        return (
                          <EnrolledCourseCard
                            key={enrollment.id}
                            enrollment={enrollment}
                            courseName={course?.title ?? enrollment.courseId}
                            courseMode={course?.mode ?? "offline"}
                            courseInstructor={
                              course?.instructor ?? "RAP Studio"
                            }
                            index={i}
                            onFeedback={() => setFeedbackOpen(enrollment.id)}
                            hasFeedback={!!fb}
                            feedbackRating={fb?.rating}
                          />
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabErrorBoundary>
          </TabsContent>

          {/* ── Payments Tab ───────────────────────────────────────────────── */}
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
                      data-ocid="student-payments.empty_state"
                    >
                      <CreditCard className="w-14 h-14 mb-4 opacity-30" />
                      <p className="text-lg font-display font-semibold text-foreground mb-1">
                        No payments yet
                      </p>
                      <p className="text-sm opacity-60 mb-6">
                        Your enrollment payment history will appear here.
                      </p>
                      <a
                        href="/courses"
                        className="btn-primary-luxury text-sm px-6 py-2"
                        data-ocid="student-payments.empty_state.primary_button"
                      >
                        Browse Courses
                      </a>
                    </div>
                  ) : (
                    <div
                      className="space-y-3"
                      data-ocid="student-payments.list"
                    >
                      {payments.map((payment, i) => (
                        <PaymentCard
                          key={payment.id}
                          payment={payment}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabErrorBoundary>
          </TabsContent>

          {/* ── Certificates Tab ───────────────────────────────────────────── */}
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
                      className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl"
                      style={{
                        background: "oklch(var(--card) / 0.3)",
                        border: "1px dashed oklch(var(--border) / 0.5)",
                      }}
                      data-ocid="certificates.empty_state"
                    >
                      <div
                        className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
                        style={{
                          background: "oklch(0.72 0.14 82 / 0.1)",
                          border: "1px solid oklch(0.72 0.14 82 / 0.3)",
                        }}
                      >
                        <Award className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-display font-semibold text-foreground mb-2">
                        No certificates yet
                      </p>
                      <p className="text-sm opacity-60 mb-2 max-w-xs text-center">
                        Complete a course and make full payment to earn your
                        certificate with QR verification.
                      </p>
                      <a
                        href="/courses"
                        className="btn-primary-luxury text-sm px-6 py-2 mt-4"
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

          {/* ── Notifications Tab ──────────────────────────────────────────── */}
          <TabsContent value="notifications">
            <TabErrorBoundary label="notifications">
              <AnimatePresence mode="wait">
                <motion.div
                  key="notifs"
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
                      data-ocid="student-notifications.empty_state"
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
                          key={String(n.id)}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-xl p-4"
                          style={{
                            background: n.isRead
                              ? "oklch(var(--card) / 0.4)"
                              : "oklch(0.68 0.2 290 / 0.06)",
                            border: n.isRead
                              ? "1px solid oklch(var(--border) / 0.4)"
                              : "1px solid oklch(0.68 0.2 290 / 0.3)",
                          }}
                          data-ocid={`student-notification.item.${i + 1}`}
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackOpen &&
          (() => {
            const enrollment = enrollments.find(
              (e) => String(e.id) === feedbackOpen,
            );
            const courseId = enrollment
              ? String(enrollment.courseId)
              : feedbackOpen;
            return (
              <FeedbackForm
                key={feedbackOpen}
                targetId={courseId}
                targetType="Course"
                onSubmit={(fb) =>
                  handleFeedbackSubmit(feedbackOpen, courseId, fb)
                }
                onClose={() => setFeedbackOpen(null)}
              />
            );
          })()}
      </AnimatePresence>
    </Layout>
  );
}
