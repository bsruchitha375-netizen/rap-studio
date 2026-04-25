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
import AnalyticsLib "../lib/analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  emailIndex : Map.Map<Text, Common.UserId>,
  phoneIndex : Map.Map<Text, Common.UserId>,
  bookings : List.List<ServiceTypes.BookingRequest>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  enrollments : List.List<CourseTypes.CourseEnrollment>,
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

  // Admin only — list all users (passwordHash omitted from response)
  public query ({ caller }) func getAllUsers() : async [UserTypes.PublicProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    profiles.values().map<UserTypes.UserProfile, UserTypes.PublicProfile>(
      func(p) { UserTypes.toPublic(p) }
    ).toArray();
  };

  // Alias used by the frontend for the Users panel — same as getAllUsers
  public query ({ caller }) func getAdminUsers() : async [UserTypes.PublicProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    profiles.values().map<UserTypes.UserProfile, UserTypes.PublicProfile>(
      func(p) { UserTypes.toPublic(p) }
    ).toArray();
  };

  // Admin only — returns last 50 activity events (bookings, enrollments, payments,
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

  /// Admin only — list all users with status #Pending (awaiting approval).
  /// Designed for frequent polling (every 5s) — efficient O(n) query-only scan.
  public query ({ caller }) func listPendingUsers() : async [UserTypes.PublicProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    UserLib.listPendingUsers(profiles);
  };

  /// Admin only — approve a pending user registration.
  /// Sets status from #Pending → #Active, allowing the user to log in.
  public shared ({ caller }) func approveUser(
    userId : Common.UserId,
  ) : async { #ok; #err : Text } {
    UserLib.approveUser(profiles, profiles, caller, userId);
  };

  /// Admin only — reject a pending user registration.
  /// Sets status to #Rejected; user cannot log in.
  public shared ({ caller }) func rejectUser(
    userId : Common.UserId,
  ) : async { #ok; #err : Text } {
    UserLib.rejectUser(profiles, profiles, caller, userId);
  };

  /// Admin only — directly create a user with any role (Staff, Receptionist, Student, Client, Admin).
  /// The created account is immediately #Active — no approval step needed.
  /// Returns the new user's public profile on success, or an error text if email/phone is duplicate.
  public shared ({ caller }) func adminCreateUser(
    email : Text,
    name : Text,
    phone : Text,
    passwordHash : Text,
    role : UserTypes.UserRole,
    address : ?Text,
    studentDetails : ?UserTypes.StudentDetails,
  ) : async { #ok : UserTypes.PublicProfile; #err : Text } {
    UserLib.adminCreateUser(profiles, emailIndex, phoneIndex, profiles, caller, email, name, phone, passwordHash, role, address, studentDetails);
  };

  /// Admin only — permanently delete any user account and remove all their index entries.
  /// Returns ok(()) on success, err("User not found") if the userId does not exist.
  public shared ({ caller }) func deleteUser(
    userId : Common.UserId,
  ) : async { #ok; #err : Text } {
    UserLib.deleteUser(profiles, emailIndex, phoneIndex, profiles, caller, userId);
  };
};
