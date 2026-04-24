import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Bell,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CertificateCard } from "../components/courses/CertificateCard";
import { FeedbackForm } from "../components/dashboard/FeedbackForm";
import { Layout } from "../components/layout/Layout";
import { RazorpayButton } from "../components/ui/RazorpayButton";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import {
  useCourses,
  useMyEnrollments,
  useMyNotifications,
} from "../hooks/useBackend";
import type {
  Certificate,
  CourseEnrollment,
  FeedbackRecord,
  NotificationRecord,
} from "../types";

const MODE_COLORS: Record<string, string> = {
  online: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  offline: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  hybrid: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  overdue: "bg-red-500/20 text-red-300 border-red-500/30",
  completed: "bg-primary/20 text-primary border-primary/30",
  certificate_blocked: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function renderStars(rating: number) {
  return (
    <span
      className="text-sm tracking-tight"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            color: s <= rating ? "oklch(0.8 0.2 70)" : "oklch(0.3 0.02 280)",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

async function addFeedback(
  feedback: Omit<FeedbackRecord, "id" | "userId" | "createdAt">,
): Promise<{ ok: boolean }> {
  console.log("feedback submitted", feedback);
  return { ok: true };
}

const SAMPLE_CERT: Certificate = {
  code: "RAP-PHO-2026-001",
  studentName: "Ruchitha B S",
  courseName: "Photography Fundamentals",
  issuedAt: BigInt(Date.now() - 86400000 * 5) * BigInt(1_000_000),
  isValid: true,
};

export function StudentDashboard() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useMyEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: notifications = [] } = useMyNotifications();
  const [activeTab, setActiveTab] = useState("courses");
  const [submittedFeedback, setSubmittedFeedback] = useState<
    Record<string, FeedbackRecord>
  >({});
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);

  const name = profile?.name ?? "there";
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const enrolledCourses = enrollments.map((e: CourseEnrollment) => ({
    enrollment: e,
    course: courses.find((c) => c.id === e.courseId),
  }));

  const certificates: Certificate[] = enrollments
    .filter((e) => e.certificateCode && e.status === "completed")
    .map((e) => ({
      code: e.certificateCode ?? "",
      studentName: profile?.name ?? "Student",
      courseName: courses.find((c) => c.id === e.courseId)?.title ?? "Course",
      issuedAt: e.completedAt ?? e.enrolledAt,
      isValid: true,
    }));

  const displayCertificates =
    certificates.length > 0 ? certificates : [SAMPLE_CERT];

  async function handleFeedbackSubmit(
    enrollmentId: string,
    courseId: string,
    feedback: Omit<FeedbackRecord, "id" | "userId" | "createdAt">,
  ) {
    await addFeedback(feedback);
    setSubmittedFeedback((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...feedback,
        id: `fb-${enrollmentId}`,
        userId: profile?.id ?? "me",
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      },
    }));
    setFeedbackOpen(null);
    void courseId;
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center text-muted-foreground">
          Please log in to view your dashboard.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Dashboard banner */}
      <div
        className="border-b border-border/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.022 285), oklch(0.18 0.028 290))",
        }}
      >
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="section-label mb-1">Student Portal</p>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back,{" "}
              <span style={{ color: "oklch(0.78 0.18 290)" }}>{name}</span> 🎓
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your learning journey at RAP Integrated Studio.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="student-dashboard.tab"
        >
          <TabsList
            className="border border-border/50 mb-6"
            style={{ background: "oklch(var(--card) / 0.5)" }}
          >
            <TabsTrigger
              value="courses"
              className="gap-2"
              data-ocid="student-dashboard.courses.tab"
            >
              <BookOpen className="w-4 h-4" />
              My Courses
              {enrolledCourses.length > 0 && (
                <Badge className="ml-1 text-xs bg-primary/20 text-primary border-0 h-4 px-1">
                  {enrolledCourses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="gap-2"
              data-ocid="student-dashboard.certificates.tab"
            >
              <Award className="w-4 h-4" />
              Certificates
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2"
              data-ocid="student-dashboard.notifications.tab"
            >
              <Bell className="w-4 h-4" />
              Alerts
              {unreadCount > 0 && (
                <Badge className="ml-1 text-xs bg-destructive/80 text-white border-0 h-4 px-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Courses / Enrollments Tab */}
          <TabsContent value="courses">
            <AnimatePresence mode="wait">
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div
                    className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl"
                    style={{
                      background: "oklch(var(--card) / 0.3)",
                      border: "1px dashed oklch(var(--border) / 0.5)",
                    }}
                    data-ocid="courses.empty_state"
                  >
                    <div
                      className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
                      style={{
                        background: "oklch(0.68 0.2 290 / 0.1)",
                        border: "1px solid oklch(0.68 0.2 290 / 0.3)",
                      }}
                    >
                      <GraduationCap
                        className="w-8 h-8"
                        style={{ color: "oklch(0.7 0.18 290)" }}
                      />
                    </div>
                    <p className="text-lg font-display font-semibold text-foreground mb-2">
                      No enrollments yet
                    </p>
                    <p className="text-sm opacity-60 mb-6">
                      Browse courses to get started on your photography journey.
                    </p>
                    <a
                      href="/courses"
                      className="btn-primary-luxury text-sm px-6 py-2"
                      data-ocid="courses.empty_state.primary_button"
                    >
                      Browse Courses
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.map(({ enrollment, course }, i) => {
                      const certReady =
                        enrollment.status === "completed" &&
                        enrollment.paymentStatus === "paid";
                      const isCompleted = enrollment.status === "completed";
                      const fb = submittedFeedback[enrollment.id];
                      return (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-xl p-5 hover:border-primary/30 transition-smooth"
                          style={{
                            background: "oklch(var(--card) / 0.45)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid oklch(var(--border) / 0.4)",
                          }}
                          data-ocid={`enrolled-course.item.${i + 1}`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-semibold text-foreground truncate">
                                {course?.title ?? enrollment.courseId}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {course?.instructor ?? "RAP Studio"}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {course && (
                                <Badge
                                  className={`text-xs border ${MODE_COLORS[course.mode] ?? ""}`}
                                >
                                  {course.mode}
                                </Badge>
                              )}
                              <Badge
                                className={`text-xs border ${STATUS_COLORS[enrollment.status] ?? ""}`}
                              >
                                {enrollment.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </div>

                          {/* Gold progress bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span
                                className="font-medium"
                                style={{ color: "oklch(0.7 0.22 70)" }}
                              >
                                {enrollment.progress}%
                              </span>
                            </div>
                            <div
                              className="h-2 rounded-full overflow-hidden"
                              style={{
                                background: "oklch(var(--muted) / 0.5)",
                              }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: "var(--gradient-gold)" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${enrollment.progress}%` }}
                                transition={{
                                  duration: 1,
                                  delay: i * 0.1,
                                  ease: "easeOut",
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            {certReady ? (
                              <Badge
                                className="text-xs"
                                style={{
                                  background: "oklch(0.65 0.18 150 / 0.2)",
                                  color: "oklch(0.75 0.18 150)",
                                  borderColor: "oklch(0.65 0.18 150 / 0.4)",
                                }}
                              >
                                ✓ Certificate Ready
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-muted/40 text-muted-foreground border-border/30">
                                In Progress
                              </Badge>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              {enrollment.status === "active" &&
                                enrollment.paymentStatus !== "paid" && (
                                  <RazorpayButton
                                    amount={5}
                                    label="Complete Payment"
                                    referenceId={enrollment.id}
                                    paymentType="course_enrollment"
                                    description={`Course: ${course?.title ?? enrollment.courseId}`}
                                    className="text-xs px-3 py-1.5 h-auto btn-primary-luxury"
                                  />
                                )}
                              {certReady && enrollment.certificateCode && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1"
                                  onClick={() =>
                                    window.open(
                                      `/verify/${enrollment.certificateCode}`,
                                      "_blank",
                                    )
                                  }
                                  data-ocid="course.view_certificate_button"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Certificate
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                className="text-xs btn-secondary-luxury gap-1"
                                onClick={() =>
                                  window.open(
                                    `/courses/${enrollment.courseId}`,
                                    "_blank",
                                  )
                                }
                                data-ocid="course.continue_button"
                              >
                                <BookOpen className="w-3 h-3" />
                                Continue
                              </Button>
                            </div>
                          </div>

                          {isCompleted && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 }}
                              className="mt-3 pt-3 border-t border-border/30 flex items-center gap-3 flex-wrap"
                            >
                              {fb ? (
                                <div
                                  className="flex items-center gap-2 text-sm"
                                  data-ocid="student-feedback.success_state"
                                >
                                  {renderStars(fb.rating)}
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: "oklch(0.65 0.18 150)" }}
                                  >
                                    Thank you for your feedback!
                                  </span>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs gap-1 h-7"
                                  style={{
                                    borderColor: "oklch(0.7 0.22 70 / 0.4)",
                                    color: "oklch(0.7 0.22 70)",
                                  }}
                                  onClick={() => setFeedbackOpen(enrollment.id)}
                                  data-ocid="course.feedback_button"
                                >
                                  <Star className="w-3 h-3" />
                                  Leave Feedback ★
                                </Button>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <AnimatePresence mode="wait">
              <motion.div
                key="certs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6 max-w-2xl mx-auto">
                  {displayCertificates.map((cert) => (
                    <CertificateCard key={cert.code} certificate={cert} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <AnimatePresence mode="wait">
              <motion.div
                key="notifs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {notifications.length === 0 ? (
                  <div
                    className="flex flex-col items-center py-20 text-muted-foreground rounded-2xl"
                    style={{
                      background: "oklch(var(--card) / 0.3)",
                      border: "1px dashed oklch(var(--border) / 0.5)",
                    }}
                    data-ocid="student-notifications.empty_state"
                  >
                    <Bell className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-lg font-display font-semibold text-foreground">
                      All caught up!
                    </p>
                    <p className="text-sm opacity-60">
                      No notifications at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n: NotificationRecord, i: number) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl p-4"
                        style={{
                          background: n.isRead
                            ? "oklch(var(--card) / 0.4)"
                            : "oklch(0.68 0.2 290 / 0.06)",
                          border: n.isRead
                            ? "1px solid oklch(var(--border) / 0.4)"
                            : "1px solid oklch(0.68 0.2 290 / 0.3)",
                        }}
                        data-ocid={`student-notification.item.${i + 1}`}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {feedbackOpen &&
          (() => {
            const enrollment = enrollments.find((e) => e.id === feedbackOpen);
            const courseId = enrollment?.courseId ?? feedbackOpen;
            return (
              <FeedbackForm
                key={feedbackOpen}
                targetId={courseId}
                targetType="Course"
                onSubmit={(fb) =>
                  handleFeedbackSubmit(feedbackOpen, courseId, fb)
                }
                onClose={() => setFeedbackOpen(null)}
              />
            );
          })()}
      </AnimatePresence>
    </Layout>
  );
}
