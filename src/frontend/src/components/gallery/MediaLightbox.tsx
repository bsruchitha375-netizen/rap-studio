import { Badge } from "@/components/ui/badge";
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
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
        onClick={onClose}
        data-ocid="lightbox-overlay"
      >
        {/* Close */}
        <button
          type="button"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close lightbox"
          data-ocid="lightbox-close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-white/60 text-sm font-body tracking-wide">
          {currentIndex + 1} / {items.length}
        </div>

        {/* Prev Arrow */}
        <button
          type="button"
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200 hover:scale-110 ${
            hasPrev ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous image"
          data-ocid="lightbox-prev"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Arrow */}
        <button
          type="button"
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200 hover:scale-110 ${
            hasNext ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next image"
          data-ocid="lightbox-next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="relative mx-16 flex flex-col items-center gap-4 max-w-5xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative group/img">
            {imgSrc ? (
              current.type === "video" ? (
                <video
                  src={current.url}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh] object-contain bg-black"
                >
                  <track kind="captions" src="" label="Captions" />
                </video>
              ) : (
                <img
                  src={imgSrc}
                  alt={current.title}
                  className="w-full max-h-[80vh] object-contain bg-black"
                />
              )
            ) : (
              <div className="w-full h-[50vh] bg-gradient-to-br from-card to-muted flex items-center justify-center">
                <ZoomIn className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Caption bar */}
          <div className="w-full flex items-center justify-between px-1">
            <div className="flex items-center gap-3 min-w-0">
              <Badge className="gradient-gold text-background border-0 shrink-0 text-xs">
                {current.category}
              </Badge>
              <h3 className="font-display text-base font-bold text-white truncate">
                {current.title}
              </h3>
            </div>
            <span className="text-white/40 text-xs shrink-0 ml-4 font-body">
              {new Date(
                Number(current.createdAt / BigInt(1_000_000)),
              ).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>

          {/* Thumbnail strip */}
          {items.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
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
                    className={`shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      idx === currentIndex
                        ? "border-primary scale-110 shadow-[0_0_8px_oklch(0.7_0.22_70/0.6)]"
                        : "border-white/20 opacity-50 hover:opacity-80"
                    }`}
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
