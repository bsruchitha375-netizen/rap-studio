import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  BookOpen,
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  Play,
  Sliders,
  Star,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Course, CourseCategory, CourseMode } from "../../types";
import { CourseCard } from "./CourseCard";
import { EnrollmentModal } from "./EnrollmentModal";

interface CourseDetailProps {
  course: Course;
  relatedCourses: Course[];
  isEnrolled?: boolean;
  progress?: number;
  onEnroll?: () => void;
  isEnrolling?: boolean;
}

const CAT_ICONS: Record<CourseCategory, React.ElementType> = {
  photography: Camera,
  videography: Video,
  editing: Sliders,
  business: Briefcase,
  specialized: Zap,
};

const CAT_GRADIENT: Record<CourseCategory, string> = {
  photography: "from-amber-900/70 via-yellow-950/50 to-background",
  videography: "from-violet-900/70 via-purple-950/50 to-background",
  editing: "from-teal-900/70 via-cyan-950/50 to-background",
  business: "from-blue-900/70 via-indigo-950/50 to-background",
  specialized: "from-rose-900/70 via-pink-950/50 to-background",
};

const CAT_FALLBACK: Record<CourseCategory, string> = {
  photography:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",
  videography:
    "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=1200&q=80",
  editing:
    "https://images.unsplash.com/photo-1536240478700-b869ad10e2ab?w=1200&q=80",
  business:
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
  specialized:
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1200&q=80",
};

const MODE_STYLES: Record<
  CourseMode,
  { label: string; class: string; badgeCls: string }
> = {
  online: {
    label: "Online",
    class: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    badgeCls: "bg-teal-500/90 text-white",
  },
  offline: {
    label: "Offline",
    class: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    badgeCls: "bg-amber-500/90 text-white",
  },
  hybrid: {
    label: "Hybrid",
    class: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    badgeCls: "bg-violet-600/90 text-white",
  },
};

const CURRICULUM_TEMPLATE = [
  {
    week: "Week 1",
    topic: "Foundations & Setup",
    desc: "Core concepts, equipment, and workflow setup.",
  },
  {
    week: "Week 2",
    topic: "Core Techniques",
    desc: "Hands-on practice with primary skills.",
  },
  {
    week: "Week 3",
    topic: "Advanced Methods",
    desc: "Professional-grade techniques and problem-solving.",
  },
  {
    week: "Week 4",
    topic: "Real-World Projects",
    desc: "Apply learnings to actual client scenarios.",
  },
  {
    week: "Week 5",
    topic: "Portfolio Building",
    desc: "Curate and present your best work.",
  },
  {
    week: "Final",
    topic: "Assessment & Certificate",
    desc: "Submit final project and receive your certificate.",
  },
];

export function CourseDetail({
  course,
  relatedCourses,
  isEnrolled = false,
  progress = 0,
  onEnroll,
  isEnrolling = false,
}: CourseDetailProps) {
  const [enrollOpen, setEnrollOpen] = useState(false);

  const handleEnrollClick = () => {
    if (onEnroll) {
      onEnroll();
    } else {
      setEnrollOpen(true);
    }
  };
  const [heroLoaded, setHeroLoaded] = useState(false);
  const modeStyle = MODE_STYLES[course.mode] ?? MODE_STYLES.online;
  const CatIcon = CAT_ICONS[course.category] ?? Camera;
  const heroImg =
    course.image ?? course.thumbnail ?? CAT_FALLBACK[course.category];
  const displayPrice = course.price > 0 ? course.price : 5;

  const handleContinueLearning = () => {
    window.location.href = `/course/${course.id}/learn`;
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt={course.title ?? "Course"}
            onLoad={() => setHeroLoaded(true)}
            className="w-full h-full object-cover"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          />
          {/* Gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${CAT_GRADIENT[course.category] ?? "from-card/90 to-background"} opacity-90`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary border border-primary/30 capitalize">
                {course.category ?? ""}
              </Badge>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${modeStyle.badgeCls}`}
              >
                {modeStyle.label}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              {course.title ?? ""}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mb-6">
              {course.description ?? ""}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 text-sm text-white/70">
              {course.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">
                    {course.rating}
                  </span>{" "}
                  rating
                </span>
              )}
              {course.totalStudents > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="text-white font-semibold">
                    {course.totalStudents}
                  </span>{" "}
                  students
                </span>
              )}
              {course.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-white font-semibold">
                    {course.duration}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                Certificate included
              </span>
            </div>
          </motion.div>
        </div>

        {/* Decorative icon */}
        <div className="absolute top-16 right-8 opacity-10 hidden md:block z-10">
          <CatIcon className="w-40 h-40 text-white" strokeWidth={0.5} />
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="overview">
              <TabsList className="bg-muted/30 border border-border/30 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                      About This Course
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {course.description ?? ""}
                    </p>
                  </div>

                  {(course.syllabusHighlights ?? []).length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-3">
                        What You'll Learn
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(course.syllabusHighlights ?? []).map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground/80">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/20 rounded-2xl p-5 border border-border/30">
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      Prerequisites
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No prior experience required. Passion for visual
                      storytelling and access to a camera or smartphone is
                      recommended.
                    </p>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="curriculum">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  {CURRICULUM_TEMPLATE.map((item) => (
                    <div
                      key={item.week}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                        isEnrolled
                          ? "bg-muted/10 border-border/20 hover:border-border/40"
                          : "bg-muted/10 border-border/20 opacity-80"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {isEnrolled ? (
                          <Play className="w-5 h-5 text-primary" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                          {item.week}
                        </p>
                        <h4 className="text-sm font-semibold text-foreground mt-0.5">
                          {item.topic}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 mt-1" />
                    </div>
                  ))}
                  {!isEnrolled && (
                    <div className="text-center pt-4">
                      <p className="text-xs text-muted-foreground mb-3">
                        Enroll free to unlock all{" "}
                        <span className="text-primary font-semibold">
                          {CURRICULUM_TEMPLATE.length}
                        </span>{" "}
                        lessons
                      </p>
                      <Button
                        className="h-9 px-6 font-bold text-sm"
                        style={{
                          background: "var(--gradient-gold)",
                          color: "oklch(var(--primary-foreground))",
                        }}
                        onClick={handleEnrollClick}
                        disabled={isEnrolling}
                        data-ocid="curriculum.enroll_button"
                      >
                        {isEnrolling
                          ? "Enrolling…"
                          : "Enroll Free — Start Learning"}
                      </Button>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="instructor">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-5"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center flex-shrink-0 text-2xl font-display text-primary">
                    {(course.instructor ?? "R").charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground">
                      {course.instructor ?? "RAP Studio"}
                    </h2>
                    <p className="text-primary text-sm font-medium mt-0.5">
                      RAP Studio Expert —{" "}
                      {(course.category ?? "").charAt(0).toUpperCase() +
                        (course.category ?? "").slice(1)}
                    </p>
                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-lg">
                      A founding member of RAP Integrated Studio with over a
                      decade of professional experience. Specializing in{" "}
                      {course.category ?? "visual arts"} with credits across
                      weddings, commercial shoots, and editorial campaigns.
                      Known for a warm teaching style that makes complex
                      techniques accessible to all levels.
                    </p>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enrollment card — sticky */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl shadow-primary/5">
              {/* Enrollment header */}
              <div className="bg-gradient-to-br from-primary/15 to-card p-5 border-b border-border/30">
                <div className="flex items-baseline gap-2">
                  <p
                    className="text-3xl font-bold"
                    style={{ color: "oklch(0.78 0.18 82)" }}
                  >
                    FREE
                  </p>
                  <p className="text-sm text-muted-foreground">to enroll</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Certificate: ₹{displayPrice} (after completion)
                </p>
              </div>

              <div className="p-5 space-y-3">
                {/* Course meta */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mode</span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${modeStyle.badgeCls}`}
                    >
                      {modeStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground font-medium">
                      {course.duration ?? "Flexible"}
                    </span>
                  </div>
                  {course.totalStudents > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Students</span>
                      <span className="text-foreground font-medium">
                        {course.totalStudents}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Certificate</span>
                    <span className="text-primary font-medium text-xs flex items-center gap-1">
                      <Award className="w-3 h-3" /> Included
                    </span>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                {isEnrolled ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Your progress
                        </span>
                        <span className="text-primary font-semibold">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                      onClick={handleContinueLearning}
                      data-ocid="course-detail.continue_button"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full font-bold h-11"
                    style={{
                      background: "var(--gradient-gold)",
                      color: "oklch(var(--primary-foreground))",
                      boxShadow: "0 4px 20px oklch(var(--primary) / 0.28)",
                    }}
                    onClick={handleEnrollClick}
                    disabled={isEnrolling}
                    data-ocid="course-detail.enroll_button"
                  >
                    {isEnrolling ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enrolling…
                      </span>
                    ) : (
                      "Enroll Free — Start Learning"
                    )}
                  </Button>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  Certificate issued upon completion
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related courses */}
        {relatedCourses.length > 0 && (
          <section className="mt-16">
            <Separator className="bg-border/30 mb-10" />
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Related Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <CourseCard
                    course={c}
                    onViewDetails={() => {
                      window.location.href = `/courses/${c.id}`;
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      <EnrollmentModal
        course={course}
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
      />
    </>
  );
}
