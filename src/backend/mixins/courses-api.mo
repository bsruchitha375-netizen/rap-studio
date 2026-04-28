import List "mo:core/List";
import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CourseTypes "../types/courses";
import PaymentTypes "../types/payments";
import UserTypes "../types/users";
import UserLib "../lib/users";
import CourseLib "../lib/courses";
import AnalyticsLib "../lib/analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  enrollments : List.List<CourseTypes.CourseEnrollment>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  nextEnrollmentId : Common.Counter,
  adminCourses : List.List<CourseTypes.AdminCourse>,
  nextAdminCourseId : Common.Counter,
  // lesson & quiz state
  lessons : List.List<CourseTypes.Lesson>,
  nextLessonId : Common.Counter,
  nextQuizQuestionId : Common.Counter,
  lessonProgress : List.List<CourseTypes.LessonProgress>,
  courseProgress : List.List<CourseTypes.CourseLessonProgress>,
  // activity log for enrollment events
  activityLog : List.List<AnalyticsLib.LoginEvent>,
) {
  // ── Existing public API ───────────────────────────────────────────────────

  public query func getAllCourses() : async [CourseTypes.Course] {
    CourseLib.getMergedCourses(adminCourses);
  };

  public query func getCourse(courseId : Common.CourseId) : async ?CourseTypes.Course {
    switch (CourseLib.getCourseById(courseId)) {
      case (?c) { ?c };
      case null {
        switch (CourseLib.getAdminCourseById(adminCourses, courseId)) {
          case null { null };
          case (?ac) {
            ?{
              id = ac.id;
              title = ac.title;
              category = ac.category;
              mode = ac.mode;
              price = ac.price;
              description = ac.description;
              duration = ac.duration;
              prerequisites = ac.prerequisites;
              imageUrl = "";
              status = ac.status;
            };
          };
        };
      };
    };
  };

  public query func getAdminCourseBlob(courseId : Common.CourseId) : async ?Blob {
    switch (CourseLib.getAdminCourseById(adminCourses, courseId)) {
      case null { null };
      case (?ac) { ac.imageBlob };
    };
  };

  /// Enroll in a course — FREE, no payment required.
  /// Idempotent: returns existing enrollment if already enrolled.
  /// Does NOT require a registered profile — works with any Internet Identity principal.
  public shared ({ caller }) func enrollCourse(courseId : Common.CourseId) : async CourseTypes.CourseEnrollment {
    // Check if already enrolled (idempotent — always check first before any trap)
    switch (enrollments.find(func(e) { e.userId == caller and e.courseId == courseId })) {
      case (?existing) { return existing };
      case null {};
    };
    // Allow enrollment even if no explicit profile (Internet Identity users)
    // but still require the course to exist
    let enrollment = CourseLib.enrollCourse(enrollments, adminCourses, nextEnrollmentId.value, caller, courseId);
    nextEnrollmentId.value += 1;
    // Log enrollment activity (graceful fallback if no profile)
    let userName = switch (profiles.get(caller)) {
      case (?p) { p.name };
      case null { caller.toText() };
    };
    let userRole = switch (profiles.get(caller)) {
      case (?p) { p.role };
      case null { #Student };
    };
    AnalyticsLib.recordEnrollmentEvent(activityLog, caller, userName, userRole, courseId);
    enrollment;
  };

  public query ({ caller }) func getMyEnrollments() : async [CourseTypes.CourseEnrollment] {
    CourseLib.getMyEnrollments(enrollments, caller);
  };

  public query ({ caller }) func getEnrollmentById(enrollmentId : Common.EnrollmentId) : async ?CourseTypes.CourseEnrollment {
    switch (CourseLib.getEnrollmentById(enrollments, enrollmentId)) {
      case null { null };
      case (?e) {
        if (e.userId == caller or UserLib.isRole(profiles, caller, #Admin)) {
          ?e;
        } else { null };
      };
    };
  };

  public shared ({ caller }) func markCourseComplete(enrollmentId : Common.EnrollmentId) : async { #ok : Text; #err : Text } {
    CourseLib.markCourseComplete(enrollments, lessonProgress, lessons, caller, enrollmentId);
  };

  public shared ({ caller }) func updateCourseProgress(courseId : Common.CourseId, completed : Bool) : async Bool {
    CourseLib.updateCourseProgress(enrollments, caller, courseId, completed);
  };

  public query ({ caller }) func getAllEnrollments() : async [CourseTypes.CourseEnrollment] {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.getAllEnrollments(enrollments);
  };

  public shared ({ caller }) func markEnrollmentPaid(enrollmentId : Common.EnrollmentId) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    var found = false;
    enrollments.mapInPlace(func(e) {
      if (e.id == enrollmentId) {
        found := true;
        { e with paymentStatus = #FullyPaid };
      } else { e };
    });
    found;
  };

  public shared ({ caller }) func adminAddCourse(input : CourseTypes.AdminCourseInput) : async CourseTypes.AdminCourse {
    UserLib.requireRole(profiles, caller, #Admin);
    let course = CourseLib.adminAddCourse(adminCourses, nextAdminCourseId.value, input);
    nextAdminCourseId.value += 1;
    course;
  };

  public shared ({ caller }) func adminUpdateCourse(courseId : Common.CourseId, input : CourseTypes.AdminCourseInput) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.adminUpdateCourse(adminCourses, courseId, input);
  };

  public shared ({ caller }) func adminDeleteCourse(courseId : Common.CourseId) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.adminDeleteCourse(adminCourses, courseId);
  };

  public query ({ caller }) func getAllAdminCourses() : async [CourseTypes.AdminCourse] {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.getAllAdminCourses(adminCourses);
  };

  // ── Lesson management (admin) ─────────────────────────────────────────────

  /// Add a new lesson to a course.
  public shared ({ caller }) func addLesson(input : CourseTypes.LessonInput) : async CourseTypes.Lesson {
    UserLib.requireRole(profiles, caller, #Admin);
    let lesson = CourseLib.addLesson(lessons, nextLessonId.value, input);
    nextLessonId.value += 1;
    lesson;
  };

  /// Edit an existing lesson's metadata.
  public shared ({ caller }) func editLesson(lessonId : Nat, input : CourseTypes.LessonInput) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.editLesson(lessons, lessonId, input);
  };

  /// Remove a lesson from a course.
  public shared ({ caller }) func removeLesson(lessonId : Nat) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.removeLesson(lessons, lessonId);
  };

  // ── Quiz question management (admin) ──────────────────────────────────────

  /// Add a quiz question to a lesson.
  public shared ({ caller }) func addQuizQuestion(input : CourseTypes.QuizQuestionInput) : async CourseTypes.Lesson {
    UserLib.requireRole(profiles, caller, #Admin);
    let updated = CourseLib.addQuizQuestion(lessons, nextQuizQuestionId.value, input);
    nextQuizQuestionId.value += 1;
    updated;
  };

  /// Edit an existing quiz question.
  public shared ({ caller }) func editQuizQuestion(questionId : Nat, input : CourseTypes.QuizQuestionInput) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.editQuizQuestion(lessons, questionId, input);
  };

  /// Remove a quiz question from its lesson.
  public shared ({ caller }) func removeQuizQuestion(questionId : Nat) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.removeQuizQuestion(lessons, questionId);
  };

  // ── Student learning flow ─────────────────────────────────────────────────

  /// Return all lessons for a course.
  /// Open access for preview (no enrollment required).
  /// Full lesson content (including quiz questions) gated by enrollment check.
  public query ({ caller }) func getLessons(courseId : Common.CourseId) : async [CourseTypes.Lesson] {
    let isAdmin = UserLib.isRole(profiles, caller, #Admin);
    let isEnrolled = switch (enrollments.find(func(e) { e.userId == caller and e.courseId == courseId })) {
      case null { false };
      case (?_) { true };
    };
    let allLessons = CourseLib.getLessonsByCourse(lessons, courseId);
    if (isAdmin or isEnrolled) {
      // Full access: video URLs and quiz questions visible
      allLessons;
    } else {
      // Preview: return lesson metadata only, strip quiz questions and youtube URLs
      allLessons.map<CourseTypes.Lesson, CourseTypes.Lesson>(func(l) {
        { l with youtubeUrl = ""; quizQuestions = [] }
      });
    };
  };

  /// Mark video as watched for a lesson.
  public shared ({ caller }) func markVideoWatched(lessonId : Nat) : async CourseTypes.LessonProgress {
    // Enrollment check is done inside CourseLib.markVideoWatched
    CourseLib.markVideoWatched(lessonProgress, courseProgress, lessons, enrollments, caller, lessonId);
  };

  /// Submit quiz answers for a lesson. Returns score and updated course progress.
  public shared ({ caller }) func submitQuiz(lessonId : Nat, answers : [Nat]) : async { #ok : CourseTypes.QuizResult; #err : Text } {
    // Enrollment check is done inside CourseLib.submitQuiz
    CourseLib.submitQuiz(lessonProgress, courseProgress, enrollments, lessons, caller, lessonId, answers);
  };

  /// Get aggregated course progress for the calling student.
  public query ({ caller }) func getCourseProgress(courseId : Common.CourseId) : async ?CourseTypes.CourseLessonProgress {
    CourseLib.getCourseProgress(courseProgress, caller, courseId);
  };

  /// Get per-lesson progress records for the calling student within a course.
  public query ({ caller }) func getLessonProgressForCourse(courseId : Common.CourseId) : async [CourseTypes.LessonProgress] {
    CourseLib.getLessonProgressForCourse(lessonProgress, lessons, caller, courseId);
  };

  // ── Admin view of student progress ────────────────────────────────────────

  /// Admin: view all course progress records.
  public query ({ caller }) func adminGetAllCourseProgress() : async [CourseTypes.CourseLessonProgress] {
    UserLib.requireRole(profiles, caller, #Admin);
    courseProgress.toArray();
  };

  /// Get course progress by enrollmentId — caller must be the enrolled student or admin.
  public query ({ caller }) func getCourseProgressByEnrollment(
    enrollmentId : Common.EnrollmentId,
  ) : async ?CourseTypes.CourseLessonProgress {
    let isAdmin = UserLib.isRole(profiles, caller, #Admin);
    switch (CourseLib.getEnrollmentById(enrollments, enrollmentId)) {
      case null { null };
      case (?e) {
        if (not isAdmin and e.userId != caller) {
          null // Not authorized — return null silently
        } else {
          CourseLib.getCourseProgress(courseProgress, e.userId, e.courseId);
        };
      };
    };
  };
};
