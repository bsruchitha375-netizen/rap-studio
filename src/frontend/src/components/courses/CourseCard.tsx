import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Camera,
  Clock,
  Sliders,
  Star,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Course, CourseCategory, CourseMode } from "../../types";
import { EnrollmentModal } from "./EnrollmentModal";

interface CourseCardProps {
  course: Course;
  isCenter?: boolean;
  index?: number;
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

// Bold solid mode badges: Online=blue, Offline=orange, Hybrid=purple
const MODE_BADGE: Record<CourseMode, { label: string; cls: string }> = {
  online: {
    label: "Online",
    cls: "bg-blue-600 text-white border-0",
  },
  offline: {
    label: "Offline",
    cls: "bg-orange-600 text-white border-0",
  },
  hybrid: {
    label: "Hybrid",
    cls: "bg-purple-600 text-white border-0",
  },
};

export function CourseCard({
  course,
  isCenter = false,
  index = 0,
}: CourseCardProps) {
  const navigate = useNavigate();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const catStyle = CATEGORY_STYLES[course.category];
  const modeBadge = MODE_BADGE[course.mode];
  const imgSrc = course.image ?? CATEGORY_FALLBACK[course.category];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: isCenter ? -8 : -4, scale: isCenter ? 1.03 : 1.02 }}
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        className={`relative flex flex-col rounded-2xl overflow-hidden border border-border/40 bg-card
          cursor-pointer group transition-shadow duration-300
          ${
            isCenter
              ? "shadow-2xl shadow-primary/20 border-primary/40"
              : "shadow-lg hover:shadow-xl"
          }`}
        style={{
          width: 260,
          minHeight: 380,
          boxShadow: isCenter
            ? "0 0 40px oklch(0.7 0.22 70 / 0.2), 0 20px 60px rgba(0,0,0,0.4)"
            : undefined,
        }}
        data-ocid="course-card"
      >
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden">
          {/* Shimmer / gradient fallback */}
          {(!imgLoaded || imgError) && (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${catStyle.gradient} ${!imgError ? "animate-pulse" : ""} flex items-center justify-center`}
            >
              {imgError && (
                <catStyle.icon className="w-10 h-10 opacity-30 text-white" />
              )}
            </div>
          )}

          {/* Course-specific image */}
          {!imgError && (
            <motion.img
              src={imgSrc}
              alt={course.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setImgLoaded(false);
              }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                scale: 1.08,
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
              whileHover={{ scale: 1.14 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {isCenter && (
            <div className="absolute inset-0 ring-inset ring-2 ring-primary/30 rounded-t-2xl" />
          )}

          {/* View Details hover overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: showOverlay ? 1 : 0 }}
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
            {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
          </Badge>
        </div>

        {/* Mode badge — top right, bold & clear */}
        <div className="absolute top-3 right-3 z-20">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${modeBadge.cls}`}
          >
            {modeBadge.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <h3
            className="font-display text-base font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {course.title}
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-2 flex-1">
            {course.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.totalStudents}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {course.rating}
            </span>
          </div>

          {/* Price + Actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <span className="text-xl font-bold text-primary">₹5</span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => void navigate({ to: `/courses/${course.id}` })}
                data-ocid="course-detail-link"
              >
                Details
              </Button>
              <Button
                size="sm"
                className="text-xs h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                onClick={() => setEnrollOpen(true)}
                data-ocid="course-enroll-btn"
              >
                Enroll
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <EnrollmentModal
        course={course}
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
      />
    </>
  );
}
