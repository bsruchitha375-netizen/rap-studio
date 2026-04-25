/**
 * LessonQuizManager — Full lesson + quiz CRUD panel for admin CMS.
 * All buttons ALWAYS VISIBLE — no auto-hide, no setTimeout visibility logic.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronLeft,
  Edit3,
  HelpCircle,
  Play,
  Plus,
  Save,
  Trash2,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddLesson,
  useAddQuizQuestion,
  useEditLesson,
  useEditQuizQuestion,
  useRemoveLesson,
  useRemoveQuizQuestion,
} from "../../hooks/useBackend";
import type { Lesson, QuizQuestion } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function YoutubeThumbnail({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const ytId = getYoutubeId(url);
  if (!ytId) {
    return (
      <div className="w-full h-24 bg-muted/20 rounded-lg flex items-center justify-center border border-border/30">
        <Youtube className="w-6 h-6 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border/30">
      <img
        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
          <Play className="w-4 h-4 text-white ml-0.5" />
        </div>
      </div>
    </div>
  );
}

// ── Lesson Form ───────────────────────────────────────────────────────────────

interface LessonFormData {
  title: string;
  description: string;
  youtubeUrl: string;
  order: number;
}

function emptyLessonForm(order: number): LessonFormData {
  return { title: "", description: "", youtubeUrl: "", order };
}

function LessonForm({
  initial,
  onSave,
  onCancel,
  saving,
  ocidPrefix,
}: {
  initial: LessonFormData;
  onSave: (data: LessonFormData) => void;
  onCancel: () => void;
  saving: boolean;
  ocidPrefix: string;
}) {
  const [form, setForm] = useState<LessonFormData>(initial);
  const ytId = getYoutubeId(form.youtubeUrl);

  return (
    <div
      className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
      data-ocid={`${ocidPrefix}-form`}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label
            htmlFor={`${ocidPrefix}-title`}
            className="text-[10px] font-semibold text-muted-foreground block mb-1"
          >
            Lesson Title *
          </label>
          <Input
            id={`${ocidPrefix}-title`}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Introduction to Lighting"
            className="h-9 text-sm bg-background/60 border-border/50"
            data-ocid={`${ocidPrefix}-title-input`}
          />
        </div>
        <div>
          <label
            htmlFor={`${ocidPrefix}-order`}
            className="text-[10px] font-semibold text-muted-foreground block mb-1"
          >
            Order (number)
          </label>
          <Input
            id={`${ocidPrefix}-order`}
            type="number"
            min={1}
            value={form.order}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                order: Math.max(1, Number.parseInt(e.target.value, 10) || 1),
              }))
            }
            className="h-9 text-sm bg-background/60 border-border/50"
            data-ocid={`${ocidPrefix}-order-input`}
          />
        </div>
        <div>
          <label
            htmlFor={`${ocidPrefix}-youtube`}
            className="text-[10px] font-semibold text-muted-foreground block mb-1"
          >
            YouTube URL
          </label>
          <Input
            id={`${ocidPrefix}-youtube`}
            value={form.youtubeUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, youtubeUrl: e.target.value }))
            }
            placeholder="https://youtube.com/watch?v=..."
            className="h-9 text-sm bg-background/60 border-border/50"
            data-ocid={`${ocidPrefix}-youtube-input`}
          />
        </div>
        <div className="col-span-2">
          <label
            htmlFor={`${ocidPrefix}-desc`}
            className="text-[10px] font-semibold text-muted-foreground block mb-1"
          >
            Description
          </label>
          <textarea
            id={`${ocidPrefix}-desc`}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Brief lesson description..."
            rows={2}
            className="w-full rounded-md border border-border/50 bg-background/60 text-foreground text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-ocid={`${ocidPrefix}-desc-input`}
          />
        </div>
      </div>
      {ytId && (
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">
            YouTube Preview
          </p>
          <YoutubeThumbnail url={form.youtubeUrl} title={form.title} />
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim()}
          data-ocid={`${ocidPrefix}-save-btn`}
        >
          {saving ? (
            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
          ) : (
            <Save className="w-3 h-3 mr-1" />
          )}
          Save Lesson
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs border-border/50"
          onClick={onCancel}
          data-ocid={`${ocidPrefix}-cancel-btn`}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Quiz Question Form ────────────────────────────────────────────────────────

interface QuizFormData {
  question: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
}

function emptyQuizForm(): QuizFormData {
  return {
    question: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
  };
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function QuizQuestionForm({
  initial,
  onSave,
  onCancel,
  saving,
  ocidPrefix,
}: {
  initial: QuizFormData;
  onSave: (data: QuizFormData) => void;
  onCancel: () => void;
  saving: boolean;
  ocidPrefix: string;
}) {
  const [form, setForm] = useState<QuizFormData>(initial);

  return (
    <div
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3"
      data-ocid={`${ocidPrefix}-quiz-form`}
    >
      <div>
        <label
          htmlFor={`${ocidPrefix}-quiz-q`}
          className="text-[10px] font-semibold text-muted-foreground block mb-1"
        >
          Question Text *
        </label>
        <textarea
          id={`${ocidPrefix}-quiz-q`}
          value={form.question}
          onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
          placeholder="e.g. What is the golden hour in photography?"
          rows={2}
          className="w-full rounded-md border border-border/50 bg-background/60 text-foreground text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          data-ocid={`${ocidPrefix}-quiz-question-input`}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {OPTION_LABELS.map((label, idx) => (
          <div key={label}>
            <label
              htmlFor={`${ocidPrefix}-quiz-opt-${label.toLowerCase()}`}
              className="text-[10px] font-semibold text-muted-foreground block mb-1"
            >
              Option {label}
            </label>
            <Input
              id={`${ocidPrefix}-quiz-opt-${label.toLowerCase()}`}
              value={form.options[idx]}
              onChange={(e) => {
                const opts = [...form.options] as [
                  string,
                  string,
                  string,
                  string,
                ];
                opts[idx] = e.target.value;
                setForm((p) => ({ ...p, options: opts }));
              }}
              placeholder={`Option ${label}...`}
              className="h-8 text-xs bg-background/60 border-border/50"
              data-ocid={`${ocidPrefix}-quiz-option-${label.toLowerCase()}-input`}
            />
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground mb-2">
          Correct Answer
        </p>
        <div className="flex gap-2">
          {OPTION_LABELS.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, correctOptionIndex: idx }))
              }
              className={`h-8 w-12 rounded-lg border text-xs font-bold transition-all ${
                form.correctOptionIndex === idx
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              data-ocid={`${ocidPrefix}-quiz-correct-${label.toLowerCase()}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => onSave(form)}
          disabled={saving || !form.question.trim()}
          data-ocid={`${ocidPrefix}-quiz-save-btn`}
        >
          {saving ? (
            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
          ) : (
            <Check className="w-3 h-3 mr-1" />
          )}
          Save Question
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs border-border/50"
          onClick={onCancel}
          data-ocid={`${ocidPrefix}-quiz-cancel-btn`}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Quiz Editor for a single lesson ──────────────────────────────────────────

function QuizEditor({
  lesson,
  courseId,
  onBack,
}: {
  lesson: Lesson;
  courseId: number;
  onBack: () => void;
}) {
  const addQuizMutation = useAddQuizQuestion();
  const editQuizMutation = useEditQuizQuestion();
  const removeQuizMutation = useRemoveQuizQuestion();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQId, setEditingQId] = useState<number | null>(null);
  const [savingQId, setSavingQId] = useState<number | null>(null);
  const [confirmDeleteQId, setConfirmDeleteQId] = useState<number | null>(null);

  const questions = lesson.quizQuestions ?? [];
  const questionCount = questions.length;
  const MIN_QUESTIONS = 10;

  async function handleAddQuestion(data: QuizFormData) {
    setSavingQId(-1);
    try {
      await addQuizMutation.mutateAsync({
        lessonId: lesson.id,
        courseId,
        question: data.question,
        options: data.options as string[],
        correctOptionIndex: data.correctOptionIndex,
      });
      toast.success("Question added");
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add question");
    }
    setSavingQId(null);
  }

  async function handleEditQuestion(qId: number, data: QuizFormData) {
    setSavingQId(qId);
    try {
      await editQuizMutation.mutateAsync({
        questionId: qId,
        lessonId: lesson.id,
        courseId,
        question: data.question,
        options: data.options as string[],
        correctOptionIndex: data.correctOptionIndex,
      });
      toast.success("Question updated");
      setEditingQId(null);
    } catch {
      toast.error("Failed to update question");
    }
    setSavingQId(null);
  }

  async function handleRemoveQuestion(qId: number) {
    try {
      await removeQuizMutation.mutateAsync({ questionId: qId, courseId });
      toast.success("Question removed");
    } catch {
      toast.error("Failed to remove question");
    }
    setConfirmDeleteQId(null);
  }

  return (
    <div
      className="space-y-4"
      data-ocid={`cms-quiz-editor-lesson-${lesson.id}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs border-border/50 gap-1"
          onClick={onBack}
          data-ocid="cms-quiz-back-btn"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Lessons
        </Button>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">
            Quiz: {lesson.title}
          </h4>
        </div>
      </div>

      {/* Question count indicator */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
          questionCount >= MIN_QUESTIONS
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        }`}
        data-ocid="cms-quiz-count-indicator"
      >
        {questionCount >= MIN_QUESTIONS ? (
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        <span className="font-semibold">
          {questionCount}/{MIN_QUESTIONS} questions
        </span>
        {questionCount < MIN_QUESTIONS && (
          <span className="text-muted-foreground">
            — Need at least {MIN_QUESTIONS} questions for the quiz
          </span>
        )}
      </div>

      {/* Add question button — always visible */}
      <Button
        type="button"
        size="sm"
        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
        onClick={() => {
          setShowAddForm(true);
          setEditingQId(null);
        }}
        data-ocid="cms-quiz-add-question-btn"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Question
      </Button>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <QuizQuestionForm
              initial={emptyQuizForm()}
              onSave={handleAddQuestion}
              onCancel={() => setShowAddForm(false)}
              saving={savingQId === -1}
              ocidPrefix="cms-quiz-add"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div
          className="py-8 text-center text-muted-foreground text-sm"
          data-ocid="cms-quiz-empty_state"
        >
          <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No questions yet. Add at least {MIN_QUESTIONS} questions.
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, qi) => (
            <div
              key={q.id}
              className="rounded-xl border border-border/40 bg-background/40 p-3"
              data-ocid={`cms-quiz-question.${qi + 1}`}
            >
              {editingQId === q.id ? (
                <QuizQuestionForm
                  initial={{
                    question: q.question,
                    options: q.options as [string, string, string, string],
                    correctOptionIndex: q.correctOptionIndex,
                  }}
                  onSave={(data) => handleEditQuestion(q.id, data)}
                  onCancel={() => setEditingQId(null)}
                  saving={savingQId === q.id}
                  ocidPrefix={`cms-quiz-edit-${qi}`}
                />
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {qi + 1}
                      </span>
                      <p className="text-sm text-foreground font-medium leading-tight">
                        {q.question}
                      </p>
                    </div>
                    {/* Always-visible action buttons */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => setEditingQId(q.id)}
                        aria-label="Edit question"
                        data-ocid={`cms-quiz-edit-btn.${qi + 1}`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => setConfirmDeleteQId(q.id)}
                        aria-label="Remove question"
                        data-ocid={`cms-quiz-remove-btn.${qi + 1}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 ml-7">
                    {q.options.map((opt, oi) => (
                      <div
                        key={OPTION_LABELS[oi]}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] ${
                          oi === q.correctOptionIndex
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        <span className="font-bold text-[9px]">
                          {OPTION_LABELS[oi]}
                        </span>
                        <span className="truncate">{opt}</span>
                        {oi === q.correctOptionIndex && (
                          <Check className="w-3 h-3 ml-auto flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDeleteQId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="cms-quiz-delete-dialog"
        >
          <div className="rounded-2xl border border-red-500/30 bg-card p-5 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display font-bold text-foreground mb-2">
              Remove Question?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently remove the quiz question.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border/50"
                onClick={() => setConfirmDeleteQId(null)}
                data-ocid="cms-quiz-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleRemoveQuestion(confirmDeleteQId!)}
                data-ocid="cms-quiz-delete-confirm-btn"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main LessonQuizManager ────────────────────────────────────────────────────

export function LessonQuizManager({
  courseId,
  courseTitle,
  lessons,
  onBack,
}: {
  courseId: number;
  courseTitle: string;
  lessons: Lesson[];
  onBack: () => void;
}) {
  const addLessonMutation = useAddLesson();
  const editLessonMutation = useEditLesson();
  const removeLessonMutation = useRemoveLesson();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [managingQuizLesson, setManagingQuizLesson] = useState<Lesson | null>(
    null,
  );
  const [savingLessonId, setSavingLessonId] = useState<number | null>(null);
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<
    number | null
  >(null);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  // If in quiz editing mode, render quiz editor
  if (managingQuizLesson) {
    return (
      <QuizEditor
        lesson={managingQuizLesson}
        courseId={courseId}
        onBack={() => setManagingQuizLesson(null)}
      />
    );
  }

  async function handleAddLesson(data: LessonFormData) {
    setSavingLessonId(-1);
    try {
      await addLessonMutation.mutateAsync({
        courseId,
        title: data.title,
        description: data.description,
        youtubeUrl: data.youtubeUrl,
        order: data.order,
      });
      toast.success("Lesson added");
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add lesson");
    }
    setSavingLessonId(null);
  }

  async function handleEditLesson(lessonId: number, data: LessonFormData) {
    setSavingLessonId(lessonId);
    try {
      await editLessonMutation.mutateAsync({
        lessonId,
        courseId,
        title: data.title,
        description: data.description,
        youtubeUrl: data.youtubeUrl,
        order: data.order,
      });
      toast.success("Lesson updated");
      setEditingLessonId(null);
    } catch {
      toast.error("Failed to update lesson");
    }
    setSavingLessonId(null);
  }

  async function handleRemoveLesson(lessonId: number) {
    try {
      await removeLessonMutation.mutateAsync({ lessonId, courseId });
      toast.success("Lesson removed");
    } catch {
      toast.error("Failed to remove lesson");
    }
    setConfirmDeleteLessonId(null);
  }

  return (
    <div className="space-y-4" ref={topRef}>
      {/* Header with back button */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/30">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs border-border/50 gap-1 flex-shrink-0"
          onClick={onBack}
          data-ocid="cms-lessons-back-btn"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Courses
        </Button>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-foreground text-sm truncate">
            Lessons for: {courseTitle}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            {sortedLessons.length} lesson
            {sortedLessons.length !== 1 ? "s" : ""} — each lesson requires 10+
            quiz questions for certificate
          </p>
        </div>
      </div>

      {/* Add Lesson button — always visible */}
      <Button
        type="button"
        size="sm"
        className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
        onClick={() => {
          setShowAddForm(true);
          setEditingLessonId(null);
        }}
        data-ocid="cms-lessons-add-btn"
      >
        <Plus className="w-3.5 h-3.5" />
        Add New Lesson
      </Button>

      {/* Add lesson form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <LessonForm
              initial={emptyLessonForm(sortedLessons.length + 1)}
              onSave={handleAddLesson}
              onCancel={() => setShowAddForm(false)}
              saving={savingLessonId === -1}
              ocidPrefix="cms-lesson-add"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lessons list */}
      {sortedLessons.length === 0 ? (
        <div
          className="py-10 text-center text-muted-foreground text-sm"
          data-ocid="cms-lessons-empty_state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p>No lessons yet. Add the first lesson above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedLessons.map((lesson, li) => (
            <div
              key={lesson.id}
              className="rounded-xl border border-border/40 bg-background/40 overflow-hidden"
              data-ocid={`cms-lesson-item.${li + 1}`}
            >
              {editingLessonId === lesson.id ? (
                <div className="p-3">
                  <LessonForm
                    initial={{
                      title: lesson.title,
                      description: lesson.description,
                      youtubeUrl: lesson.youtubeUrl,
                      order: lesson.order,
                    }}
                    onSave={(data) => handleEditLesson(lesson.id, data)}
                    onCancel={() => setEditingLessonId(null)}
                    saving={savingLessonId === lesson.id}
                    ocidPrefix={`cms-lesson-edit-${li}`}
                  />
                </div>
              ) : (
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Order badge */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">
                        {lesson.order}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {lesson.title}
                      </p>
                      {lesson.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        {lesson.youtubeUrl ? (
                          <span className="flex items-center gap-1 text-red-400">
                            <Youtube className="w-3 h-3" />
                            YouTube linked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Youtube className="w-3 h-3 opacity-40" />
                            No video
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-amber-400">
                          <HelpCircle className="w-3 h-3" />
                          {lesson.quizQuestions?.length ?? 0}/10 questions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* YouTube thumbnail preview */}
                  {lesson.youtubeUrl && (
                    <div className="mt-2 ml-10">
                      <YoutubeThumbnail
                        url={lesson.youtubeUrl}
                        title={lesson.title}
                      />
                    </div>
                  )}

                  {/* Always-visible action buttons */}
                  <div className="flex gap-1.5 flex-wrap mt-3 ml-10">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => setEditingLessonId(lesson.id)}
                      data-ocid={`cms-lesson-edit-btn.${li + 1}`}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => setManagingQuizLesson(lesson)}
                      data-ocid={`cms-lesson-manage-quiz-btn.${li + 1}`}
                    >
                      <HelpCircle className="w-3 h-3 mr-1" />
                      Manage Quiz
                      {(lesson.quizQuestions?.length ?? 0) >= 10 && (
                        <Check className="w-3 h-3 ml-1 text-emerald-400" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-border/40 hover:bg-muted/30"
                      onClick={() => setPreviewLesson(lesson)}
                      data-ocid={`cms-lesson-preview-btn.${li + 1}`}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => setConfirmDeleteLessonId(lesson.id)}
                      data-ocid={`cms-lesson-remove-btn.${li + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lesson preview modal */}
      {previewLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="cms-lesson-preview-dialog"
        >
          <div className="rounded-2xl border border-primary/30 bg-card p-5 max-w-md w-full mx-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground text-sm">
                Lesson Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="w-7 h-7 rounded-full hover:bg-muted/40 flex items-center justify-center"
                aria-label="Close preview"
                data-ocid="cms-lesson-preview-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <YoutubeThumbnail
              url={previewLesson.youtubeUrl}
              title={previewLesson.title}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold">
                  Lesson {previewLesson.order}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${
                    (previewLesson.quizQuestions?.length ?? 0) >= 10
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  }`}
                >
                  {previewLesson.quizQuestions?.length ?? 0}/10 Quiz Questions
                </span>
              </div>
              <p className="font-bold text-foreground">{previewLesson.title}</p>
              {previewLesson.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {previewLesson.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDeleteLessonId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="cms-lesson-delete-dialog"
        >
          <div className="rounded-2xl border border-red-500/30 bg-card p-5 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display font-bold text-foreground mb-2">
              Remove Lesson?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently remove the lesson and all its quiz
              questions.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border/50"
                onClick={() => setConfirmDeleteLessonId(null)}
                data-ocid="cms-lesson-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleRemoveLesson(confirmDeleteLessonId!)}
                data-ocid="cms-lesson-delete-confirm-btn"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
