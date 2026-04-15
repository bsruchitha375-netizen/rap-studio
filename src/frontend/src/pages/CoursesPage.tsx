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
    title: "₹5 All Access",
    desc: "Every single course for just ₹5. No hidden fees, no subscriptions.",
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
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-card via-background to-background">
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.7 0.22 70 / 0.4), transparent 70%)",
          }}
        />

        <div className="relative z-10 text-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-primary/15 text-primary border border-primary/30 mb-6 px-4 py-1.5 text-sm font-medium">
              50 Professional Courses
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Master the Art of
            <br />
            <span className="text-primary">Photography & Film</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            50 studio-crafted courses covering photography, videography,
            editing, business, and specialized skills — each just ₹5.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
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
              All for ₹5
            </span>
          </motion.div>
        </div>
      </section>

      {/* Category filter tabs */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200 whitespace-nowrap flex-shrink-0
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  data-ocid={`tab-${tab.id}`}
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
        data-ocid="courses-carousel"
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
            <h2 className="text-3xl font-display font-bold text-foreground">
              Why Learn with RAP Studio?
            </h2>
            <p className="text-muted-foreground mt-2">
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
                  className="rounded-2xl p-6 bg-card border border-border/30 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
