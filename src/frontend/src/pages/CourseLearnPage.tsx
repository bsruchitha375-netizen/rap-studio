import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { readSession } from "@/hooks/useAuth";
import {
  useCourseProgress,
  useCourses,
  useEnrollCourse,
  useLessonProgress,
  useLessons,
  useMarkVideoWatched,
  useMyEnrollments,
  useMyPayments,
} from "@/hooks/useBackend";
import { useStripe } from "@/hooks/useStripe";
import type { Lesson, LessonProgress, QuizResult } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { QuizEngine } from "../components/courses/QuizEngine";
import { VideoPlayer } from "../components/courses/VideoPlayer";

type StepState = "pending" | "active" | "completed";

function StepRing({
  index,
  state,
  label,
}: { index: number; state: StepState; label: string }) {
  const ringColor =
    state === "completed"
      ? "oklch(0.65 0.18 150)"
      : state === "active"
        ? "oklch(var(--primary))"
        : "oklch(var(--muted-foreground) / 0.3)";
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 border-2"
        style={{
          borderColor: ringColor,
          color:
            state === "pending" ? "oklch(var(--muted-foreground))" : "#fff",
          background:
            state === "completed"
              ? "oklch(0.65 0.18 150)"
              : state === "active"
                ? "oklch(var(--primary))"
                : "transparent",
          boxShadow:
            state === "active"
              ? "0 0 12px oklch(var(--primary) / 0.5)"
              : "none",
        }}
      >
        {state === "completed" ? "✓" : index + 1}
      </div>
      <span
        className="text-[9px] font-medium text-center leading-tight max-w-[4rem] truncate"
        style={{
          color:
            state === "pending"
              ? "oklch(var(--muted-foreground) / 0.5)"
              : "oklch(var(--foreground))",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function OfflineLessonCard({
  description,
  onMarkComplete,
  isCompleted,
}: { description: string; onMarkComplete: () => void; isCompleted: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="aspect-video w-full rounded-2xl flex flex-col items-center justify-center gap-4 p-8"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.10 0.015 280), oklch(0.14 0.020 285))",
        border: isCompleted
          ? "2px solid oklch(0.65 0.18 150 / 0.5)"
          : "2px dashed oklch(var(--primary) / 0.3)",
      }}
      data-ocid="lesson.offline_card"
    >
      <div className="text-5xl">{isCompleted ? "✅" : "🏫"}</div>
      <div className="text-center max-w-md">
        <p className="font-display font-semibold text-foreground mb-2 text-lg">
          {isCompleted ? "Lesson Completed!" : "In-Person Lesson"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {description ||
            "Attend this in-person lesson at RAP Studio. Mark complete when done."}
        </p>
        {!isCompleted && (
          <Button
            onClick={onMarkComplete}
            style={{
              background: "var(--gradient-gold)",
              color: "oklch(var(--primary-foreground))",
            }}
            data-ocid="lesson.mark_complete_button"
          >
            Mark Lesson Complete
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function LessonSidebar({
  lessons,
  progressMap,
  currentId,
  isOnlineCourse,
  onSelect,
}: {
  lessons: Lesson[];
  progressMap: Map<number, LessonProgress>;
  currentId: number | null;
  isOnlineCourse: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="space-y-1" data-ocid="lesson.sidebar">
      {lessons.map((lesson, idx) => {
        const prog = progressMap.get(lesson.id);
        const isCompleted = isOnlineCourse
          ? !!(prog?.quizPassed && prog?.videoWatched)
          : !!prog?.quizPassed;
        const isCurrent = lesson.id === currentId;
        const isAccessible =
          idx === 0 ||
          (() => {
            const prev = lessons[idx - 1];
            if (!prev) return false;
            const prevProg = progressMap.get(prev.id);
            return isOnlineCourse
              ? !!(prevProg?.quizPassed && prevProg?.videoWatched)
              : !!prevProg?.quizPassed;
          })();
        return (
          <button
            key={lesson.id}
            type="button"
            disabled={!isAccessible}
            onClick={() => isAccessible && onSelect(lesson.id)}
            data-ocid={`lesson.sidebar_item.${idx + 1}`}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 border"
            style={{
              background: isCurrent
                ? "oklch(var(--primary) / 0.12)"
                : isCompleted
                  ? "oklch(0.65 0.18 150 / 0.06)"
                  : "oklch(var(--card) / 0.4)",
              borderColor: isCurrent
                ? "oklch(var(--primary) / 0.5)"
                : isCompleted
                  ? "oklch(0.65 0.18 150 / 0.3)"
                  : "oklch(var(--border) / 0.3)",
              opacity: !isAccessible ? 0.4 : 1,
              cursor: !isAccessible ? "not-allowed" : "pointer",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                background: isCompleted
                  ? "oklch(0.65 0.18 150)"
                  : isCurrent
                    ? "oklch(var(--primary))"
                    : "oklch(var(--muted))",
                color:
                  isCompleted || isCurrent
                    ? "#fff"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              {isCompleted ? "✓" : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{
                  color: isCurrent
                    ? "oklch(var(--primary))"
                    : "oklch(var(--foreground))",
                }}
              >
                {lesson.title ?? `Lesson ${idx + 1}`}
              </p>
              {isOnlineCourse && prog?.videoWatched && !prog.quizPassed && (
                <p className="text-[10px] text-muted-foreground">
                  Quiz pending
                </p>
              )}
              {isCompleted && (
                <p
                  className="text-[10px]"
                  style={{ color: "oklch(0.65 0.18 150)" }}
                >
                  Completed ✓
                </p>
              )}
            </div>
            {!isAccessible && (
              <span className="text-xs text-muted-foreground/40">🔒</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PaymentGate({
  courseId,
  courseName,
  onPaymentSuccess,
}: { courseId: string; courseName: string; onPaymentSuccess: () => void }) {
  const { initiatePayment, isLoading } = useStripe();
  const handlePay = () => {
    void initiatePayment({
      amount: 999,
      name: courseName,
      description: `Certificate: ${courseName}`,
      referenceId: `cert_enrollment_${courseId}_${Date.now()}`,
      paymentType: "certificate_download",
      onSuccess: () => {
        toast.success("Payment confirmed! Your certificate is now available.");
        onPaymentSuccess();
      },
      onFailure: (err) => {
        toast.error(`Payment failed: ${err}`);
      },
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 text-center space-y-4"
      style={{
        background: "oklch(0.72 0.14 82 / 0.05)",
        borderColor: "oklch(0.72 0.14 82 / 0.3)",
      }}
      data-ocid="certificate.payment_gate"
    >
      <div className="text-4xl">🔒</div>
      <div>
        <p className="font-display font-semibold text-foreground text-lg mb-1">
          Complete payment to unlock your certificate
        </p>
        <p className="text-sm text-muted-foreground">
          All lessons complete! Pay once to download your verified certificate.
        </p>
      </div>
      <Button
        onClick={handlePay}
        disabled={isLoading}
        className="font-bold px-8"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.72 0.14 82), oklch(0.78 0.18 82))",
          color: "oklch(0.08 0.01 280)",
        }}
        data-ocid="certificate.pay_now_button"
      >
        {isLoading ? "Processing…" : "Pay ₹999 to Get Certificate"}
      </Button>
    </motion.div>
  );
}

function EnrollmentGate({ courseId }: { courseId: string }) {
  const [enrolling, setEnrolling] = useState(false);
  const enrollCourse = useEnrollCourse();
  const { refetch: refetchEnrollments } = useMyEnrollments();
  const { actor } = useActor(createActor);

  const handleEnroll = async () => {
    const numId = Number.parseInt(courseId, 10);
    if (!actor) {
      toast.error("Backend not ready. Please wait a moment and try again.");
      return;
    }
    if (Number.isNaN(numId) || numId <= 0) {
      toast.error("Invalid course. Please go back and try again.");
      return;
    }
    setEnrolling(true);
    try {
      await enrollCourse.mutateAsync(numId);
      // Wait for enrollment to be reflected before reloading
      await refetchEnrollments();
      toast.success("Enrolled! Loading your lessons…");
      // Small delay to ensure query cache is updated
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists")
      ) {
        await refetchEnrollments();
        window.location.reload();
        return;
      }
      toast.error("Enrollment failed. Please try again.");
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🎓</div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Enroll to Start Learning
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Enrollment is completely free. Complete all lessons to earn your
          verified certificate.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            ← Browse Courses
          </a>
          <Button
            onClick={() => void handleEnroll()}
            disabled={enrolling}
            className="gap-2 font-bold"
            style={{
              background: "var(--gradient-gold)",
              color: "oklch(var(--primary-foreground))",
            }}
            data-ocid="course_learn.enroll_button"
          >
            {enrolling ? (
              <>
                <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                Enrolling…
              </>
            ) : (
              "Enroll Free →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Skeleton className="h-96 lg:col-span-1 rounded-2xl" />
        <Skeleton className="h-96 lg:col-span-3 rounded-2xl" />
      </div>
    </div>
  );
}

export function CourseLearnPage() {
  const { courseId } = useParams({ strict: false }) as { courseId?: string };
  const parsedCourseId = courseId ? Number.parseInt(courseId, 10) : null;

  // Step 1: Check enrollment first — lessons are only fetched after confirming enrollment
  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useMyEnrollments();
  const { data: payments = [] } = useMyPayments();

  // Track if we've done an initial enrollment refresh to prevent race on page load
  const hasRefreshedRef = useRef(false);
  const { actor } = useActor(createActor);

  // On mount: if actor is available and enrollment data looks empty, refresh once
  useEffect(() => {
    if (hasRefreshedRef.current) return;
    if (!actor || enrollmentsLoading) return;
    if (enrollments.length === 0) {
      hasRefreshedRef.current = true;
      void refetchEnrollments();
    }
  }, [actor, enrollments.length, enrollmentsLoading, refetchEnrollments]);

  const isEnrolled = useMemo(() => {
    if (parsedCourseId === null || enrollments.length === 0) return false;
    return enrollments.some(
      (e) =>
        Number(e.courseId) === parsedCourseId ||
        String(e.courseId) === String(parsedCourseId),
    );
  }, [enrollments, parsedCourseId]);

  const enrollment = useMemo(
    () =>
      enrollments.find(
        (e) =>
          Number(e.courseId) === parsedCourseId ||
          String(e.courseId) === String(parsedCourseId),
      ),
    [enrollments, parsedCourseId],
  );

  const isPaid = useMemo(() => {
    if (enrollment?.paymentStatus === "paid") return true;
    return payments.some(
      (p) =>
        (p.referenceId?.includes(String(parsedCourseId)) ?? false) &&
        p.status === "paid",
    );
  }, [enrollment, payments, parsedCourseId]);

  // Step 2: Fetch lessons ONLY after enrollment is confirmed
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(
    isEnrolled ? parsedCourseId : null,
  );
  const { data: courseProgress, refetch: refetchProgress } = useCourseProgress(
    isEnrolled ? parsedCourseId : null,
  );
  const { data: lessonProgressList = [] } = useLessonProgress(
    isEnrolled ? parsedCourseId : null,
  );
  const markVideoWatched = useMarkVideoWatched();

  // Resolve course name for payment gate
  const { data: allCourses = [] } = useCourses();
  const currentCourse = useMemo(
    () => allCourses.find((c) => String(c.id) === String(parsedCourseId)),
    [allCourses, parsedCourseId],
  );

  const session = readSession();
  const studentName = session?.profile?.name ?? "Student";

  const isOnlineCourse = useMemo(() => {
    if (lessons.length === 0) return true;
    return lessons.some((l) => (l.youtubeUrl ?? "").length > 0);
  }, [lessons]);

  const progressMap = useMemo(() => {
    const m = new Map<number, LessonProgress>();
    for (const lp of lessonProgressList) m.set(lp.lessonId, lp);
    return m;
  }, [lessonProgressList]);

  const currentLessonId = useMemo(() => {
    if (!lessons.length) return null;
    const incomplete = lessons.find((l) => {
      const p = progressMap.get(l.id);
      return isOnlineCourse
        ? !(p?.quizPassed && p?.videoWatched)
        : !p?.quizPassed;
    });
    return incomplete?.id ?? lessons[lessons.length - 1].id;
  }, [lessons, progressMap, isOnlineCourse]);

  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [paymentDone, setPaymentDone] = useState(isPaid);

  useEffect(() => {
    if (isPaid) setPaymentDone(true);
  }, [isPaid]);

  useEffect(() => {
    if (!activeLessonId && currentLessonId) setActiveLessonId(currentLessonId);
  }, [currentLessonId, activeLessonId]);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) ?? null,
    [lessons, activeLessonId],
  );
  const activeProgress = activeLessonId
    ? progressMap.get(activeLessonId)
    : undefined;

  const handleSelectLesson = (id: number) => {
    setActiveLessonId(id);
    setShowQuiz(false);
  };

  const handleVideoComplete = useCallback(() => {
    if (!activeLessonId) return;
    markVideoWatched.mutate(activeLessonId, {
      onSuccess: () => {
        toast.success("Video completed! Time for the quiz.");
        setShowQuiz(true);
      },
      onError: () => {
        toast.warning("Progress save failed, but you can still take the quiz.");
        setShowQuiz(true);
      },
    });
  }, [activeLessonId, markVideoWatched]);

  const handleOfflineMarkComplete = useCallback(() => {
    if (!activeLessonId) return;
    markVideoWatched.mutate(activeLessonId, {
      onSuccess: () => setShowQuiz(true),
      onError: () => setShowQuiz(true),
    });
  }, [activeLessonId, markVideoWatched]);

  const handleQuizComplete = useCallback(
    (result: QuizResult) => {
      if (result.passed) {
        toast.success("Quiz passed! Lesson completed 🎉");
        setTimeout(() => {
          if (!lessons.length || !activeLessonId) return;
          const currentIdx = lessons.findIndex((l) => l.id === activeLessonId);
          const next = lessons[currentIdx + 1];
          if (next) {
            setActiveLessonId(next.id);
            setShowQuiz(false);
          }
        }, 1500);
      }
    },
    [lessons, activeLessonId],
  );

  const overallPercent = Number(courseProgress?.overallPercent ?? 0);
  const certificateEarned = courseProgress?.certificateEarned ?? false;
  const completedCount = lessons.filter((l) => {
    const p = progressMap.get(l.id);
    return isOnlineCourse ? p?.quizPassed && p?.videoWatched : p?.quizPassed;
  }).length;
  const allLessonsComplete =
    lessons.length > 0 && completedCount === lessons.length;

  // Show skeleton while loading enrollment status
  if (enrollmentsLoading) return <LoadingSkeleton />;

  // If not enrolled, show enrollment gate
  if (!isEnrolled) return <EnrollmentGate courseId={courseId ?? ""} />;

  // Show skeleton while loading lessons
  if (lessonsLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-background" data-ocid="course_learn.page">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border/40 px-4 sm:px-6 py-3 flex items-center gap-4">
        <a
          href="/courses"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 shrink-0"
          data-ocid="course_learn.back_link"
        >
          ← Courses
        </a>
        <div className="h-4 w-px bg-border/40" aria-hidden="true" />
        <span className="font-display font-semibold text-foreground text-sm truncate flex-1 min-w-0">
          {activeLesson?.title ?? "Course Learning"}
        </span>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-2 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${overallPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-semibold text-primary">
              {overallPercent}%
            </span>
          </div>
          {certificateEarned && (
            <Badge
              className="text-xs font-bold gap-1 shrink-0"
              style={{
                background: "oklch(0.72 0.18 85 / 0.15)",
                color: "oklch(0.72 0.18 85)",
                border: "1px solid oklch(0.72 0.18 85 / 0.4)",
              }}
              data-ocid="course_learn.certificate_badge"
            >
              🏆 Certificate Earned
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Step progress bar */}
        {lessons.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
              {lessons.map((lesson, idx) => {
                const prog = progressMap.get(lesson.id);
                const isCompleted = isOnlineCourse
                  ? !!(prog?.quizPassed && prog?.videoWatched)
                  : !!prog?.quizPassed;
                const isCurrent = lesson.id === activeLessonId;
                const state: StepState = isCompleted
                  ? "completed"
                  : isCurrent
                    ? "active"
                    : "pending";
                return (
                  <div key={lesson.id} className="flex items-center">
                    <StepRing
                      index={idx}
                      state={state}
                      label={lesson.title ?? `Lesson ${idx + 1}`}
                    />
                    {idx < lessons.length - 1 && (
                      <div
                        className="w-8 h-px mx-1 shrink-0 transition-colors duration-300"
                        style={{
                          background: isCompleted
                            ? "oklch(0.65 0.18 150)"
                            : "oklch(var(--border) / 0.4)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty lessons */}
        {lessons.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border border-border/40 bg-card/40"
            data-ocid="course_learn.empty_state"
          >
            <div className="text-5xl mb-4">📚</div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No Lessons Yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Lessons will appear here once the instructor adds them. Check back
              soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-3">
                <div>
                  <h2 className="font-display font-semibold text-foreground text-sm mb-0.5">
                    Course Progress
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {completedCount}/{lessons.length} lessons completed
                  </p>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-gold)" }}
                    animate={{ width: `${overallPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <LessonSidebar
                  lessons={lessons}
                  progressMap={progressMap}
                  currentId={activeLessonId}
                  isOnlineCourse={isOnlineCourse}
                  onSelect={handleSelectLesson}
                />
              </div>

              {certificateEarned && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border p-4 text-center"
                  style={{
                    background: "oklch(0.72 0.18 85 / 0.06)",
                    borderColor: "oklch(0.72 0.18 85 / 0.4)",
                  }}
                  data-ocid="course_learn.certificate_panel"
                >
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-1">
                    Certificate Earned!
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Congratulations, {studentName}!
                  </p>
                  <a
                    href="/dashboard/student"
                    className="text-xs font-semibold underline"
                    style={{ color: "oklch(0.72 0.18 85)" }}
                    data-ocid="course_learn.certificate_link"
                  >
                    View Certificate →
                  </a>
                </motion.div>
              )}
            </aside>

            {/* Main content */}
            <main className="lg:col-span-3 space-y-5">
              {activeLesson ? (
                <>
                  <div className="flex items-start gap-3">
                    <div>
                      <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                        {activeLesson.title ?? "Lesson"}
                      </h1>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          data-ocid="lesson.order_badge"
                        >
                          Lesson{" "}
                          {lessons.findIndex((l) => l.id === activeLesson.id) +
                            1}
                        </Badge>
                        {activeProgress?.videoWatched && (
                          <Badge
                            className="text-[10px] gap-1"
                            style={{
                              background: "oklch(0.65 0.18 150 / 0.12)",
                              color: "oklch(0.65 0.18 150)",
                              border: "1px solid oklch(0.65 0.18 150 / 0.3)",
                            }}
                          >
                            ✓ Video Watched
                          </Badge>
                        )}
                        {activeProgress?.quizPassed && (
                          <Badge
                            className="text-[10px] gap-1"
                            style={{
                              background: "oklch(var(--primary) / 0.1)",
                              color: "oklch(var(--primary))",
                              border: "1px solid oklch(var(--primary) / 0.3)",
                            }}
                          >
                            ✓ Quiz Passed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video / offline card */}
                  <motion.div
                    key={`video-${activeLesson.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {(activeLesson.youtubeUrl ?? "") ? (
                      <VideoPlayer
                        youtubeUrl={activeLesson.youtubeUrl ?? ""}
                        lessonId={activeLesson.id}
                        isLocked={false}
                        isCompleted={activeProgress?.videoWatched ?? false}
                        onVideoComplete={handleVideoComplete}
                      />
                    ) : (
                      <OfflineLessonCard
                        description={activeLesson.description ?? ""}
                        onMarkComplete={handleOfflineMarkComplete}
                        isCompleted={activeProgress?.videoWatched ?? false}
                      />
                    )}
                  </motion.div>

                  {/* Lesson description */}
                  {activeLesson.description && (
                    <div className="rounded-xl border border-border/30 bg-card/40 p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activeLesson.description}
                      </p>
                    </div>
                  )}

                  {/* Quiz section */}
                  <AnimatePresence>
                    {(activeProgress?.videoWatched || showQuiz) && (
                      <motion.div
                        key={`quiz-${activeLesson.id}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                        className="rounded-2xl border border-accent/20 bg-card/60 p-5 backdrop-blur-sm"
                        style={{
                          boxShadow: "0 0 24px oklch(var(--accent) / 0.06)",
                        }}
                        data-ocid="lesson.quiz_container"
                      >
                        <QuizEngine
                          questions={activeLesson.quizQuestions ?? []}
                          lessonId={activeLesson.id}
                          isCompleted={activeProgress?.quizPassed ?? false}
                          quizScore={activeProgress?.quizScore}
                          onQuizPass={handleQuizComplete}
                          onQuizFail={(result) => {
                            toast.error(
                              `Quiz failed — score: ${result.score}/${result.totalQuestions}. Minimum 60% needed.`,
                            );
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Lesson complete banner */}
                  <AnimatePresence>
                    {activeProgress?.quizPassed && (
                      <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl border p-8 text-center"
                        style={{
                          background: "oklch(0.65 0.18 150 / 0.06)",
                          borderColor: "oklch(0.65 0.18 150 / 0.3)",
                        }}
                        data-ocid="lesson.completed_panel"
                      >
                        <div className="text-5xl mb-3">✅</div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                          Lesson Complete!
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Great work! You've finished this lesson.
                        </p>
                        {(() => {
                          const currentIdx = lessons.findIndex(
                            (l) => l.id === activeLesson.id,
                          );
                          const next = lessons[currentIdx + 1];
                          return next ? (
                            <Button
                              onClick={() => {
                                setActiveLessonId(next.id);
                                setShowQuiz(false);
                              }}
                              style={{
                                background: "var(--gradient-gold)",
                                color: "oklch(var(--primary-foreground))",
                              }}
                              data-ocid="lesson.next_lesson_button"
                            >
                              Next Lesson: {next.title ?? "Next"} →
                            </Button>
                          ) : null;
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Course completion + certificate */}
                  <AnimatePresence>
                    {allLessonsComplete && (
                      <motion.div
                        key="all-complete"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border p-8 text-center space-y-4"
                        style={{
                          background: "oklch(0.72 0.14 82 / 0.06)",
                          borderColor: "oklch(0.72 0.14 82 / 0.4)",
                        }}
                        data-ocid="course_learn.completion_banner"
                      >
                        <div className="text-5xl">🎓</div>
                        <div>
                          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                            You've completed all lessons!
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Congratulations, {studentName}! You've demonstrated
                            mastery of this course.
                          </p>
                        </div>
                        {certificateEarned && paymentDone ? (
                          <div className="space-y-3">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "oklch(0.72 0.18 85)" }}
                            >
                              🏆 Your certificate is ready!
                            </p>
                            <a
                              href="/dashboard/student"
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                              style={{
                                background: "var(--gradient-gold)",
                                color: "oklch(0.08 0.01 280)",
                              }}
                              data-ocid="course_learn.view_certificate_button"
                            >
                              View &amp; Download Certificate →
                            </a>
                          </div>
                        ) : !paymentDone ? (
                          <PaymentGate
                            courseId={courseId ?? ""}
                            courseName={currentCourse?.title ?? "Course"}
                            onPaymentSuccess={() => {
                              setPaymentDone(true);
                              void refetchProgress();
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-xl p-4 text-sm text-muted-foreground"
                            style={{
                              background: "oklch(var(--muted) / 0.3)",
                              border: "1px solid oklch(var(--border) / 0.3)",
                            }}
                          >
                            Certificate is being generated. Check your dashboard
                            shortly.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="text-4xl mb-3">👈</div>
                  <p className="text-sm">
                    Select a lesson from the sidebar to begin
                  </p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
