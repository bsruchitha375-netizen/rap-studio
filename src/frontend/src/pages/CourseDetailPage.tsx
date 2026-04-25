import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { CourseDetail } from "../components/courses/CourseDetail";
import { Layout } from "../components/layout/Layout";
import { getCourseById, getCoursesByCategory } from "../data/courses";
import { useAuth } from "../hooks/useAuth";
import { useCourses, useMyEnrollments } from "../hooks/useBackend";

export function CourseDetailPage() {
  const { courseId } = useParams({ from: "/courses/$courseId" });
  const { isAuthenticated } = useAuth();

  // Try static data first (for fast load), then backend data
  const staticCourse = getCourseById(courseId);
  const { data: backendCourses = [] } = useCourses();
  const { data: enrollments = [] } = useMyEnrollments();

  // Find course — prefer static data (richer syllabus etc.), fall back to backend
  const course = useMemo(() => {
    if (staticCourse) return staticCourse;
    const bc = backendCourses.find((c) => String(c.id) === courseId);
    if (!bc) return undefined;
    return bc;
  }, [staticCourse, backendCourses, courseId]);

  // Check if already enrolled
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
      />
    </Layout>
  );
}
