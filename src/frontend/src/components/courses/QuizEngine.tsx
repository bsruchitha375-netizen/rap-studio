import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubmitQuiz } from "@/hooks/useBackend";
import type { QuizQuestion, QuizResult } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── Gold progress bar ─────────────────────────────────────────────────────────
function QuizProgressBar({
  answered,
  total,
}: {
  answered: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span
          className="font-semibold tracking-wide uppercase"
          style={{ color: "oklch(var(--primary))", letterSpacing: "1px" }}
        >
          Progress
        </span>
        <span className="text-muted-foreground font-medium">
          {answered} / {total} answered
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: "oklch(var(--border) / 0.4)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--gradient-gold)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Answer option button ──────────────────────────────────────────────────────
function AnswerOption({
  label,
  text,
  isSelected,
  disabled,
  onClick,
  ocid,
}: {
  label: string;
  text: string;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-ocid={ocid}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 border flex items-start gap-3"
      style={{
        background: isSelected
          ? "oklch(var(--accent) / 0.14)"
          : "oklch(var(--card) / 0.55)",
        borderColor: isSelected
          ? "oklch(var(--accent) / 0.7)"
          : "oklch(var(--border) / 0.35)",
        color: isSelected
          ? "oklch(var(--accent-foreground))"
          : "oklch(var(--foreground))",
        boxShadow: isSelected
          ? "0 0 14px oklch(var(--accent) / 0.18), inset 0 1px 0 oklch(1 0 0 / 0.06)"
          : "none",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {/* Radio circle */}
      <span
        className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
        style={{
          borderColor: isSelected
            ? "oklch(var(--accent))"
            : "oklch(var(--border) / 0.6)",
          background: isSelected ? "oklch(var(--accent))" : "transparent",
        }}
      >
        {isSelected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-white"
          />
        )}
      </span>
      {/* Option label + text */}
      <span className="flex-1 min-w-0 leading-snug">
        <span
          className="font-bold text-xs mr-1.5"
          style={{
            color: isSelected
              ? "oklch(var(--accent))"
              : "oklch(var(--muted-foreground))",
          }}
        >
          {label}.
        </span>
        <span>{text}</span>
      </span>
    </motion.button>
  );
}

// ── Score result screen ───────────────────────────────────────────────────────
function ScoreScreen({
  score,
  total,
  passed,
  onRetry,
  onContinue,
}: {
  score: number;
  total: number;
  passed: boolean;
  onRetry: () => void;
  onContinue: () => void;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-2xl border p-8 text-center space-y-5"
      style={{
        background: passed
          ? "oklch(var(--primary) / 0.06)"
          : "oklch(var(--destructive) / 0.06)",
        borderColor: passed
          ? "oklch(var(--primary) / 0.35)"
          : "oklch(var(--destructive) / 0.35)",
        boxShadow: passed
          ? "0 0 40px oklch(var(--primary) / 0.12)"
          : "0 0 32px oklch(var(--destructive) / 0.08)",
      }}
      data-ocid="quiz.result_screen"
    >
      {/* Big score circle */}
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 240,
            damping: 18,
          }}
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black border-4 font-display"
          style={{
            borderColor: passed
              ? "oklch(var(--primary) / 0.7)"
              : "oklch(var(--destructive) / 0.5)",
            background: passed
              ? "oklch(var(--primary) / 0.12)"
              : "oklch(var(--destructive) / 0.1)",
            color: passed
              ? "oklch(var(--primary))"
              : "oklch(var(--destructive))",
            boxShadow: passed
              ? "0 0 32px oklch(var(--primary) / 0.25)"
              : "none",
          }}
        >
          {pct}%
        </motion.div>

        {/* Pass / Fail badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {passed ? (
            <Badge
              className="text-sm font-bold px-4 py-1.5 tracking-wide uppercase"
              style={{
                background: "var(--gradient-gold)",
                color: "oklch(var(--primary-foreground))",
                border: "none",
                boxShadow: "0 2px 12px oklch(var(--primary) / 0.3)",
              }}
              data-ocid="quiz.passed_badge"
            >
              ✦ PASSED ✦
            </Badge>
          ) : (
            <Badge
              className="text-sm font-bold px-4 py-1.5 tracking-wide uppercase"
              style={{
                background: "oklch(var(--destructive) / 0.15)",
                color: "oklch(var(--destructive))",
                border: "1px solid oklch(var(--destructive) / 0.4)",
              }}
              data-ocid="quiz.failed_badge"
            >
              ✗ FAILED
            </Badge>
          )}
        </motion.div>
      </div>

      {/* Score text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-1"
      >
        {passed ? (
          <p
            className="text-lg font-semibold font-display"
            style={{ color: "oklch(var(--primary))" }}
          >
            You scored {score}/{total} ({pct}%) — Well done!
          </p>
        ) : (
          <p
            className="text-base font-semibold font-display"
            style={{ color: "oklch(var(--destructive))" }}
          >
            You scored {score}/{total} ({pct}%) — Need 60% to pass.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {passed
            ? "Excellent work! You've demonstrated mastery of this lesson."
            : "Review the lesson material and try again — you've got this."}
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        {passed ? (
          <Button
            onClick={onContinue}
            className="font-semibold px-8 py-2.5"
            style={{
              background: "var(--gradient-gold)",
              color: "oklch(var(--primary-foreground))",
              boxShadow: "0 4px 16px oklch(var(--primary) / 0.28)",
            }}
            data-ocid="quiz.continue_button"
          >
            Continue to Next Lesson →
          </Button>
        ) : (
          <Button
            onClick={onRetry}
            variant="outline"
            className="font-semibold px-8 py-2.5 border-destructive/50 text-destructive hover:bg-destructive/10"
            data-ocid="quiz.retry_button"
          >
            Retry Quiz
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Completed state (already passed) ─────────────────────────────────────────
function CompletedState({
  score,
  total,
  onContinue,
}: {
  score?: number;
  total: number;
  onContinue: () => void;
}) {
  const pct =
    score != null && total > 0 ? Math.round((score / total) * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 text-center space-y-4"
      style={{
        background: "oklch(var(--primary) / 0.05)",
        borderColor: "oklch(var(--primary) / 0.3)",
        boxShadow: "0 0 32px oklch(var(--primary) / 0.1)",
      }}
      data-ocid="quiz.completed_state"
    >
      <div className="text-4xl">🏆</div>
      <div>
        <Badge
          className="text-sm font-bold px-4 py-1.5 mb-2"
          style={{
            background: "var(--gradient-gold)",
            color: "oklch(var(--primary-foreground))",
            border: "none",
          }}
        >
          ✦ PASSED ✦
        </Badge>
        {pct != null && (
          <p
            className="text-base font-semibold font-display mt-2"
            style={{ color: "oklch(var(--primary))" }}
          >
            Score: {score}/{total} ({pct}%) — Well done!
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          You have already completed this quiz.
        </p>
      </div>
      <Button
        onClick={onContinue}
        className="font-semibold"
        style={{
          background: "var(--gradient-gold)",
          color: "oklch(var(--primary-foreground))",
        }}
        data-ocid="quiz.completed_continue_button"
      >
        Continue to Next Lesson →
      </Button>
    </motion.div>
  );
}

// ── Main QuizEngine component ─────────────────────────────────────────────────
export interface QuizEngineProps {
  questions: QuizQuestion[];
  lessonId: number;
  isCompleted: boolean;
  quizScore?: number;
  onQuizPass: (result: QuizResult) => void;
  onQuizFail: (result: QuizResult) => void;
}

export function QuizEngine({
  questions,
  lessonId,
  isCompleted,
  quizScore,
  onQuizPass,
  onQuizFail,
}: QuizEngineProps) {
  const safeQuestions = questions ?? [];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const submitQuiz = useSubmitQuiz();

  const answeredCount = Object.keys(answers).length;
  const allAnswered =
    safeQuestions.length > 0 && answeredCount === safeQuestions.length;

  // ── Empty: no questions ──
  if (safeQuestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/30 bg-card/40 p-8 text-center space-y-2"
        data-ocid="quiz.empty_state"
      >
        <div className="text-3xl mb-2">📋</div>
        <h3 className="font-display font-semibold text-foreground text-base">
          Quiz Not Yet Available
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          The instructor hasn&apos;t added quiz questions for this lesson yet.
          Please check back later.
        </p>
      </motion.div>
    );
  }

  // ── Already completed ──
  if (isCompleted && result === null) {
    return (
      <CompletedState
        score={quizScore}
        total={safeQuestions.length}
        onContinue={() =>
          onQuizPass({
            lessonId,
            score: quizScore ?? safeQuestions.length,
            totalQuestions: safeQuestions.length,
            passed: true,
            courseProgress: {
              studentId: "",
              courseId: 0,
              completedLessonIds: [],
              overallPercent: 0,
              certificateEarned: false,
            },
          })
        }
      />
    );
  }

  // ── Score result screen ──
  if (result !== null) {
    return (
      <ScoreScreen
        score={result.score}
        total={result.totalQuestions}
        passed={result.passed}
        onRetry={() => {
          setAnswers({});
          setResult(null);
          setSubmitting(false);
        }}
        onContinue={() => onQuizPass(result)}
      />
    );
  }

  // ── Submit handler ──
  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const answerArr = safeQuestions.map((q) => answers[q.id] ?? 0);
      const res = await submitQuiz.mutateAsync({
        lessonId,
        answers: answerArr,
      });
      setResult(res);
      if (res.passed) {
        onQuizPass(res);
      } else {
        onQuizFail(res);
      }
    } catch {
      toast.error("Quiz submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  // ── Quiz form ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
      data-ocid="quiz.engine"
    >
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: "oklch(var(--accent) / 0.18)",
            color: "oklch(var(--accent))",
          }}
        >
          ?
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-foreground text-base leading-tight">
            Lesson Quiz
          </h3>
          <p className="text-xs text-muted-foreground">
            {safeQuestions.length} questions · Minimum 60% to pass
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-semibold shrink-0"
          style={{
            borderColor: "oklch(var(--accent) / 0.4)",
            color: "oklch(var(--accent))",
          }}
        >
          {answeredCount}/{safeQuestions.length} answered
        </Badge>
      </div>

      {/* Gold progress bar */}
      <QuizProgressBar answered={answeredCount} total={safeQuestions.length} />

      {/* Question cards */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {safeQuestions.map((q, qi) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.05, duration: 0.3 }}
              className="rounded-2xl border p-5 space-y-3 transition-all duration-200"
              style={{
                background: "oklch(var(--card) / 0.65)",
                borderColor:
                  answers[q.id] !== undefined
                    ? "oklch(var(--accent) / 0.3)"
                    : "oklch(var(--border) / 0.3)",
                backdropFilter: "blur(12px)",
                boxShadow:
                  answers[q.id] !== undefined
                    ? "0 0 16px oklch(var(--accent) / 0.08)"
                    : "none",
              }}
              data-ocid={`quiz.question.${qi + 1}`}
            >
              {/* Question header */}
              <div className="flex items-start gap-2.5">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background:
                      answers[q.id] !== undefined
                        ? "oklch(var(--accent) / 0.2)"
                        : "oklch(var(--muted) / 0.5)",
                    color:
                      answers[q.id] !== undefined
                        ? "oklch(var(--accent))"
                        : "oklch(var(--muted-foreground))",
                  }}
                >
                  {qi + 1}
                </span>
                <p
                  className="text-sm font-semibold leading-snug flex-1 min-w-0"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {q.question ?? ""}
                </p>
              </div>

              {/* Answer options */}
              <div className="space-y-2 pl-9">
                {(q.options ?? []).map((opt, oi) => (
                  <AnswerOption
                    key={`opt-${q.id}-${oi}`}
                    label={String.fromCharCode(65 + oi)}
                    text={opt ?? ""}
                    isSelected={answers[q.id] === oi}
                    disabled={submitting}
                    onClick={() =>
                      !submitting &&
                      setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                    }
                    ocid={`quiz.option.${qi + 1}.${oi + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit bar */}
      <motion.div
        layout
        className="flex items-center justify-between pt-1 border-t border-border/30 gap-3"
      >
        <div className="text-xs text-muted-foreground">
          {allAnswered ? (
            <span
              className="font-semibold"
              style={{ color: "oklch(var(--primary))" }}
            >
              ✓ All questions answered — ready to submit
            </span>
          ) : (
            <span>
              {safeQuestions.length - answeredCount} question
              {safeQuestions.length - answeredCount !== 1 ? "s" : ""} remaining
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {allAnswered && (
            <motion.div
              key="submit-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <Button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="font-bold px-8 py-2.5 min-w-[140px]"
                style={{
                  background: "var(--gradient-gold)",
                  color: "oklch(var(--primary-foreground))",
                  boxShadow: "0 4px 16px oklch(var(--primary) / 0.3)",
                }}
                data-ocid="quiz.submit_button"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  "Submit Quiz →"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
