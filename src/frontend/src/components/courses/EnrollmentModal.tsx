import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useEnrollCourse, useMyEnrollments } from "../../hooks/useBackend";
import { useStripe } from "../../hooks/useStripe";
import type { Course, CourseMode } from "../../types";

interface EnrollmentModalProps {
  course: Course;
  open: boolean;
  onClose: () => void;
}

const MODE_STYLES: Record<CourseMode, { label: string; class: string }> = {
  online: {
    label: "Online",
    class: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  offline: {
    label: "Offline",
    class: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  hybrid: {
    label: "Hybrid",
    class: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
};

const WHAT_YOU_GET = [
  "Lifetime course access",
  "Certificate of completion",
  "Expert instructor support",
  "HD course materials",
  "Community forum access",
];

type EnrollStep = "details" | "enrolling" | "paying" | "success" | "error";

export function EnrollmentModal({
  course,
  open,
  onClose,
}: EnrollmentModalProps) {
  const { initiatePayment, isLoading } = useStripe();
  const { isAuthenticated } = useAuth();
  const enrollCourseMutation = useEnrollCourse();
  const { data: existingEnrollments = [] } = useMyEnrollments();
  const [step, setStep] = useState<EnrollStep>("details");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const modeStyle = MODE_STYLES[course.mode] ?? MODE_STYLES.online;

  // Check if already enrolled — used to skip enrollCourse call
  const alreadyEnrolled = existingEnrollments.some(
    (e) => String(e.courseId) === String(course.id),
  );

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Please register or log in to enroll.");
      return;
    }

    setErrorMessage("");

    // ── STEP 1: Enroll in backend FIRST (unless already enrolled) ──
    if (!alreadyEnrolled) {
      setStep("enrolling");
      try {
        const courseIdNum = Number.parseInt(String(course.id), 10);
        if (Number.isNaN(courseIdNum) || courseIdNum <= 0) {
          throw new Error("Invalid course ID");
        }
        await enrollCourseMutation.mutateAsync(courseIdNum);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        // If it's an "already enrolled" error, continue to payment
        const isAlreadyEnrolledError =
          msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("exists") ||
          msg.toLowerCase().includes("duplicate");

        if (!isAlreadyEnrolledError) {
          // Real error — stop here, show error
          setErrorMessage(
            msg || "Could not enroll in course. Please try again.",
          );
          setStep("error");
          toast.error("Enrollment failed. Please try again.");
          return;
        }
        // Otherwise fall through to payment
        console.warn("[EnrollmentModal] enrollCourse (already enrolled):", msg);
      }
    }

    // ── STEP 2: Initiate payment ──
    setStep("paying");

    await initiatePayment({
      amount: course.price > 0 ? course.price : 5,
      name: course.title ?? "Course",
      description: `Course enrollment — ${course.title ?? "Course"}`,
      referenceId: String(course.id),
      paymentType: "course_enrollment",
      onRedirecting: () => {
        setStep("paying");
      },
      onFailure: (err) => {
        if (err === "Payment cancelled") {
          setStep("details");
        } else {
          setErrorMessage(err || "Payment failed. Please try again.");
          setStep("error");
        }
      },
    });

    // Reached here = demo mode (no Stripe redirect)
    setStep("success");
    toast.success("Enrollment confirmed! Check your dashboard.");
  };

  const handleRetry = () => {
    setStep("details");
    setErrorMessage("");
    setTimeout(() => void handleEnroll(), 100);
  };

  const handleClose = () => {
    setStep("details");
    setErrorMessage("");
    onClose();
  };

  const isProcessing =
    isLoading ||
    enrollCourseMutation.isPending ||
    step === "enrolling" ||
    step === "paying";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="bg-card border-border/60 max-w-md w-full p-0 overflow-hidden"
        data-ocid="enrollment-modal"
      >
        {/* ── Details step ── */}
        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 px-6 pt-6 pb-4">
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-foreground font-display text-lg leading-tight">
                      {course.title ?? "Course"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`text-xs border ${modeStyle.class}`}>
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
              {/* Already enrolled indicator */}
              {alreadyEnrolled && (
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
                  style={{
                    background: "oklch(0.65 0.18 150 / 0.06)",
                    borderColor: "oklch(0.65 0.18 150 / 0.3)",
                  }}
                  data-ocid="enrollment-already-enrolled"
                >
                  <CheckCircle2
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(0.65 0.18 150)" }}
                  />
                  <p className="text-xs font-medium text-foreground">
                    You are already enrolled. Complete your payment below.
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  What&apos;s included
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

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                  <p className="text-sm font-semibold text-foreground">
                    {course.instructor ?? "RAP Studio"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure payment
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stripe encrypted
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-2">
                <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">
                    Certificate unlocked
                  </span>{" "}
                  after full payment and course completion.
                </p>
              </div>

              {/* Auth gate */}
              {!isAuthenticated ? (
                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{
                    background: "oklch(0.68 0.2 290 / 0.06)",
                    borderColor: "oklch(0.68 0.2 290 / 0.3)",
                  }}
                  data-ocid="enrollment-auth-gate"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Registration required to enroll
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create an account or log in to enroll in this course.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={handleClose}
                      data-ocid="enrollment-cancel-btn"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs font-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.62 0.18 65))",
                        color: "oklch(0.99 0.002 70)",
                      }}
                      onClick={() => {
                        window.location.href = `/login?return=${encodeURIComponent(window.location.pathname)}`;
                      }}
                      data-ocid="enrollment-login-btn"
                    >
                      Login / Register →
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full h-12 text-base font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.7 0.22 70), oklch(0.62 0.18 65))",
                    color: "oklch(0.99 0.002 70)",
                  }}
                  onClick={() => void handleEnroll()}
                  disabled={isProcessing}
                  data-ocid="confirm-enrollment-btn"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {alreadyEnrolled
                        ? "Complete Payment"
                        : "Enroll & Pay with Stripe"}
                    </>
                  )}
                </Button>
              )}

              <p className="text-center text-xs text-muted-foreground">
                By enrolling you agree to our terms of service
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Enrolling step ── */}
        {step === "enrolling" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center px-8 py-12 gap-5"
            data-ocid="enrollment-enrolling-state"
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

        {/* ── Paying / redirecting step ── */}
        {step === "paying" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center px-8 py-12 gap-5"
            data-ocid="enrollment-paying-state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-display text-foreground font-bold">
                Preparing Checkout…
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                You&apos;ll be redirected to Stripe&apos;s secure payment page.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-primary/80">
              <ShieldCheck className="w-4 h-4" />
              256-bit SSL encrypted checkout
            </div>
          </motion.div>
        )}

        {/* ── Error step ── */}
        {step === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center px-8 py-10 gap-4"
            data-ocid="enrollment-error-state"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-xl font-display text-foreground font-bold">
                Something Went Wrong
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                {errorMessage || "An error occurred. Please try again."}
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("details")}
                data-ocid="enrollment-cancel-btn"
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                onClick={handleRetry}
                data-ocid="retry-payment-btn"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Success step ── */}
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="flex flex-col items-center text-center px-8 py-10 gap-4"
            data-ocid="enrollment-success-state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-display text-foreground font-bold">
                You&apos;re Enrolled!
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {course.title ?? "Course"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your seat is confirmed. Head to your Student Dashboard to start
              learning. Certificate available after full completion.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-ocid="enrollment-close-btn"
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  window.location.href = "/dashboard/student";
                }}
                data-ocid="enrollment-go-dashboard-btn"
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
