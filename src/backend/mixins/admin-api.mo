import List "mo:core/List";
import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import UserTypes "../types/users";
import ServiceTypes "../types/services";
import PaymentTypes "../types/payments";
import CourseTypes "../types/courses";
import FeedbackTypes "../types/feedback";
import NotifTypes "../types/notifications";
import AnalyticsTypes "../types/analytics";
import CmsPayTypes "../types/cms-multiservice-payments";
import UserLib "../lib/users";
import CourseLib "../lib/courses";
import AnalyticsLib "../lib/analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  emailIndex : Map.Map<Text, Common.UserId>,
  phoneIndex : Map.Map<Text, Common.UserId>,
  bookings : List.List<ServiceTypes.BookingRequest>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  enrollments : List.List<CourseTypes.CourseEnrollment>,
  adminCourses : List.List<CourseTypes.AdminCourse>,
  lessonProgress : List.List<CourseTypes.LessonProgress>,
  courseProgress : List.List<CourseTypes.CourseLessonProgress>,
  feedbacks : List.List<FeedbackTypes.Feedback>,
  emailLogs : List.List<NotifTypes.EmailLog>,
  cmsStore : Map.Map<Text, CmsPayTypes.CmsContent>,
  multiBookings : List.List<CmsPayTypes.MultiServiceBooking>,
  activityLog : List.List<AnalyticsLib.LoginEvent>,
) {
  // Admin only — full platform analytics including user count
  public query ({ caller }) func getAnalytics() : async AnalyticsTypes.AnalyticsSummary {
    UserLib.requireRole(profiles, caller, #Admin);
    AnalyticsLib.getBookingStats(bookings, paymentOrders, enrollments, feedbacks, emailLogs, cmsStore, multiBookings, profiles);
  };

  // Alias used by the frontend for the Users panel — same as getAllUsers (defined in users-api)
  public query ({ caller }) func getAdminUsers() : async [UserTypes.PublicProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    profiles.values().map<UserTypes.UserProfile, UserTypes.PublicProfile>(
      func(p) { UserTypes.toPublic(p) }
    ).toArray();
  };

  // Admin only — returns last 100 activity events (bookings, enrollments, payments,
  // registrations, logins) sorted by timestamp descending. Powers the live activity feed.
  public query ({ caller }) func getRecentActivity() : async [AnalyticsTypes.ActivityEvent] {
    UserLib.requireRole(profiles, caller, #Admin);
    AnalyticsLib.getRecentActivity(bookings, enrollments, paymentOrders, profiles, activityLog);
  };

  // Alias — same data, exposed as getAllActivityEvents for frontend compatibility
  public query ({ caller }) func getAllActivityEvents() : async [AnalyticsTypes.ActivityEvent] {
    UserLib.requireRole(profiles, caller, #Admin);
    AnalyticsLib.getRecentActivity(bookings, enrollments, paymentOrders, profiles, activityLog);
  };

  /// Admin only — all enrollments enriched with student name, email, and course label.
  /// Used by the admin dashboard Enrollments panel for live display.
  public query ({ caller }) func getAdminEnrollments() : async [{
    id : Common.EnrollmentId;
    userId : Common.UserId;
    courseId : Common.CourseId;
    enrolledAt : Common.Timestamp;
    paymentStatus : CourseTypes.PaymentStatus;
    completedAt : ?Common.Timestamp;
    certificateCode : ?Text;
    progress : Nat;
    studentName : Text;
    studentEmail : Text;
    courseName : Text;
  }] {
    UserLib.requireRole(profiles, caller, #Admin);
    enrollments.map<CourseTypes.CourseEnrollment, {
      id : Common.EnrollmentId;
      userId : Common.UserId;
      courseId : Common.CourseId;
      enrolledAt : Common.Timestamp;
      paymentStatus : CourseTypes.PaymentStatus;
      completedAt : ?Common.Timestamp;
      certificateCode : ?Text;
      progress : Nat;
      studentName : Text;
      studentEmail : Text;
      courseName : Text;
    }>(func(e) {
      let (sName, sEmail) = switch (profiles.get(e.userId)) {
        case (?p) { (p.name, p.email) };
        case null { (e.userId.toText(), "") };
      };
      // Resolve course name from static list first, then admin courses
      let cName = switch (CourseLib.getCourseById(e.courseId)) {
        case (?c) { c.title };
        case null {
          switch (CourseLib.getAdminCourseById(adminCourses, e.courseId)) {
            case (?ac) { ac.title };
            case null { "Course #" # e.courseId.toText() };
          };
        };
      };
      {
        id = e.id;
        userId = e.userId;
        courseId = e.courseId;
        enrolledAt = e.enrolledAt;
        paymentStatus = e.paymentStatus;
        completedAt = e.completedAt;
        certificateCode = e.certificateCode;
        progress = e.progress;
        studentName = sName;
        studentEmail = sEmail;
        courseName = cName;
      };
    }).toArray();
  };

  /// Admin only — all bookings enriched with client name and email.
  public query ({ caller }) func getAdminBookings() : async [{
    id : Common.BookingId;
    userId : Common.UserId;
    serviceId : Text;
    subService : Text;
    date : Text;
    timeSlot : ServiceTypes.TimeSlot;
    duration : Text;
    location : ServiceTypes.LocationType;
    status : ServiceTypes.BookingStatus;
    createdAt : Common.Timestamp;
    notes : ?Text;
    rejectedReason : ?Text;
    rescheduledDate : ?Text;
    rescheduledTime : ?Text;
    clientName : Text;
    clientEmail : Text;
  }] {
    UserLib.requireRole(profiles, caller, #Admin);
    bookings.map<ServiceTypes.BookingRequest, {
      id : Common.BookingId;
      userId : Common.UserId;
      serviceId : Text;
      subService : Text;
      date : Text;
      timeSlot : ServiceTypes.TimeSlot;
      duration : Text;
      location : ServiceTypes.LocationType;
      status : ServiceTypes.BookingStatus;
      createdAt : Common.Timestamp;
      notes : ?Text;
      rejectedReason : ?Text;
      rescheduledDate : ?Text;
      rescheduledTime : ?Text;
      clientName : Text;
      clientEmail : Text;
    }>(func(b) {
      let (cName, cEmail) = switch (profiles.get(b.userId)) {
        case (?p) { (p.name, p.email) };
        case null { (b.userId.toText(), "") };
      };
      {
        id = b.id;
        userId = b.userId;
        serviceId = b.serviceId;
        subService = b.subService;
        date = b.date;
        timeSlot = b.timeSlot;
        duration = b.duration;
        location = b.location;
        status = b.status;
        createdAt = b.createdAt;
        notes = b.notes;
        rejectedReason = b.rejectedReason;
        rescheduledDate = b.rescheduledDate;
        rescheduledTime = b.rescheduledTime;
        clientName = cName;
        clientEmail = cEmail;
      };
    }).toArray();
  };

  /// Admin only — single call that returns everything the admin dashboard needs for initial load.
  /// Reduces multiple round-trips to 1 on first render.
  public query ({ caller }) func getAdminDashboardData() : async {
    analytics : AnalyticsTypes.AnalyticsSummary;
    recentActivity : [AnalyticsTypes.ActivityEvent];
    pendingUsers : [UserTypes.PublicProfile];
    totalUsers : Nat;
    totalBookings : Nat;
    totalEnrollments : Nat;
    totalPayments : Nat;
  } {
    UserLib.requireRole(profiles, caller, #Admin);
    let analytics = AnalyticsLib.getBookingStats(bookings, paymentOrders, enrollments, feedbacks, emailLogs, cmsStore, multiBookings, profiles);
    let recentActivity = AnalyticsLib.getRecentActivity(bookings, enrollments, paymentOrders, profiles, activityLog);
    let pendingUsers = UserLib.listPendingUsers(profiles);
    {
      analytics = analytics;
      recentActivity = recentActivity;
      pendingUsers = pendingUsers;
      totalUsers = profiles.size();
      totalBookings = bookings.size();
      totalEnrollments = enrollments.size();
      totalPayments = paymentOrders.size();
    };
  };

  /// Admin only — toggle the mode of an admin-added course (Online / Offline / Hybrid).
  public shared ({ caller }) func updateCourseMode(
    courseId : Common.CourseId,
    mode : CourseTypes.CourseMode,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.updateCourseMode(adminCourses, courseId, mode);
  };

  /// Admin only — all students enrolled in a specific course with their progress.
  public query ({ caller }) func getEnrollmentsByCourse(
    courseId : Common.CourseId,
  ) : async [{
    enrollment : CourseTypes.CourseEnrollment;
    progress : ?CourseTypes.CourseLessonProgress;
  }] {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.getEnrollmentsByCourse(enrollments, courseProgress, courseId);
  };

  /// Admin only — clean up enrollments that reference deleted courses.
  /// Returns the count of removed stale enrollment records.
  public shared ({ caller }) func clearStaleEnrollments() : async Nat {
    UserLib.requireRole(profiles, caller, #Admin);
    CourseLib.clearStaleEnrollments(enrollments, adminCourses);
  };

  /// Canister readiness ping — returns a status summary for actor warmup on app boot.
  /// No auth required — safe to call anonymously for connection warmup.
  public query func ping() : async {
    status : Text;
    userCount : Nat;
    enrollmentCount : Nat;
    bookingCount : Nat;
  } {
    {
      status = "ok";
      userCount = profiles.size();
      enrollmentCount = enrollments.size();
      bookingCount = bookings.size();
    };
  };
};
