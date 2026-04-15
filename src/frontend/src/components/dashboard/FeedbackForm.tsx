import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { FeedbackRecord } from "../../types";

interface FeedbackFormProps {
  targetId: string;
  targetType: "Service" | "Course";
  onSubmit: (
    feedback: Omit<FeedbackRecord, "id" | "userId" | "createdAt">,
  ) => Promise<void>;
  onClose: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <fieldset className="flex items-center gap-1 border-0 p-0 m-0">
      <legend className="sr-only">Star rating</legend>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || value);
        return (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className={`text-3xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${
              active ? "text-yellow-400" : "text-muted-foreground/40"
            }`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            ★
          </motion.button>
        );
      })}
    </fieldset>
  );
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function FeedbackForm({
  targetId,
  targetType,
  onSubmit,
  onClose,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ targetId, targetType, rating, comment });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        aria-label="Leave feedback"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">
              Leave Feedback
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rate your{" "}
              {targetType === "Course"
                ? "learning experience"
                : "service session"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback form"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star picker */}
          <div className="flex flex-col items-center gap-2 py-2">
            <StarRating value={rating} onChange={setRating} />
            <AnimatePresence mode="wait">
              {rating > 0 && (
                <motion.p
                  key={rating}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-sm font-medium text-yellow-400"
                >
                  {STAR_LABELS[rating]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label
              htmlFor="feedback-comment"
              className="text-sm font-medium text-foreground"
            >
              Comment{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                targetType === "Course"
                  ? "Share what you learned or what could be improved…"
                  : "Tell us about your session experience…"
              }
              rows={3}
              maxLength={500}
              className="resize-none text-black dark:text-foreground"
              data-ocid="feedback-comment-input"
            />
            <p className="text-[10px] text-muted-foreground/60 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/50 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              disabled={isSubmitting}
              data-ocid="feedback-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 btn-primary-luxury gap-2"
              data-ocid="feedback-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit ★"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
