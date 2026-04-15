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
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useRazorpay } from "../../hooks/useRazorpay";
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

type EnrollStep = "details" | "verifying" | "success" | "error";

export function EnrollmentModal({
  course,
  open,
  onClose,
}: EnrollmentModalProps) {
  const { initiatePayment, isLoading } = useRazorpay();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<EnrollStep>("details");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const modeStyle = MODE_STYLES[course.mode];

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to enroll in a course.");
      return;
    }

    setErrorMessage("");

    await initiatePayment({
      amount: 5,
      name: course.title,
      description: `Course enrollment — ${course.title}`,
      referenceId: course.id,
      paymentType: "course_enrollment",
      prefillName: "Student",
      onVerifying: () => {
        // Payment popup closed, backend verification in progress
        setStep("verifying");
      },
      onSuccess: (_response) => {
        setStep("success");
        toast.success("Enrollment confirmed! Check your dashboard.");
      },
      onFailure: (err) => {
        if (err === "Payment cancelled") {
          // User dismissed — stay on details
          setStep("details");
        } else if (
          err === "Payment verification failed. Please contact support."
        ) {
          setErrorMessage(
            "Payment verification failed. Please contact support.",
          );
          setStep("error");
        } else {
          setErrorMessage(err || "Payment failed. Please try again.");
          setStep("error");
        }
      },
    });
  };

  const handleRetry = () => {
    setStep("details");
    setErrorMessage("");
    // Small delay so UI resets visually before re-opening popup
    setTimeout(() => handleEnroll(), 100);
  };

  const handleClose = () => {
    setStep("details");
    setErrorMessage("");
    onClose();
  };

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
                      {course.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`text-xs border ${modeStyle.class}`}>
                        {modeStyle.label}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  What's included
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
                  <p className="text-xs text-muted-foreground">Total Fee</p>
                  <p className="text-3xl font-bold text-primary">₹5</p>
                  <p className="text-xs text-muted-foreground">
                    One-time payment
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure payment
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Razorpay encrypted
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-2">
                <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">
                    Certificate unlocked
                  </span>{" "}
                  after full ₹5 payment and course completion.
                </p>
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Log in to complete enrollment
                  </p>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                  >
                    Login to Enroll
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
                  onClick={handleEnroll}
                  disabled={isLoading}
                  data-ocid="confirm-enrollment-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening Payment…
                    </>
                  ) : (
                    "Confirm Enrollment — ₹5"
                  )}
                </Button>
              )}

              <p className="text-center text-xs text-muted-foreground">
                By enrolling you agree to our terms of service
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Verifying step ── */}
        {step === "verifying" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center px-8 py-12 gap-5"
            data-ocid="enrollment-verifying-state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-display text-foreground font-bold">
                Verifying Payment…
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                Please wait while we confirm your payment with our server. Do
                not close this window.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-primary/80">
              <ShieldCheck className="w-4 h-4" />
              Secure end-to-end verification
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
                Payment Failed
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                {errorMessage || "Payment failed. Please try again."}
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("details")}
                data-ocid="enrollment-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                onClick={handleRetry}
                data-ocid="retry-payment-btn"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Payment
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
                You're Enrolled!
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {course.title}
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
