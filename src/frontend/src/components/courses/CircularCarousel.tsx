import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Course } from "../../types";
import { CourseCard } from "./CourseCard";

interface CircularCarouselProps {
  courses: Course[];
}

const VISIBLE_SIDES = 2;

function getOffset(index: number, active: number, total: number): number {
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function getCardTransform(offset: number, isMobile: boolean) {
  const spread = isMobile ? 155 : 275;
  const maxVisible = isMobile ? 1 : VISIBLE_SIDES;
  const abs = Math.abs(offset);

  if (abs > maxVisible) {
    return {
      x: Math.sign(offset) * (maxVisible + 1) * spread,
      rotateY: offset * -18,
      scale: 0,
      opacity: 0,
      zIndex: 0,
      display: "none",
    };
  }

  return {
    x: offset * spread,
    rotateY: offset * -18,
    scale: 1 - abs * 0.13,
    opacity: abs === 0 ? 1 : 1 - abs * 0.3,
    zIndex: 10 - abs,
    display: "block",
  };
}

export function CircularCarousel({ courses }: CircularCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = courses.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);
  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total === 0) return;
    intervalRef.current = setInterval(next, 4200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next, total]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    dragStartX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
    setIsPaused(true);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const endX =
      "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = endX - dragStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
    }
    dragStartX.current = null;
    setTimeout(() => setIsPaused(false), 500);
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No courses in this category yet.
      </div>
    );
  }

  const dotCount = Math.min(total, 7);
  const dotStep = total > 7 ? Math.floor(total / 7) : 1;

  const activeCourse = courses[activeIndex];
  const glowColor =
    activeCourse.category === "photography"
      ? "oklch(0.72 0.12 82 / 0.14)"
      : activeCourse.category === "videography"
        ? "oklch(0.68 0.14 290 / 0.14)"
        : activeCourse.category === "editing"
          ? "oklch(0.68 0.14 185 / 0.14)"
          : activeCourse.category === "business"
            ? "oklch(0.68 0.14 240 / 0.14)"
            : "oklch(0.68 0.14 350 / 0.14)";

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-80 rounded-full pointer-events-none blur-3xl"
        animate={{ background: glowColor }}
        transition={{ duration: 0.8 }}
        style={{ zIndex: 0 }}
      />

      {/* 3D Carousel Stage */}
      <div
        className="relative overflow-hidden"
        style={{ height: 440, perspective: 1200, zIndex: 1 }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence initial={false}>
            {courses.map((course, index) => {
              const offset = getOffset(index, activeIndex, total);
              const transform = getCardTransform(offset, isMobile);
              const abs = Math.abs(offset);
              const maxVis = isMobile ? 1 : VISIBLE_SIDES;
              if (abs > maxVis) return null;

              return (
                <motion.div
                  key={course.id}
                  animate={{
                    x: transform.x,
                    rotateY: transform.rotateY,
                    scale: transform.scale,
                    opacity: transform.opacity,
                    zIndex: transform.zIndex,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 32,
                    mass: 0.8,
                  }}
                  className="absolute"
                  style={{
                    transformStyle: "preserve-3d",
                    pointerEvents: offset === 0 ? "auto" : "none",
                  }}
                  onClick={() => {
                    if (offset !== 0) setActiveIndex(index);
                  }}
                >
                  <CourseCard course={course} isCenter={offset === 0} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-200 shadow-luxury backdrop-blur-sm"
        style={{
          background: "oklch(0.12 0.014 275 / 0.85)",
          borderColor: "oklch(0.72 0.14 82 / 0.4)",
          color: "oklch(0.82 0.16 88)",
        }}
        aria-label="Previous course"
        data-ocid="carousel-prev"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-200 shadow-luxury backdrop-blur-sm"
        style={{
          background: "oklch(0.12 0.014 275 / 0.85)",
          borderColor: "oklch(0.72 0.14 82 / 0.4)",
          color: "oklch(0.82 0.16 88)",
        }}
        aria-label="Next course"
        data-ocid="carousel-next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot indicators */}
      <div
        className="flex items-center justify-center gap-2 mt-6"
        data-ocid="carousel-dots"
      >
        {Array.from({ length: dotCount }).map((_, di) => {
          const targetIndex = di * dotStep;
          const isActive =
            targetIndex === activeIndex ||
            (di === dotCount - 1 &&
              activeIndex >= dotCount * dotStep - dotStep);
          return (
            <button
              type="button"
              key={`dot-${targetIndex}`}
              onClick={() => setActiveIndex(targetIndex)}
              className="rounded-full transition-all duration-300"
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                background: isActive
                  ? "var(--gradient-gold)"
                  : "oklch(var(--border) / 0.8)",
              }}
              aria-label={`Go to course ${di + 1}`}
            />
          );
        })}
      </div>

      {/* Course counter */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        <span className="text-primary font-semibold">{activeIndex + 1}</span> /{" "}
        {total}
      </p>
    </div>
  );
}
