import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  Camera,
  CheckCircle2,
  GraduationCap,
  Search,
  Sliders,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CourseCard } from "../components/courses/CourseCard";
import { Layout } from "../components/layout/Layout";
import { COURSES } from "../data/courses";
import { useAuth } from "../hooks/useAuth";
import { useCourses, useMyEnrollments } from "../hooks/useBackend";
import type { CourseCategory } from "../types";

type TabFilter = "all" | CourseCategory;

const TABS: { id: TabFilter; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Courses", icon: GraduationCap },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "videography", label: "Videography & Film", icon: Video },
  { id: "editing", label: "Editing", icon: Sliders },
  { id: "business", label: "Business & Studio", icon: Briefcase },
  { id: "specialized", label: "Specialized", icon: Zap },
];

const BENEFITS = [
  {
    icon: Award,
    title: "Verified Certificates",
    desc: "QR-coded certificates after course completion with online verification.",
  },
  {
    icon: GraduationCap,
    title: "Expert Instructors",
    desc: "Learn from Ruchitha, Ashitha, and Prarthana — founding experts at RAP Studio.",
  },
  {
    icon: CheckCircle2,
    title: "Free to Enroll",
    desc: "All courses are free to enroll. Certificate payment only after full completion.",
  },
];

const MODE_LEGEND = [
  {
    label: "Online",
    style: {
      background: "oklch(0.55 0.18 180)",
      color: "#fff",
    },
  },
  {
    label: "Offline",
    style: {
      background: "oklch(0.68 0.18 55)",
      color: "#fff",
    },
  },
  {
    label: "Hybrid",
    style: {
      background: "oklch(0.58 0.24 290)",
      color: "#fff",
    },
  },
];

export function CoursesPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: backendCourses = [], isLoading } = useCourses();
  const { data: enrollments = [] } = useMyEnrollments();

  // Merge static + backend courses (backend overrides when available)
  const allCourses = backendCourses.length > 0 ? backendCourses : COURSES;

  const filteredCourses = allCourses.filter((c) => {
    const matchesTab = activeTab === "all" || c.category === activeTab;
    const matchesSearch =
      !searchQuery ||
      (c.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Map courseId → enrollment for "Continue Learning" navigation
  const enrolledIds = new Set(enrollments.map((e) => String(e.courseId)));
  const enrollmentByCourseId = new Map(
    enrollments.map((e) => [String(e.courseId), e]),
  );

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1400&q=60')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.15) saturate(0.5)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-background/70 to-background" />

        {/* Gold glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.72 0.14 82 / 0.5), transparent 70%)",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.68 0.2 290), transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 text-center px-4 py-20 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-primary/15 text-primary border border-primary/30 mb-6 px-5 py-1.5 text-sm font-semibold shadow-glow-gold">
              50 Professional Courses — All Free to Enroll
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-heading text-foreground mb-5 leading-tight"
          >
            Master the Art of{" "}
            <span className="relative inline-block">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-gold)" }}
              >
                Photography &amp; Film
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "var(--gradient-gold)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.6 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Enroll free in 50 studio-crafted courses covering photography,
            videography, editing, business, and specialized skills — for every
            level.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 flex-wrap text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary" />
              <strong className="text-foreground">50</strong> Courses
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" />
              Certificates with QR
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Free to Enroll
            </span>
          </motion.div>

          {/* Mode legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-3 mt-5"
          >
            {MODE_LEGEND.map((m) => (
              <span
                key={m.label}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={m.style}
              >
                {m.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Category filter tabs ── */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/25">
        <div className="container mx-auto px-4">
          <div
            className="flex gap-1.5 overflow-x-auto py-3"
            style={{ scrollbarWidth: "none" }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  style={
                    isActive
                      ? {
                          background: "var(--gradient-gold)",
                          color: "oklch(0.1 0.01 262)",
                          boxShadow: "0 2px 12px oklch(var(--primary) / 0.35)",
                        }
                      : {
                          color: "oklch(var(--muted-foreground))",
                        }
                  }
                  data-ocid={`courses.filter.tab.${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Search + Grid ── */}
      <section className="py-12 bg-background" data-ocid="courses.grid.section">
        <div className="container mx-auto px-4">
          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto mb-8 relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search courses…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/60 border-border/40 focus:border-primary/50 text-foreground placeholder:text-muted-foreground h-11"
              data-ocid="courses.search_input"
            />
          </motion.div>

          {/* Count info */}
          <motion.div
            key={`${activeTab}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-semibold">
                {filteredCourses.length}
              </span>{" "}
              course{filteredCourses.length !== 1 ? "s" : ""}
              {activeTab !== "all" &&
                ` in ${TABS.find((t) => t.id === activeTab)?.label ?? activeTab}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </motion.div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 space-y-4"
              data-ocid="courses.empty_state"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <GraduationCap className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                No courses found
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Try adjusting your search or selecting a different category.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          )}

          {/* Course grid */}
          {!isLoading && filteredCourses.length > 0 && (
            <motion.div
              key={`${activeTab}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="courses.list"
            >
              {filteredCourses.map((course, index) => {
                const isEnrolled = enrolledIds.has(String(course.id));
                const enrollment = enrollmentByCourseId.get(String(course.id));
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.05, 0.4),
                      duration: 0.4,
                    }}
                    data-ocid={`courses.item.${index + 1}`}
                  >
                    <CourseCard
                      course={course}
                      isEnrolled={isEnrolled}
                      enrolledCourseId={
                        enrollment ? String(enrollment.courseId) : undefined
                      }
                      isAuthenticated={isAuthenticated}
                      index={index}
                      onViewDetails={() =>
                        void navigate({ to: `/courses/${course.id}` })
                      }
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-16 bg-muted/15 border-t border-border/15">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="section-label mb-3 tracking-[2px]">
              Why Learn with Us
            </p>
            <h2 className="section-subheading text-foreground">
              Why Learn with{" "}
              <span className="text-primary text-glow-gold">RAP Studio?</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Studio-quality education, accessible to everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-6 glass-card border text-center hover:border-primary/30 transition-smooth hover:-translate-y-1 service-card-hover"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/12 flex items-center justify-center mx-auto mb-4 shadow-glow-gold">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {b.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
