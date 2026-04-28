import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Briefcase,
  Camera,
  Clock,
  Loader2,
  Sliders,
  Star,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import {
  useCourses,
  useEnrollCourse,
  useMyEnrollments,
} from "../../hooks/useBackend";
import type { Course, CourseCategory, CourseMode } from "../../types";

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  /** Backend numeric courseId from enrollment record, for the learn URL */
  enrolledCourseId?: string;
  isAuthenticated?: boolean;
  isCenter?: boolean;
  index?: number;
  onViewDetails?: () => void;
}

const CATEGORY_FALLBACK: Record<CourseCategory, string> = {
  photography:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
  videography:
    "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=600&q=80",
  editing:
    "https://images.unsplash.com/photo-1536240478700-b869ad10e2ab?w=600&q=80",
  business:
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
  specialized:
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&q=80",
};

const CATEGORY_STYLES: Record<
  CourseCategory,
  { gradient: string; icon: React.ElementType; badge: string }
> = {
  photography: {
    gradient: "from-amber-900/80 via-yellow-900/60 to-amber-950/90",
    icon: Camera,
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  videography: {
    gradient: "from-violet-900/80 via-purple-900/60 to-violet-950/90",
    icon: Video,
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  editing: {
    gradient: "from-teal-900/80 via-cyan-900/60 to-teal-950/90",
    icon: Sliders,
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  business: {
    gradient: "from-blue-900/80 via-indigo-900/60 to-blue-950/90",
    icon: Briefcase,
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  specialized: {
    gradient: "from-rose-900/80 via-pink-900/60 to-rose-950/90",
    icon: Zap,
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
};

const MODE_BADGE: Record<
  CourseMode,
  { label: string; background: string; color: string }
> = {
  online: {
    label: "Online",
    background: "oklch(0.55 0.18 180)",
    color: "#fff",
  },
  offline: {
    label: "Offline",
    background: "oklch(0.68 0.18 55)",
    color: "#fff",
  },
  hybrid: {
    label: "Hybrid",
    background: "oklch(0.58 0.24 290)",
    color: "#fff",
  },
};

export function CourseCard({
  course,
  isEnrolled = false,
  enrolledCourseId,
  isAuthenticated = false,
  isCenter = false,
  index = 0,
  onViewDetails,
}: CourseCardProps) {
  const [enrolling, setEnrolling] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { actor } = useActor(createActor);
  const enrollCourseMutation = useEnrollCourse();
  const { refetch: refetchEnrollments } = useMyEnrollments();
  const { data: backendCourses = [] } = useCourses();

  const catStyle =
    CATEGORY_STYLES[course.category] ?? CATEGORY_STYLES.photography;
  const modeBadge = MODE_BADGE[course.mode] ?? MODE_BADGE.online;
  const imgSrc =
    course.image ?? course.thumbnail ?? CATEGORY_FALLBACK[course.category];

  // Resolve the backend numeric ID for enrollment
  const resolvedBackendId = useMemo(() => {
    const direct = Number.parseInt(String(course.id), 10);
    if (!Number.isNaN(direct) && direct > 0) return direct;
    const match = backendCourses.find(
      (bc) =>
        (bc.title ?? "").toLowerCase().trim() ===
        (course.title ?? "").toLowerCase().trim(),
    );
    if (match) {
      const matchId = Number.parseInt(String(match.id), 10);
      if (!Number.isNaN(matchId) && matchId > 0) return matchId;
    }
    return null;
  }, [course.id, course.title, backendCourses]);

  const learnUrl = `/course/${enrolledCourseId ?? resolvedBackendId ?? course.id}/learn`;

  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = `/login?return=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (isEnrolled) {
      window.location.href = learnUrl;
      return;
    }
    if (!actor) {
      toast.error("Backend not ready. Please try again.");
      return;
    }
    if (resolvedBackendId === null) {
      toast.error("Course not yet available. Please try again shortly.");
      return;
    }

    setEnrolling(true);
    try {
      const enrolled =
        await enrollCourseMutation.mutateAsync(resolvedBackendId);
      const backendCourseId = enrolled?.courseId ?? String(resolvedBackendId);
      // Await enrollment refresh before navigating to prevent race
      await refetchEnrollments();
      toast.success(
        `Enrolled in "${course.title ?? "course"}"! Start learning now.`,
      );
      window.location.href = `/course/${String(backendCourseId)}/learn`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists") ||
        msg.toLowerCase().includes("duplicate")
      ) {
        await refetchEnrollments();
        window.location.href = `/course/${String(resolvedBackendId)}/learn`;
        return;
      }
      toast.error("Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 h-full"
      style={{
        background: "oklch(var(--card) / 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: isCenter
          ? "1px solid oklch(0.7 0.22 70 / 0.5)"
          : `1px solid ${isHovered ? "oklch(0.7 0.22 70 / 0.3)" : "oklch(var(--border) / 0.4)"}`,
        boxShadow: isCenter
          ? "0 0 40px oklch(0.7 0.22 70 / 0.2), 0 20px 60px rgba(0,0,0,0.4)"
          : isHovered
            ? "0 0 20px oklch(0.7 0.22 70 / 0.1), 0 12px 36px rgba(0,0,0,0.3)"
            : "0 8px 24px rgba(0,0,0,0.2)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onClick={() => onViewDetails?.()}
      data-ocid="course-card"
    >
      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        {(!imgLoaded || imgError) && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${catStyle.gradient} flex items-center justify-center`}
          >
            <div className="text-center px-4">
              <catStyle.icon className="w-12 h-12 opacity-40 text-white mx-auto mb-2" />
              <p className="text-white/60 text-xs font-medium line-clamp-2">
                {course.title ?? ""}
              </p>
            </div>
          </div>
        )}
        {!imgError && (
          <motion.img
            src={imgSrc}
            alt={course.title ?? "Course"}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(false);
            }}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1.02 }}
            transition={{ duration: 0.5 }}
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {isCenter && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: "var(--gradient-gold)" }}
          />
        )}

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "oklch(0.06 0.01 280 / 0.55)",
            backdropFilter: "blur(4px)",
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-white text-sm font-bold tracking-wider uppercase border border-white/40 px-4 py-1.5 rounded-full">
            View Details
          </span>
        </motion.div>
      </div>

      {/* Category badge — top left */}
      <div className="absolute top-3 left-3 z-20">
        <Badge className={`text-xs font-medium border ${catStyle.badge}`}>
          {(course.category ?? "").charAt(0).toUpperCase() +
            (course.category ?? "").slice(1)}
        </Badge>
      </div>

      {/* Mode badge — top right */}
      <div className="absolute top-3 right-3 z-20">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: modeBadge.background,
            color: modeBadge.color,
          }}
        >
          {modeBadge.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-display text-base font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {course.title ?? ""}
        </h3>
        <p className="text-muted-foreground text-xs line-clamp-2 flex-1 leading-relaxed">
          {course.description ?? ""}
        </p>

        <p className="text-xs text-muted-foreground/70">
          {course.instructor ?? "RAP Studio"}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration ?? "Flexible"}
          </span>
          {(course.totalStudents ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.totalStudents}
            </span>
          )}
          {(course.rating ?? 0) > 0 && (
            <span
              className="flex items-center gap-1"
              style={{ color: "oklch(0.8 0.18 70)" }}
            >
              <Star className="w-3 h-3 fill-current" />
              {course.rating}
            </span>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-border/30"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => onViewDetails?.()}
            data-ocid="course.detail_button"
          >
            Details
          </Button>
          <Button
            size="sm"
            className={`text-xs h-7 px-3 font-bold border-0 py-0 min-w-[110px] ${
              isEnrolled ? "bg-primary/20 text-primary hover:bg-primary/30" : ""
            }`}
            style={
              !isEnrolled
                ? {
                    background: "var(--gradient-gold)",
                    color: "oklch(var(--primary-foreground))",
                  }
                : undefined
            }
            onClick={(e) => void handleEnrollClick(e)}
            disabled={enrolling}
            data-ocid={
              isEnrolled ? "course.continue_button" : "course.enroll_button"
            }
          >
            {enrolling ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Enrolling…
              </span>
            ) : isEnrolled ? (
              "Continue Learning"
            ) : (
              "Enroll Free"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
