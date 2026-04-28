import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import { useAuth } from "../../hooks/useAuth";
import {
  useCourses,
  useEnrollCourse,
  useMyEnrollments,
} from "../../hooks/useBackend";
import type { Course, CourseMode } from "../../types";

interface EnrollmentModalProps {
  course: Course;
  open: boolean;
  onClose: () => void;
}

const MODE_STYLES: Record<CourseMode, { label: string; cls: string }> = {
  online: {
    label: "Online",
    cls: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  offline: {
    label: "Offline",
    cls: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  hybrid: {
    label: "Hybrid",
    cls: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
};

const WHAT_YOU_GET = [
  "Lifetime course access",
  "Step-by-step video lessons",
  "Quizzes per lesson to test your knowledge",
  "Certificate of completion (after payment)",
  "Expert instructor support",
];

type EnrollStep = "details" | "enrolling" | "success" | "error";

export function EnrollmentModal({
  course,
  open,
  onClose,
}: EnrollmentModalProps) {
  const { isAuthenticated, isActorReady } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const enrollCourseMutation = useEnrollCourse();
  const { refetch: refetchEnrollments } = useMyEnrollments();
  // Fetch backend courses to resolve numeric ID for static-data courses
  const { data: backendCourses = [] } = useCourses();
  const [step, setStep] = useState<EnrollStep>("details");
  const [errorMessage, setErrorMessage] = useState("");
  const [actorWaiting, setActorWaiting] = useState(false);
  const [learnCourseId, setLearnCourseId] = useState<string>(String(course.id));

  // Reset step when modal opens
  useEffect(() => {
    if (open) {
      setStep("details");
      setErrorMessage("");
      setActorWaiting(false);
      setLearnCourseId(String(course.id));
    }
  }, [open, course.id]);

  // Resolve the backend numeric ID:
  // If course.id is already numeric (from backend), use it directly.
  // If it's a static string ID like "photo-fundamentals", look up by title.
  const resolvedBackendId = useMemo(() => {
    const direct = Number.parseInt(String(course.id), 10);
    if (!Number.isNaN(direct) && direct > 0) return direct;
    // Match by title against backend courses
    const match = backendCourses.find(
      (bc) =>
        bc.title?.toLowerCase().trim() ===
        (course.title ?? "").toLowerCase().trim(),
    );
    if (match) {
      const matchId = Number.parseInt(String(match.id), 10);
      if (!Number.isNaN(matchId) && matchId > 0) return matchId;
    }
    return null;
  }, [course.id, course.title, backendCourses]);

  const isActorAvailable = !!actor && !isFetching && isActorReady;
  const modeStyle = MODE_STYLES[course.mode] ?? MODE_STYLES.online;

  // ── Free enrollment: no payment required ──────────────────────────────────
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Please register or log in to enroll.");
      return;
    }

    // Wait for actor if not ready
    if (!isActorAvailable) {
      setActorWaiting(true);
      let waited = 0;
      while (waited < 10000) {
        await new Promise((r) => setTimeout(r, 500));
        waited += 500;
        if (actor && !isFetching) break;
      }
      setActorWaiting(false);
      if (!actor) {
        toast.error("Backend not ready. Please try again in a moment.");
        return;
      }
    }

    setErrorMessage("");
    setStep("enrolling");

    try {
      // Use resolvedBackendId; if still null, courses haven't loaded from backend
      const courseIdNum = resolvedBackendId;
      if (courseIdNum === null || courseIdNum <= 0) {
        throw new Error(
          "Course not yet synced with backend. Please wait a moment and try again.",
        );
      }
      const enrolled = await enrollCourseMutation.mutateAsync(courseIdNum);
      // After enrollment, use the backend enrollment's courseId for the learn URL
      const backendCourseId = enrolled?.courseId ?? String(courseIdNum);
      setLearnCourseId(String(backendCourseId));
      // Refetch enrollments so learn page immediately sees the enrollment
      await refetchEnrollments();
      setStep("success");
      toast.success(
        `You're enrolled in "${course.title ?? "course"}"! Start learning now.`,
        { duration: 4000 },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      // Idempotent: already enrolled = treat as success
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists") ||
        msg.toLowerCase().includes("duplicate")
      ) {
        // Use resolved ID for navigation even in idempotent case
        if (resolvedBackendId) setLearnCourseId(String(resolvedBackendId));
        await refetchEnrollments();
        setStep("success");
        return;
      }
      setErrorMessage(msg || "Could not enroll. Please try again.");
      setStep("error");
      toast.error("Enrollment failed. Please try again.");
    }
  };

  const handleClose = () => {
    setStep("details");
    setErrorMessage("");
    setActorWaiting(false);
    onClose();
  };

  const handleStartLearning = () => {
    window.location.href = `/course/${learnCourseId}/learn`;
  };

  const isProcessing =
    enrollCourseMutation.isPending || step === "enrolling" || actorWaiting;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="bg-card border-border/60 max-w-md w-full p-0 overflow-hidden"
        data-ocid="enrollment.dialog"
      >
        {/* Details step */}
        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="px-6 pt-6 pb-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(var(--primary) / 0.12), oklch(var(--accent) / 0.06))",
              }}
            >
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-foreground font-display text-lg leading-tight">
                      {course.title ?? "Course"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge className={`text-xs border ${modeStyle.cls}`}>
                        {modeStyle.label}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock className="w-3 h-3" />
                        {course.duration ?? "Flexible"}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* FREE enrollment banner */}
              <div
                className="flex items-center gap-3 rounded-xl border px-4 py-3"
                style={{
                  background: "oklch(var(--primary) / 0.08)",
                  borderColor: "oklch(var(--primary) / 0.3)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{
                    background: "var(--gradient-gold)",
                    color: "oklch(var(--primary-foreground))",
                  }}
                >
                  FREE
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Enroll for free — start learning today
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Certificate available after course completion + payment
                  </p>
                </div>
              </div>

              {/* What's included */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  What you'll get
                </p>
                <ul className="space-y-1.5">
                  {WHAT_YOU_GET.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-foreground/80"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="bg-border/40" />

              {/* Instructor */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                  <p className="text-sm font-semibold text-foreground">
                    {course.instructor ?? "RAP Studio"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Award className="w-3 h-3 text-primary" />
                    Certificate fee
                  </p>
                  <p className="text-sm font-bold text-primary">
                    ₹{course.price > 0 ? course.price : 999}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    After completion
                  </p>
                </div>
              </div>

              {/* Actor / backend loading banner */}
              {isAuthenticated && !isActorAvailable && (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs border"
                  style={{
                    background: "oklch(var(--primary) / 0.06)",
                    borderColor: "oklch(var(--primary) / 0.2)",
                  }}
                >
                  <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    Connecting to backend… button will unlock shortly.
                  </span>
                </div>
              )}

              {/* Backend course not found banner */}
              {isAuthenticated &&
                isActorAvailable &&
                resolvedBackendId === null && (
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs border"
                    style={{
                      background: "oklch(var(--primary) / 0.06)",
                      borderColor: "oklch(var(--primary) / 0.2)",
                    }}
                  >
                    <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
                    <span className="text-muted-foreground">
                      Loading course data… please wait.
                    </span>
                  </div>
                )}

              {/* Auth gate or Enroll button */}
              {!isAuthenticated ? (
                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{
                    background: "oklch(0.68 0.2 290 / 0.06)",
                    borderColor: "oklch(0.68 0.2 290 / 0.3)",
                  }}
                  data-ocid="enrollment.auth_gate"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Login required to enroll
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create a free student account or sign in to start learning.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={handleClose}
                      data-ocid="enrollment.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs font-semibold"
                      style={{
                        background: "var(--gradient-gold)",
                        color: "oklch(var(--primary-foreground))",
                      }}
                      onClick={() => {
                        window.location.href = `/login?return=${encodeURIComponent(window.location.pathname)}`;
                      }}
                      data-ocid="enrollment.login_button"
                    >
                      Login / Register →
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full h-12 text-base font-bold gap-2"
                  style={{
                    background: isProcessing
                      ? undefined
                      : "var(--gradient-gold)",
                    color: isProcessing
                      ? undefined
                      : "oklch(var(--primary-foreground))",
                    boxShadow: isProcessing
                      ? "none"
                      : "0 4px 20px oklch(var(--primary) / 0.28)",
                  }}
                  onClick={() => void handleEnroll()}
                  disabled={
                    isProcessing ||
                    !isActorAvailable ||
                    resolvedBackendId === null
                  }
                  data-ocid="enrollment.submit_button"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {actorWaiting ? "Connecting…" : "Enrolling…"}
                    </>
                  ) : (
                    "Enroll Free — Start Learning"
                  )}
                </Button>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                Free enrollment · No credit card required
              </p>
            </div>
          </motion.div>
        )}

        {/* Enrolling state */}
        {step === "enrolling" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center px-8 py-12 gap-5"
            data-ocid="enrollment.loading_state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-display text-foreground font-bold">
                Enrolling You…
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                Securing your spot in{" "}
                <span className="text-foreground font-semibold">
                  {course.title ?? "this course"}
                </span>
                .
              </p>
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {step === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center px-8 py-10 gap-4"
            data-ocid="enrollment.error_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "oklch(var(--destructive) / 0.1)" }}
            >
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-xl font-display text-foreground font-bold">
                Enrollment Failed
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                {errorMessage || "An error occurred. Please try again."}
              </p>
            </div>
            {errorMessage.toLowerCase().includes("not authorized") ||
            errorMessage.toLowerCase().includes("not authenticated") ? (
              <Button
                className="font-semibold px-6"
                style={{
                  background: "var(--gradient-gold)",
                  color: "oklch(var(--primary-foreground))",
                }}
                onClick={() => {
                  window.location.href = `/login?return=${encodeURIComponent(window.location.pathname)}`;
                }}
                data-ocid="enrollment.login_button"
              >
                Sign In to Enroll
              </Button>
            ) : (
              <div className="flex gap-3 w-full mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("details")}
                  data-ocid="enrollment.cancel_button"
                >
                  Back
                </Button>
                <Button
                  className="flex-1 font-semibold"
                  style={{
                    background: "var(--gradient-gold)",
                    color: "oklch(var(--primary-foreground))",
                  }}
                  onClick={() => void handleEnroll()}
                  data-ocid="enrollment.confirm_button"
                >
                  Try Again
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Success state */}
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="flex flex-col items-center text-center px-8 py-10 gap-4"
            data-ocid="enrollment.success_state"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "var(--gradient-gold)",
                boxShadow: "0 0 40px oklch(var(--primary) / 0.3)",
              }}
            >
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-display text-foreground font-bold">
                You're Enrolled!
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {course.title ?? "Course"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Your seat is confirmed. Start learning right now — complete all
              lessons to earn your certificate.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1 border-border/40"
                onClick={handleClose}
                data-ocid="enrollment.close_button"
              >
                Close
              </Button>
              <Button
                className="flex-1 font-bold"
                style={{
                  background: "var(--gradient-gold)",
                  color: "oklch(var(--primary-foreground))",
                }}
                onClick={handleStartLearning}
                data-ocid="enrollment.confirm_button"
              >
                Start Learning →
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
