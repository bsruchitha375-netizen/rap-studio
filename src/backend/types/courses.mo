import Common "common";

module {
  public type CourseMode = {
    #Online;
    #Offline;
    #Hybrid;
  };

  public type CourseStatus = {
    #Active;
    #Inactive;
    #ComingSoon;
  };

  public type Course = {
    id : Common.CourseId;
    title : Text;
    category : Text;
    mode : CourseMode;
    price : Nat;   // always 5 (INR)
    description : Text;
    duration : Text;
    prerequisites : [Text];
    imageUrl : Text;
    status : CourseStatus;
  };

  // Admin-created course stored in canister state (imageBlob stored directly)
  public type AdminCourse = {
    id : Common.CourseId;
    title : Text;
    category : Text;
    mode : CourseMode;
    price : Nat;
    description : Text;
    duration : Text;
    prerequisites : [Text];
    imageBlob : ?Blob;
    status : CourseStatus;
    createdAt : Common.Timestamp;
  };

  // Input for admin add/update
  public type AdminCourseInput = {
    title : Text;
    category : Text;
    mode : CourseMode;
    price : Nat;
    description : Text;
    duration : Text;
    prerequisites : [Text];
    imageData : [Nat8];   // raw bytes — empty means no image
    status : CourseStatus;
  };

  public type PaymentStatus = {
    #Pending;
    #PartiallyPaid;
    #FullyPaid;
    #Overdue;
  };

  public type CourseEnrollment = {
    id : Common.EnrollmentId;
    userId : Common.UserId;
    courseId : Common.CourseId;
    enrolledAt : Common.Timestamp;
    paymentStatus : PaymentStatus;
    completedAt : ?Common.Timestamp;
    certificateCode : ?Text;
    progress : Nat;  // 0-100
  };

  // ── Lesson & Quiz types ────────────────────────────────────────────────────

  public type QuizQuestion = {
    id : Nat;
    lessonId : Nat;
    question : Text;
    options : [Text];          // exactly 4 items
    correctOptionIndex : Nat;  // 0-3
  };

  public type Lesson = {
    id : Nat;
    courseId : Common.CourseId;
    title : Text;
    description : Text;
    youtubeUrl : Text;
    order : Nat;
    quizQuestions : [QuizQuestion];
  };

  // Admin input for creating/updating a lesson (quiz managed separately)
  public type LessonInput = {
    courseId : Common.CourseId;
    title : Text;
    description : Text;
    youtubeUrl : Text;
    order : Nat;
  };

  // Admin input for creating/updating a quiz question
  public type QuizQuestionInput = {
    lessonId : Nat;
    question : Text;
    options : [Text];
    correctOptionIndex : Nat;
  };

  // ── Progress tracking types ────────────────────────────────────────────────

  // Per-student per-lesson progress
  public type LessonProgress = {
    studentId : Common.UserId;
    lessonId : Nat;
    videoWatched : Bool;
    quizScore : ?Nat;    // null = not yet attempted
    quizPassed : Bool;
    completedAt : ?Int;  // nanoseconds timestamp
  };

  // Per-student per-course aggregated progress
  public type CourseLessonProgress = {
    studentId : Common.UserId;
    courseId : Common.CourseId;
    completedLessonIds : [Nat];
    currentLessonId : ?Nat;
    overallPercent : Nat;  // 0-100
    certificateEarned : Bool;
  };

  // Result returned to student after submitting a quiz
  public type QuizResult = {
    lessonId : Nat;
    score : Nat;          // number of correct answers
    totalQuestions : Nat;
    passed : Bool;
    courseProgress : CourseLessonProgress;
  };
};
