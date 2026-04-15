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
  bookings : List.List<ServiceTypes.BookingRequest>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  enrollments : List.List<CourseTypes.CourseEnrollment>,
  feedbacks : List.List<FeedbackTypes.Feedback>,
  emailLogs : List.List<NotifTypes.EmailLog>,
  cmsStore : Map.Map<Text, CmsPayTypes.CmsContent>,
  multiBookings : List.List<CmsPayTypes.MultiServiceBooking>,
) {
  // Admin only — full platform analytics including CMS + multi-service booking counts
  public query ({ caller }) func getAnalytics() : async AnalyticsTypes.BookingStats {
    UserLib.requireRole(profiles, caller, #Admin);
    AnalyticsLib.getBookingStats(bookings, paymentOrders, enrollments, feedbacks, emailLogs, cmsStore, multiBookings);
  };

  // Admin only — list all users
  public query ({ caller }) func getAllUsers() : async [UserTypes.UserProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    profiles.values().toArray();
  };
};
