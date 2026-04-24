import { Badge } from "@/components/ui/badge";
import {
  Award,
  Briefcase,
  Camera,
  CheckCircle2,
  GraduationCap,
  Sliders,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CircularCarousel } from "../components/courses/CircularCarousel";
import { Layout } from "../components/layout/Layout";
import { COURSES } from "../data/courses";
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
    title: "Accessible for Everyone",
    desc: "Every course designed for beginners to professionals — no hidden fees, no subscriptions.",
  },
];

export function CoursesPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const filteredCourses =
    activeTab === "all"
      ? COURSES
      : COURSES.filter((c) => c.category === activeTab);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-card via-background to-background">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-25 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.7 0.22 70 / 0.45), transparent 70%)",
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
            <Badge className="bg-primary/15 text-primary border border-primary/30 mb-6 px-4 py-1.5 text-sm font-semibold">
              50 Professional Courses
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-heading text-foreground mb-4 leading-tight"
          >
            Master the Art of{" "}
            <span className="relative inline-block">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-gold)" }}
              >
                Photography & Film
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            50 studio-crafted courses covering photography, videography,
            editing, business, and specialized skills — for every level.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
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
              All Levels Welcome
            </span>
          </motion.div>
        </div>
      </section>

      {/* Category filter tabs */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="container mx-auto px-4">
          <div
            className="flex gap-1 overflow-x-auto py-3"
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
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                  style={
                    isActive
                      ? { background: "var(--gradient-gold)" }
                      : undefined
                  }
                  data-ocid="courses.filter.tab"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Circular Carousel */}
      <section
        className="py-16 bg-background overflow-hidden"
        data-ocid="courses.carousel"
      >
        <div className="container mx-auto px-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-semibold">
                  {filteredCourses.length}
                </span>{" "}
                courses
                {activeTab !== "all" &&
                  ` in ${TABS.find((t) => t.id === activeTab)?.label ?? activeTab}`}{" "}
                — drag or use arrows to explore
              </p>
            </div>
            <CircularCarousel courses={filteredCourses} />
          </motion.div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="py-16 bg-muted/20 border-t border-border/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="section-label mb-3">Why Learn with Us</p>
            <h2 className="section-subheading text-foreground">
              Why Learn with <span className="text-primary">RAP Studio?</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Studio-quality education at an accessible price point
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="rounded-2xl p-6 glass-effect border border-border/30 text-center hover:border-primary/30 transition-smooth hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4 shadow-glow-gold">
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
