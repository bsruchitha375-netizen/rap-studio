import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { CourseDetail } from "../components/courses/CourseDetail";
import { Layout } from "../components/layout/Layout";
import { getCourseById, getCoursesByCategory } from "../data/courses";
import { useAuth } from "../hooks/useAuth";
import {
  useCourses,
  useEnrollCourse,
  useMyEnrollments,
} from "../hooks/useBackend";

export function CourseDetailPage() {
  const { courseId } = useParams({ from: "/courses/$courseId" });
  const { isAuthenticated } = useAuth();

  const staticCourse = getCourseById(courseId);
  const { data: backendCourses = [] } = useCourses();
  const { data: enrollments = [], refetch: refetchEnrollments } =
    useMyEnrollments();
  const enrollCourseMutation = useEnrollCourse();

  const course = useMemo(() => {
    if (staticCourse) return staticCourse;
    const bc = backendCourses.find((c) => String(c.id) === courseId);
    if (!bc) return undefined;
    return bc;
  }, [staticCourse, backendCourses, courseId]);

  const isEnrolled = useMemo(
    () =>
      isAuthenticated &&
      enrollments.some((e) => String(e.courseId) === String(courseId)),
    [enrollments, courseId, isAuthenticated],
  );

  const enrollment = useMemo(
    () =>
      enrollments.find((e) => String(e.courseId) === String(courseId)) ?? null,
    [enrollments, courseId],
  );

  const progress = enrollment?.progress ?? 0;

  // Handle enroll: await confirmation before navigating to ensure no race
  const handleEnroll = async (cId: string) => {
    if (!isAuthenticated) {
      window.location.href = `/login?return=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const numId = Number.parseInt(cId, 10);
    if (Number.isNaN(numId) || numId <= 0) {
      toast.error("Invalid course. Please try again.");
      return;
    }
    try {
      const enrolled = await enrollCourseMutation.mutateAsync(numId);
      // Wait for enrollments query to update — prevents race on learn page
      await refetchEnrollments();
      toast.success("Enrolled successfully! Opening your lessons…");
      // Use the backend enrollment's courseId for the learn URL
      const learnId = enrolled?.courseId ?? cId;
      window.location.href = `/course/${String(learnId)}/learn`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists")
      ) {
        await refetchEnrollments();
        window.location.href = `/course/${cId}/learn`;
        return;
      }
      toast.error("Enrollment failed. Please try again.");
      throw err;
    }
  };

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Course Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or may have been
            removed.
          </p>
          <Link to="/courses">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Browse All Courses
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const related = getCoursesByCategory(course.category)
    .filter((c) => c.id !== course.id)
    .slice(0, 3);

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-20 pb-0">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          data-ocid="course-breadcrumb"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Courses
        </Link>
      </div>

      <CourseDetail
        course={course}
        relatedCourses={related}
        isEnrolled={isEnrolled}
        progress={progress}
        onEnroll={() => void handleEnroll(courseId)}
        isEnrolling={enrollCourseMutation.isPending}
      />
    </Layout>
  );
}
