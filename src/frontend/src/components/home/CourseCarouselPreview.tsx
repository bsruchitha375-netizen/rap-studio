import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, ChevronRight, Star, Users } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { COURSES } from "../../data/courses";
import type { Course } from "../../types";

const FEATURED = COURSES.filter((_, i) => i < 6);

const MODE_COLORS: Record<Course["mode"], string> = {
  online: "oklch(0.6 0.2 155)",
  offline: "oklch(0.7 0.22 70)",
  hybrid: "oklch(0.68 0.2 290)",
};

// Rich CSS gradient backgrounds per category
const CATEGORY_GRADIENTS: Record<Course["category"], string> = {
  photography:
    "linear-gradient(135deg, oklch(0.28 0.07 70), oklch(0.2 0.05 82))",
  videography:
    "linear-gradient(135deg, oklch(0.24 0.07 290), oklch(0.18 0.05 280))",
  editing: "linear-gradient(135deg, oklch(0.26 0.07 30), oklch(0.2 0.05 40))",
  business:
    "linear-gradient(135deg, oklch(0.22 0.07 180), oklch(0.17 0.05 190))",
  specialized:
    "linear-gradient(135deg, oklch(0.24 0.07 155), oklch(0.18 0.05 145))",
};

const CATEGORY_ACCENT_COLORS: Record<Course["category"], string> = {
  photography: "oklch(0.72 0.14 82)",
  videography: "oklch(0.68 0.2 290)",
  editing: "oklch(0.72 0.2 30)",
  business: "oklch(0.66 0.18 180)",
  specialized: "oklch(0.68 0.18 155)",
};

const CATEGORY_ICONS: Record<Course["category"], string> = {
  photography: "📸",
  videography: "🎥",
  editing: "🎬",
  business: "💼",
  specialized: "✨",
};

interface CourseCardProps {
  course: Course;
  isActive: boolean;
  onClick: () => void;
}

function CourseCard({ course, isActive, onClick }: CourseCardProps) {
  const navigate = useNavigate();
  const accent = CATEGORY_ACCENT_COLORS[course.category];

  return (
    <motion.div
      className="flex-shrink-0 w-64 rounded-2xl border overflow-hidden cursor-pointer"
      style={{
        borderColor: isActive
          ? `${accent.replace(")", " / 0.65)")}`
          : "oklch(0.3 0.02 280)",
        boxShadow: isActive
          ? `0 0 28px ${accent.replace(")", " / 0.22)")}`
          : "none",
        background: "oklch(var(--card) / 0.8)",
      }}
      animate={{ scale: isActive ? 1.04 : 0.96, opacity: isActive ? 1 : 0.72 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.06, opacity: 1 }}
      onClick={onClick}
      data-ocid={`courses.carousel.item.${FEATURED.indexOf(course) + 1}`}
    >
      {/* Thumbnail — pure CSS gradient */}
      <div
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ background: CATEGORY_GRADIENTS[course.category] }}
      >
        {/* Category emoji backdrop */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-5xl opacity-20" style={{ filter: "blur(1px)" }}>
            {CATEGORY_ICONS[course.category]}
          </span>
        </div>

        {/* Gradient shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        {/* Radial accent glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent.replace(")", " / 0.5)")}, transparent 65%)`,
          }}
        />

        {/* Center icon */}
        <div
          className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center border"
          style={{
            background: "oklch(0 0 0 / 0.3)",
            backdropFilter: "blur(8px)",
            borderColor: `${accent.replace(")", " / 0.4)")}`,
          }}
        >
          <BookOpen size={24} style={{ color: accent }} />
        </div>

        <div className="absolute top-2 right-2 z-10">
          <Badge
            className="text-xs px-2 py-0.5 rounded-full border-0"
            style={{
              background: `${MODE_COLORS[course.mode]}22`,
              color: MODE_COLORS[course.mode],
            }}
          >
            {course.mode}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2 z-10">
          <Badge
            className="text-xs px-2 py-0.5 rounded-full border-0 capitalize"
            style={{
              background: "oklch(0.12 0.02 280 / 0.7)",
              color: "oklch(0.72 0.01 280)",
            }}
          >
            {course.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3
          className="text-sm font-bold text-foreground leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        <div
          className="flex items-center gap-1 mt-1"
          style={{ color: "oklch(0.7 0.22 70)" }}
        >
          <Star size={12} fill="currentColor" />
          <span className="text-xs font-semibold">{course.rating}</span>
          <span className="text-xs text-muted-foreground ml-1 flex items-center gap-0.5">
            <Users size={10} />
            {course.totalStudents}
          </span>
        </div>

        <div className="text-sm font-bold" style={{ color: accent }}>
          ₹{course.price}
        </div>

        <button
          type="button"
          className="btn-primary-luxury w-full text-xs py-2 mt-1 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            void navigate({
              to: "/courses/$courseId",
              params: { courseId: course.id },
            });
          }}
          data-ocid={`courses.carousel.enroll_button.${FEATURED.indexOf(course) + 1}`}
        >
          Enroll Now
        </button>
      </div>
    </motion.div>
  );
}

export function CourseCarouselPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + FEATURED.length) % FEATURED.length),
    [],
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % FEATURED.length),
    [],
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 3200);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <section
      className="py-24 bg-background overflow-hidden relative"
      ref={sectionRef}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 20% 50%, oklch(0.68 0.2 290 / 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-3">Learning Platform</p>
          <h2
            className="section-heading text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Master Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-purple)" }}
            >
              Craft
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            50 studio courses across photography, videography, editing, business
            and specialized skills — taught by our founders.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex items-center justify-center gap-4 overflow-visible py-6"
            style={{ minHeight: 360 }}
          >
            {FEATURED.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                isActive={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          {/* Nav arrows */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full flex items-center justify-center border transition-smooth hover:border-primary"
            style={{
              background: "oklch(var(--card) / 0.9)",
              borderColor: "oklch(0.3 0.02 280)",
            }}
            aria-label="Previous course"
            data-ocid="courses.carousel.prev_button"
          >
            <ChevronLeft size={18} className="text-foreground" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full flex items-center justify-center border transition-smooth hover:border-primary"
            style={{
              background: "oklch(var(--card) / 0.9)",
              borderColor: "oklch(0.3 0.02 280)",
            }}
            aria-label="Next course"
            data-ocid="courses.carousel.next_button"
          >
            <ChevronRight size={18} className="text-foreground" />
          </button>
        </motion.div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {FEATURED.map((course, i) => (
            <button
              type="button"
              key={course.id}
              onClick={() => setActiveIndex(i)}
              className="rounded-full transition-smooth"
              style={{
                width: i === activeIndex ? 20 : 8,
                height: 8,
                background:
                  i === activeIndex
                    ? "oklch(0.7 0.22 70)"
                    : "oklch(0.3 0.02 280)",
              }}
              aria-label={`Go to course ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <button
            type="button"
            onClick={() => void navigate({ to: "/courses" })}
            className="btn-secondary-luxury px-10 py-4 text-base"
            data-ocid="courses.view_all_button"
          >
            View All 50 Courses
          </button>
        </motion.div>
      </div>
    </section>
  );
}
