import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect } from "react";
import type { MediaItem } from "../../types";

interface MediaLightboxProps {
  items: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function MediaLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: MediaLightboxProps) {
  const current = items[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!current) return null;

  const imgSrc = current.url || current.thumbnailUrl;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{
          background: "oklch(0.06 0.01 280 / 0.97)",
          backdropFilter: "blur(16px)",
        }}
        onClick={onClose}
        data-ocid="lightbox-overlay"
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "var(--gradient-gold)",
                color: "oklch(0.12 0.02 70)",
              }}
            >
              {current.category}
            </span>
            <h3 className="font-display text-base font-bold text-white hidden sm:block truncate max-w-sm">
              {current.title}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm">
              {currentIndex + 1} / {items.length}
            </span>
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-smooth"
              style={{
                background: "oklch(0.18 0.02 280 / 0.8)",
                border: "1px solid oklch(0.35 0.02 280 / 0.5)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close lightbox"
              data-ocid="lightbox.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prev Arrow */}
        <button
          type="button"
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-200 ${
            hasPrev ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{
            background: "oklch(0.18 0.02 280 / 0.8)",
            border: "1px solid oklch(0.7 0.22 70 / 0.3)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous image"
          data-ocid="lightbox.prev_button"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Arrow */}
        <button
          type="button"
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-200 ${
            hasNext ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{
            background: "oklch(0.18 0.02 280 / 0.8)",
            border: "1px solid oklch(0.7 0.22 70 / 0.3)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next image"
          data-ocid="lightbox.next_button"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Main content */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="relative mx-16 flex flex-col items-center gap-4 max-w-5xl w-full mt-16"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div
            className="w-full rounded-2xl overflow-hidden relative"
            style={{
              boxShadow:
                "0 0 80px oklch(0 0 0 / 0.8), 0 0 0 1px oklch(0.7 0.22 70 / 0.15)",
            }}
          >
            {imgSrc ? (
              current.type === "video" ? (
                <video
                  src={current.url}
                  controls
                  autoPlay
                  className="w-full max-h-[75vh] object-contain bg-black"
                >
                  <track kind="captions" src="" label="Captions" />
                </video>
              ) : (
                <img
                  src={imgSrc}
                  alt={current.title}
                  className="w-full max-h-[75vh] object-contain bg-black"
                />
              )
            ) : (
              <div className="w-full h-[50vh] bg-gradient-to-br from-card to-muted flex items-center justify-center">
                <ZoomIn className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {items.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 max-w-full"
              style={{ scrollbarWidth: "none" }}
            >
              {items.map((it, idx) => {
                const thumb = it.thumbnailUrl || it.url;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(idx);
                    }}
                    className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden transition-all duration-200 ${
                      idx === currentIndex
                        ? "scale-110"
                        : "opacity-40 hover:opacity-70"
                    }`}
                    style={{
                      border:
                        idx === currentIndex
                          ? "2px solid oklch(0.7 0.22 70)"
                          : "2px solid transparent",
                      boxShadow:
                        idx === currentIndex
                          ? "0 0 12px oklch(0.7 0.22 70 / 0.5)"
                          : undefined,
                    }}
                    aria-label={`View ${it.title}`}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={it.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-card" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
