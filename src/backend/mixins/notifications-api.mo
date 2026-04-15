import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import NotifTypes "../types/notifications";
import UserTypes "../types/users";
import UserLib "../lib/users";
import NotifLib "../lib/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  notifications : List.List<NotifTypes.NotificationRecord>,
  nextNotifId : Common.Counter,
  emailLogs : List.List<NotifTypes.EmailLog>,
  nextEmailLogId : Common.Counter,
) {
  // User — own notifications
  public query ({ caller }) func getMyNotifications() : async [NotifTypes.NotificationRecord] {
    NotifLib.getMyNotifications(notifications, caller);
  };

  // User — mark one notification as read
  public shared ({ caller }) func markNotificationRead(
    notificationId : Common.NotificationId,
  ) : async Bool {
    NotifLib.markRead(notifications, notificationId, caller);
  };

  // Admin / Staff — create system notification for a user
  public shared ({ caller }) func createSystemNotification(
    userId : Common.UserId,
    message : Text,
    notifType : NotifTypes.NotificationType,
  ) : async NotifTypes.NotificationRecord {
    UserLib.requireAdminOrStaff(profiles, caller);
    let notif = NotifLib.createNotification(
      notifications,
      nextNotifId.value,
      userId,
      message,
      notifType,
      Time.now(),
    );
    nextNotifId.value += 1;
    notif;
  };

  // Admin / Staff — send WhatsApp notification (frontend handles wa.me link)
  public shared ({ caller }) func sendWhatsAppNotification(
    phone : Text,
    message : Text,
  ) : async Bool {
    UserLib.requireAdminOrStaff(profiles, caller);
    let _ = NotifLib.createNotification(
      notifications,
      nextNotifId.value,
      caller,
      "WhatsApp sent to " # phone # ": " # message,
      #GeneralInfo,
      Time.now(),
    );
    nextNotifId.value += 1;
    true;
  };

  // Admin only — view all simulated email logs
  public query ({ caller }) func getEmailLogs() : async [NotifTypes.EmailLog] {
    UserLib.requireRole(profiles, caller, #Admin);
    NotifLib.getEmailLogs(emailLogs);
  };

  // Internal helper — log a simulated booking confirmation email (called after createBookingRequest)
  public shared ({ caller }) func logBookingConfirmedEmail(
    toAddress : Text,
    bookingId : Text,
    serviceName : Text,
    date : Text,
  ) : async NotifTypes.EmailLog {
    UserLib.requireAdminOrStaff(profiles, caller);
    let log = NotifLib.createBookingConfirmedEmail(
      emailLogs,
      nextEmailLogId.value,
      toAddress,
      bookingId,
      serviceName,
      date,
      Time.now(),
    );
    nextEmailLogId.value += 1;
    log;
  };

  // Internal helper — log a simulated enrollment confirmation email
  public shared ({ caller }) func logEnrollmentConfirmedEmail(
    toAddress : Text,
    enrollmentId : Text,
    courseTitle : Text,
  ) : async NotifTypes.EmailLog {
    UserLib.requireAdminOrStaff(profiles, caller);
    let log = NotifLib.createEnrollmentConfirmedEmail(
      emailLogs,
      nextEmailLogId.value,
      toAddress,
      enrollmentId,
      courseTitle,
      Time.now(),
    );
    nextEmailLogId.value += 1;
    log;
  };
};
