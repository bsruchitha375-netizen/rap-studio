import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { CourseDetail } from "../components/courses/CourseDetail";
import { Layout } from "../components/layout/Layout";
import { getCourseById, getCoursesByCategory } from "../data/courses";

export function CourseDetailPage() {
  const { courseId } = useParams({ from: "/courses/$courseId" });
  const course = getCourseById(courseId);

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
        isEnrolled={false}
        progress={0}
      />
    </Layout>
  );
}
