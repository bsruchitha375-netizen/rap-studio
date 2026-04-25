import { QuizEngine } from "@/components/courses/QuizEngine";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { readSession } from "@/hooks/useAuth";
import {
  useCourseProgress,
  useLessonProgress,
  useLessons,
  useMarkVideoWatched,
  useMyEnrollments,
} from "@/hooks/useBackend";
import type { Lesson, LessonProgress, QuizResult } from "@/types";
import { useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ── Step ring indicator ───────────────────────────────────────────────────────
type StepState = "pending" | "active" | "completed";

function StepRing({
  index,
  state,
  label,
}: {
  index: number;
  state: StepState;
  label: string;
}) {
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

// ── No-YouTube placeholder ────────────────────────────────────────────────────
function NoVideoPlaceholder({ isAdmin }: { isAdmin?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="aspect-video w-full rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed"
      style={{
        borderColor: "oklch(var(--primary) / 0.3)",
        background: "oklch(var(--card) / 0.5)",
      }}
      data-ocid="video_player.no_video_placeholder"
    >
      <div className="text-5xl">🎬</div>
      <div className="text-center px-8">
        <p className="font-display font-semibold text-foreground mb-1">
          Video Coming Soon
        </p>
        <p className="text-sm text-muted-foreground">
          The instructor hasn&apos;t added a video for this lesson yet.
        </p>
        {isAdmin && (
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              borderColor: "oklch(var(--primary) / 0.4)",
              color: "oklch(var(--primary))",
              background: "oklch(var(--primary) / 0.06)",
            }}
          >
            + Add YouTube URL in Admin CMS →
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Sidebar lesson list ───────────────────────────────────────────────────────
function LessonSidebar({
  lessons,
  progressMap,
  currentId,
  onSelect,
}: {
  lessons: Lesson[];
  progressMap: Map<number, LessonProgress>;
  currentId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="space-y-1" data-ocid="lesson.sidebar">
      {lessons.map((lesson, idx) => {
        const prog = progressMap.get(lesson.id);
        const isCompleted = !!(prog?.quizPassed && prog?.videoWatched);
        const isCurrent = lesson.id === currentId;
        const isAccessible =
          idx === 0 ||
          (() => {
            const prev = lessons[idx - 1];
            const prevProg = progressMap.get(prev.id);
            return !!(prevProg?.quizPassed && prevProg?.videoWatched);
          })();

        const hasVideo = !!(lesson.youtubeUrl ?? "");

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
              {prog?.videoWatched && !prog.quizPassed && (
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
              {!hasVideo && !isCompleted && (
                <p className="text-[10px] text-muted-foreground/60">
                  No video yet
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

// ── Main page ─────────────────────────────────────────────────────────────────
export function CourseLearnPage() {
  const { courseId } = useParams({ strict: false }) as { courseId?: string };
  const parsedCourseId = courseId ? Number.parseInt(courseId, 10) : null;

  // ── 1. Check enrollment FIRST. Only show not-enrolled AFTER isLoading = false.
  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useMyEnrollments();

  const isEnrolled = useMemo(() => {
    if (parsedCourseId === null) return false;
    return enrollments.some(
      (e) => String(e.courseId) === String(parsedCourseId),
    );
  }, [enrollments, parsedCourseId]);

  // ── 2. Load lessons only after enrollment confirmed
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(
    isEnrolled ? parsedCourseId : null,
  );
  const { data: courseProgress } = useCourseProgress(
    isEnrolled ? parsedCourseId : null,
  );
  const { data: lessonProgressList = [] } = useLessonProgress(
    isEnrolled ? parsedCourseId : null,
  );
  const markVideoWatched = useMarkVideoWatched();

  const session = readSession();
  const studentName = session?.profile?.name ?? "Student";

  const progressMap = useMemo(() => {
    const m = new Map<number, LessonProgress>();
    for (const lp of lessonProgressList) {
      m.set(lp.lessonId, lp);
    }
    return m;
  }, [lessonProgressList]);

  // ── Determine current lesson (first incomplete or last)
  const currentLessonId = useMemo(() => {
    if (!lessons.length) return null;
    const incomplete = lessons.find((l) => {
      const p = progressMap.get(l.id);
      return !(p?.quizPassed && p?.videoWatched);
    });
    return incomplete?.id ?? lessons[lessons.length - 1].id;
  }, [lessons, progressMap]);

  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [, setQuizResult] = useState<{ passed: boolean; score: number } | null>(
    null,
  );

  // Sync active lesson on initial load
  useEffect(() => {
    if (!activeLessonId && currentLessonId) {
      setActiveLessonId(currentLessonId);
    }
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
    setQuizResult(null);
  };

  const handleVideoComplete = useCallback(() => {
    if (!activeLessonId) return;
    markVideoWatched.mutate(activeLessonId, {
      onSuccess: () => {
        toast.success("Video marked as watched!");
        setShowQuiz(true);
      },
      onError: () => {
        toast.error("Could not save progress. Please try again.");
      },
    });
  }, [activeLessonId, markVideoWatched]);

  const handleQuizComplete = useCallback(
    (result: QuizResult) => {
      setQuizResult({ passed: result.passed, score: result.score });
      if (result.passed) {
        toast.success("Quiz passed! Lesson completed 🎉");
        setTimeout(() => {
          if (!lessons.length || !activeLessonId) return;
          const currentIdx = lessons.findIndex((l) => l.id === activeLessonId);
          const next = lessons[currentIdx + 1];
          if (next) {
            setActiveLessonId(next.id);
            setShowQuiz(false);
            setQuizResult(null);
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
    return p?.quizPassed && p?.videoWatched;
  }).length;

  // ── Loading state ──
  if (enrollmentsLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-3" />
        </div>
      </div>
    );
  }

  // ── Not enrolled — shown only AFTER enrollment data is loaded
  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            Enrollment Required
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            You need to enroll in this course before accessing lessons.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              ← Browse Courses
            </a>
            <a
              href={`/courses/${courseId ?? ""}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              data-ocid="course_learn.enroll_link"
            >
              Enroll Now →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="course_learn.page">
      {/* ── Sticky header ── */}
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
          {/* Progress bar */}
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
        {/* ── Lesson step indicators ── */}
        {lessons.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
              {lessons.map((lesson, idx) => {
                const prog = progressMap.get(lesson.id);
                const isCompleted = !!(prog?.quizPassed && prog?.videoWatched);
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

        {/* ── Empty lessons ── */}
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
            {/* ── Sidebar ── */}
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
                  onSelect={handleSelectLesson}
                />
              </div>

              {/* ── Certificate panel ── */}
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

            {/* ── Main content ── */}
            <main className="lg:col-span-3 space-y-5">
              {activeLesson ? (
                <>
                  {/* Lesson header */}
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

                  {/* ── Video area ── */}
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
                      <NoVideoPlaceholder />
                    )}
                  </motion.div>

                  {/* ── Quiz section — shown after video watched ── */}
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
                            setQuizResult({
                              passed: false,
                              score: result.score,
                            });
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Lesson complete panel ── */}
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
                          Great work! You&apos;ve finished this lesson.
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
                                setQuizResult(null);
                              }}
                              style={{
                                background: "var(--gradient-gold)",
                                color: "oklch(var(--primary-foreground))",
                              }}
                              data-ocid="lesson.next_lesson_button"
                            >
                              Next Lesson: {next.title ?? "Next"} →
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-foreground">
                                🎓 You&apos;ve completed all lessons!
                              </p>
                              {certificateEarned && (
                                <a
                                  href="/dashboard/student"
                                  className="inline-block mt-2 text-sm font-semibold text-primary underline"
                                  data-ocid="lesson.view_certificate_link"
                                >
                                  View your Certificate →
                                </a>
                              )}
                            </div>
                          );
                        })()}
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
