import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CourseTypes "../types/courses";
import PaymentTypes "../types/payments";
import UserTypes "../types/users";
import UserLib "../lib/users";
import CourseLib "../lib/courses";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  enrollments : List.List<CourseTypes.CourseEnrollment>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  nextEnrollmentId : Common.Counter,
) {
  // Public
  public query func getAllCourses() : async [CourseTypes.Course] {
    CourseLib.getAllCourses();
  };

  public query func getCourse(courseId : Common.CourseId) : async ?CourseTypes.Course {
    CourseLib.getCourseById(courseId);
  };

  // Student — enroll; enrollment created with PaymentStatus=#Pending
  // Caller must then call createPaymentOrder for the enrollment
  public shared ({ caller }) func enrollCourse(
    courseId : Common.CourseId,
  ) : async CourseTypes.CourseEnrollment {
    switch (profiles.get(caller)) {
      case null { Runtime.trap("Please register first") };
      case (?_) {};
    };
    let enrollment = CourseLib.enrollCourse(enrollments, nextEnrollmentId.value, caller, courseId);
    nextEnrollmentId.value += 1;
    enrollment;
  };

  // Student — own enrollments
  public query ({ caller }) func getMyEnrollments() : async [CourseTypes.CourseEnrollment] {
    CourseLib.getMyEnrollments(enrollments, caller);
  };

  // Student — mark progress / completion
  public shared ({ caller }) func updateCourseProgress(
    courseId : Common.CourseId,
    completed : Bool,
  ) : async Bool {
    CourseLib.updateCourseProgress(enrollments, caller, courseId, completed);
  };

  // Admin — all enrollments
  public query ({ caller }) func getAllEnrollments() : async [CourseTypes.CourseEnrollment] {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.getAllEnrollments(enrollments);
  };

  // Admin — mark enrollment payment as fully paid
  public shared ({ caller }) func markEnrollmentPaid(
    enrollmentId : Common.EnrollmentId,
  ) : async Bool {
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
};
