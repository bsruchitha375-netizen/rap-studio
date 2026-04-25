import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddLesson,
  useAdminLessons,
  useEditLesson,
  useRemoveLesson,
} from "../../hooks/useBackend";
import type { Lesson } from "../../types";
import { QuizBuilder } from "./QuizBuilder";

// ── YouTube helpers ───────────────────────────────────────────────────────────
const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
];

function extractVideoId(url: string): string | null {
  for (const pat of YT_PATTERNS) {
    const m = pat.exec(url);
    if (m) return m[1];
  }
  return null;
}

function YoutubeThumbnail({ url }: { url: string }) {
  const id = extractVideoId(url);
  if (!id) return null;
  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-primary/30 aspect-video w-full max-w-xs">
      <img
        src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
        alt="YouTube thumbnail"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

// ── Lesson form ───────────────────────────────────────────────────────────────
interface LessonFormData {
  title: string;
  description: string;
  youtubeUrl: string;
  order: number;
}

function isValidYoutubeUrl(url: string): boolean {
  return !!extractVideoId(url);
}

interface LessonFormProps {
  courseId: number;
  initial?: LessonFormData & { lessonId?: number };
  totalLessons: number;
  onDone: () => void;
}

function LessonForm({
  courseId,
  initial,
  totalLessons,
  onDone,
}: LessonFormProps) {
  const addLesson = useAddLesson();
  const editLesson = useEditLesson();
  const isEdit = !!initial?.lessonId;

  const [form, setForm] = useState<LessonFormData>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    youtubeUrl: initial?.youtubeUrl ?? "",
    order: initial?.order ?? totalLessons + 1,
  });
  const [urlError, setUrlError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof LessonFormData, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    if (form.youtubeUrl && !isValidYoutubeUrl(form.youtubeUrl)) {
      setUrlError(
        "Enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)",
      );
      return;
    }
    setUrlError("");
    setSaving(true);
    try {
      if (isEdit && initial?.lessonId) {
        await editLesson.mutateAsync({
          lessonId: initial.lessonId,
          courseId,
          title: form.title.trim(),
          description: form.description.trim(),
          youtubeUrl: form.youtubeUrl.trim(),
          order: form.order,
        });
        toast.success("Lesson updated");
      } else {
        await addLesson.mutateAsync({
          courseId,
          title: form.title.trim(),
          description: form.description.trim(),
          youtubeUrl: form.youtubeUrl.trim(),
          order: form.order,
        });
        toast.success("Lesson added");
      }
      onDone();
    } catch {
      toast.error(isEdit ? "Failed to update lesson" : "Failed to add lesson");
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
        <h4 className="font-display font-bold text-foreground text-sm">
          {isEdit ? "Edit Lesson" : "Add New Lesson"}
        </h4>
        <button
          type="button"
          onClick={onDone}
          className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground"
          aria-label="Close form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-3">
        <div>
          <label
            htmlFor="lesson-title"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            Title *
          </label>
          <Input
            id="lesson-title"
            placeholder="e.g. Introduction to Camera Settings"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="bg-background text-foreground border-border"
            data-ocid="lesson-title.input"
          />
        </div>
        <div>
          <label
            htmlFor="lesson-description"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            Description
          </label>
          <Input
            id="lesson-description"
            placeholder="Brief description of this lesson"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="bg-background text-foreground border-border"
            data-ocid="lesson-description.input"
          />
        </div>
        <div>
          <label
            htmlFor="lesson-youtube-url"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            <Youtube className="w-3.5 h-3.5 inline mr-1 text-red-500" />
            YouTube URL
          </label>
          <Input
            id="lesson-youtube-url"
            placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
            value={form.youtubeUrl}
            onChange={(e) => {
              set("youtubeUrl", e.target.value);
              if (urlError) setUrlError("");
            }}
            className={`bg-background text-foreground border-border font-mono text-xs ${urlError ? "border-destructive" : ""}`}
            data-ocid="lesson-youtube-url.input"
          />
          {urlError && (
            <p className="text-xs text-destructive mt-1">{urlError}</p>
          )}
          {form.youtubeUrl && isValidYoutubeUrl(form.youtubeUrl) && (
            <YoutubeThumbnail url={form.youtubeUrl} />
          )}
        </div>
        <div>
          <label
            htmlFor="lesson-order"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            Order
          </label>
          <Input
            id="lesson-order"
            type="number"
            min={1}
            value={form.order}
            onChange={(e) => set("order", Number.parseInt(e.target.value) || 1)}
            className="bg-background text-foreground border-border w-24"
            data-ocid="lesson-order.input"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border text-foreground"
          onClick={onDone}
          data-ocid="lesson-form.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={() => void handleSave()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          data-ocid="lesson-form.save_button"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
          ) : (
            <>{isEdit ? "Save Changes" : "Add Lesson"}</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ── Lesson row ────────────────────────────────────────────────────────────────
function LessonRow({
  lesson,
  courseId,
  index,
}: {
  lesson: Lesson;
  courseId: number;
  index: number;
}) {
  const removeLesson = useRemoveLesson();
  const [editing, setEditing] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const thumbId = extractVideoId(lesson.youtubeUrl ?? "");
  const questionCount = lesson.quizQuestions?.length ?? 0;

  async function handleDelete() {
    try {
      await removeLesson.mutateAsync({ lessonId: lesson.id, courseId });
      toast.success("Lesson removed");
    } catch {
      toast.error("Failed to remove lesson");
    }
    setConfirmDelete(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border/60 bg-card"
      data-ocid={`lesson-row.${index + 1}`}
    >
      {/* Lesson header */}
      <div className="flex items-center gap-3 p-3">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />

        {/* Thumbnail */}
        {thumbId ? (
          <div className="w-12 h-9 rounded overflow-hidden flex-shrink-0 border border-border">
            <img
              src={`https://img.youtube.com/vi/${thumbId}/default.jpg`}
              alt="Thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-9 rounded bg-muted/40 border border-border flex items-center justify-center flex-shrink-0">
            <Youtube className="w-4 h-4 text-muted-foreground/40" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground">
              Order: {lesson.order}
            </span>
            <Badge
              className={`text-[10px] border font-semibold ${questionCount >= 10 ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : questionCount > 0 ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30" : "bg-muted/40 text-muted-foreground border-border/40"}`}
            >
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </Badge>
            {!lesson.youtubeUrl && (
              <Badge className="text-[10px] bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 font-semibold">
                No video
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-border text-muted-foreground hover:text-primary hover:border-primary/40"
            onClick={() => {
              setShowQuiz((p) => !p);
              setEditing(false);
            }}
            aria-label="Manage quiz"
            data-ocid={`lesson-quiz-btn.${index + 1}`}
          >
            {showQuiz ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-border text-muted-foreground hover:text-primary hover:border-primary/40"
            onClick={() => {
              setEditing((p) => !p);
              setShowQuiz(false);
            }}
            aria-label="Edit lesson"
            data-ocid={`lesson-edit-btn.${index + 1}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-red-500/30 text-red-500 hover:bg-red-500/10"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete lesson"
            data-ocid={`lesson-delete-btn.${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <div className="px-3 pb-3">
            <LessonForm
              courseId={courseId}
              initial={{
                lessonId: lesson.id,
                title: lesson.title,
                description: lesson.description,
                youtubeUrl: lesson.youtubeUrl ?? "",
                order: lesson.order,
              }}
              totalLessons={0}
              onDone={() => setEditing(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Quiz builder */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border/60 pt-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Quiz — Lesson: {lesson.title}
                </span>
              </div>
              <QuizBuilder lesson={lesson} courseId={courseId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="lesson-delete-confirm.dialog"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-red-500/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl text-center"
          >
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h4 className="font-display font-bold text-foreground mb-1 text-sm">
              Remove &ldquo;{lesson.title}&rdquo;?
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              This will permanently delete the lesson and all its quiz
              questions.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                data-ocid="lesson-delete-confirm.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => void handleDelete()}
                data-ocid="lesson-delete-confirm.confirm_button"
              >
                Delete Lesson
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ── LessonEditor main component ───────────────────────────────────────────────
interface LessonEditorProps {
  courseId: number;
  courseTitle: string;
  onCollapse: () => void;
}

export function LessonEditor({
  courseId,
  courseTitle,
  onCollapse,
}: LessonEditorProps) {
  const { data: lessons = [], isLoading } = useAdminLessons(courseId);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="rounded-xl border border-primary/20 bg-background/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-wider">
            Lessons
          </p>
          <p className="text-sm font-semibold text-foreground truncate">
            {courseTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 font-bold">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </Badge>
          {!showAddForm && (
            <Button
              type="button"
              size="sm"
              className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-7"
              onClick={() => setShowAddForm(true)}
              data-ocid="lesson-add-btn"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Lesson
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-7 border-border"
            onClick={onCollapse}
            data-ocid="lesson-editor.close_button"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Add lesson form */}
      <AnimatePresence>
        {showAddForm && (
          <LessonForm
            courseId={courseId}
            totalLessons={lessons.length}
            onDone={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Lesson list */}
      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div
          className="text-center py-8 rounded-xl border border-dashed border-border bg-muted/20"
          data-ocid="lesson-editor.empty_state"
        >
          <Youtube className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            No lessons yet
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Add YouTube video lessons for this course
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, i) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
