import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  CheckCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddQuizQuestion,
  useEditQuizQuestion,
  useRemoveQuizQuestion,
} from "../../hooks/useBackend";
import type { Lesson, QuizQuestion } from "../../types";

const OPTION_LABELS = ["A", "B", "C", "D"];

// ── Question form ─────────────────────────────────────────────────────────────
interface QuestionFormData {
  question: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
}

const BLANK_FORM: QuestionFormData = {
  question: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
};

interface QuestionFormProps {
  lessonId: number;
  courseId: number;
  initial?: QuestionFormData & { questionId: number };
  onDone: () => void;
}

function QuestionForm({
  lessonId,
  courseId,
  initial,
  onDone,
}: QuestionFormProps) {
  const addQuestion = useAddQuizQuestion();
  const editQuestion = useEditQuizQuestion();
  const isEdit = !!initial?.questionId;

  const [form, setForm] = useState<QuestionFormData>(
    initial
      ? {
          question: initial.question,
          options: [...initial.options] as [string, string, string, string],
          correctOptionIndex: initial.correctOptionIndex,
        }
      : {
          ...BLANK_FORM,
          options: [...BLANK_FORM.options] as [string, string, string, string],
        },
  );
  const [saving, setSaving] = useState(false);

  function setOption(idx: number, val: string) {
    setForm((p) => {
      const opts = [...p.options] as [string, string, string, string];
      opts[idx] = val;
      return { ...p, options: opts };
    });
  }

  async function handleSave() {
    if (!form.question.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (form.options.some((o) => !o.trim())) {
      toast.error("All 4 options are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && initial?.questionId) {
        await editQuestion.mutateAsync({
          questionId: initial.questionId,
          lessonId,
          courseId,
          question: form.question.trim(),
          options: form.options.map((o) => o.trim()),
          correctOptionIndex: form.correctOptionIndex,
        });
        toast.success("Question updated");
      } else {
        await addQuestion.mutateAsync({
          lessonId,
          courseId,
          question: form.question.trim(),
          options: form.options.map((o) => o.trim()),
          correctOptionIndex: form.correctOptionIndex,
        });
        toast.success("Question added");
      }
      onDone();
    } catch {
      toast.error(
        isEdit ? "Failed to update question" : "Failed to add question",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-primary/30 bg-card/80 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground">
          {isEdit ? "Edit Question" : "Add Question"}
        </p>
        <button
          type="button"
          onClick={onDone}
          className="p-1 rounded hover:bg-muted/50 text-muted-foreground"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question text */}
      <div>
        <label
          htmlFor="quiz-question-text"
          className="text-xs font-semibold text-muted-foreground block mb-1"
        >
          Question *
        </label>
        <Input
          id="quiz-question-text"
          placeholder="e.g. What is the aperture setting for shallow depth of field?"
          value={form.question}
          onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
          className="bg-background text-foreground border-border"
          data-ocid="quiz-question.input"
        />
      </div>

      {/* Options */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Options — select the correct answer
        </p>
        {OPTION_LABELS.map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, correctOptionIndex: idx }))
              }
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                form.correctOptionIndex === idx
                  ? "border-emerald-500 bg-emerald-500/20"
                  : "border-border hover:border-primary/40"
              }`}
              aria-label={`Mark option ${label} correct`}
              data-ocid={`quiz-correct-radio.${idx + 1}`}
            >
              {form.correctOptionIndex === idx && (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
            <span
              className={`w-5 text-xs font-bold flex-shrink-0 ${
                form.correctOptionIndex === idx
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            <Input
              placeholder={`Option ${label}`}
              value={form.options[idx]}
              onChange={(e) => setOption(idx, e.target.value)}
              className={`bg-background text-foreground border-border text-sm ${
                form.correctOptionIndex === idx
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : ""
              }`}
              data-ocid={`quiz-option-${label.toLowerCase()}.input`}
              aria-label={`Option ${label}`}
            />
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground pl-8">
          Click the circle next to an option to mark it as the correct answer
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border text-foreground"
          onClick={onDone}
          data-ocid="quiz-form.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={() => void handleSave()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          data-ocid="quiz-form.save_button"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
          ) : isEdit ? (
            "Save Changes"
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Question
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ── Question row ──────────────────────────────────────────────────────────────
function QuestionRow({
  question,
  lessonId,
  courseId,
  index,
}: {
  question: QuizQuestion;
  lessonId: number;
  courseId: number;
  index: number;
}) {
  const removeQuestion = useRemoveQuizQuestion();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    try {
      await removeQuestion.mutateAsync({ questionId: question.id, courseId });
      toast.success("Question removed");
    } catch {
      toast.error("Failed to remove question");
    }
    setConfirmDelete(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border border-border/60 bg-card/60"
      data-ocid={`quiz-question-row.${index + 1}`}
    >
      {/* Row header */}
      <div className="p-3 flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-semibold leading-snug">
            {question.question}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {question.options.map((opt, idx) => (
              <div
                key={`${question.id}-opt-${idx}`}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs border ${
                  idx === question.correctOptionIndex
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "bg-muted/30 border-border/40 text-muted-foreground"
                }`}
              >
                <span className="font-bold flex-shrink-0">
                  {OPTION_LABELS[idx]}.
                </span>
                <span className="truncate">{opt}</span>
                {idx === question.correctOptionIndex && (
                  <CheckCircle className="w-3 h-3 flex-shrink-0 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-border hover:border-primary/40 text-muted-foreground hover:text-primary"
            onClick={() => setEditing((p) => !p)}
            aria-label="Edit question"
            data-ocid={`quiz-edit-btn.${index + 1}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-red-500/30 text-red-500 hover:bg-red-500/10"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete question"
            data-ocid={`quiz-delete-btn.${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <div className="px-3 pb-3">
            <QuestionForm
              lessonId={lessonId}
              courseId={courseId}
              initial={{
                questionId: question.id,
                question: question.question,
                options: question.options as [string, string, string, string],
                correctOptionIndex: question.correctOptionIndex,
              }}
              onDone={() => setEditing(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="quiz-delete-confirm.dialog"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-red-500/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl text-center"
          >
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h4 className="font-display font-bold text-foreground mb-1 text-sm">
              Remove this question?
            </h4>
            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
              &ldquo;{question.question}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                data-ocid="quiz-delete-confirm.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => void handleDelete()}
                data-ocid="quiz-delete-confirm.confirm_button"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ── QuizBuilder ───────────────────────────────────────────────────────────────
interface QuizBuilderProps {
  lesson: Lesson;
  courseId: number;
}

export function QuizBuilder({ lesson, courseId }: QuizBuilderProps) {
  const questions = lesson.quizQuestions ?? [];
  const [showAddForm, setShowAddForm] = useState(false);
  const count = questions.length;
  const needsMore = count < 10;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge
            className={`text-[10px] border font-bold ${count >= 10 ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"}`}
          >
            {count} / 10 questions
          </Badge>
        </div>
        {!showAddForm && (
          <Button
            type="button"
            size="sm"
            className="text-xs h-7 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 font-semibold"
            onClick={() => setShowAddForm(true)}
            data-ocid="quiz-add-question-btn"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Question
          </Button>
        )}
      </div>

      {/* Warning if < 10 questions */}
      {needsMore && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/8 px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            ⚠ Add at least 10 questions for this quiz ({10 - count} more needed)
          </p>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <QuestionForm
            lessonId={lesson.id}
            courseId={courseId}
            onDone={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Question list */}
      {questions.length === 0 ? (
        <div
          className="text-center py-6 rounded-xl border border-dashed border-border bg-muted/10"
          data-ocid="quiz-builder.empty_state"
        >
          <p className="text-sm text-muted-foreground font-medium">
            No questions yet
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Add at least 10 questions — students must pass to earn a certificate
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <QuestionRow
              key={q.id}
              question={q}
              lessonId={lesson.id}
              courseId={courseId}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
