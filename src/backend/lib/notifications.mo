import List "mo:core/List";
import Int "mo:core/Int";
import Common "../types/common";
import NotifTypes "../types/notifications";

module {
  public func createNotification(
    notifications : List.List<NotifTypes.NotificationRecord>,
    nextId : Nat,
    userId : Common.UserId,
    message : Text,
    notifType : NotifTypes.NotificationType,
    createdAt : Common.Timestamp,
  ) : NotifTypes.NotificationRecord {
    let notif : NotifTypes.NotificationRecord = {
      id = nextId;
      userId = userId;
      message = message;
      notificationType = notifType;
      read = false;
      createdAt = createdAt;
    };
    notifications.add(notif);
    notif;
  };

  public func getMyNotifications(
    notifications : List.List<NotifTypes.NotificationRecord>,
    caller : Common.UserId,
  ) : [NotifTypes.NotificationRecord] {
    let mine = notifications.filter(func(n) { n.userId == caller });
    mine.sortInPlace(func(a, b) { Int.compare(b.createdAt, a.createdAt) });
    mine.toArray();
  };

  public func markRead(
    notifications : List.List<NotifTypes.NotificationRecord>,
    notificationId : Common.NotificationId,
    caller : Common.UserId,
  ) : Bool {
    var found = false;
    notifications.mapInPlace(func(n) {
      if (n.id == notificationId and n.userId == caller) {
        found := true;
        { n with read = true };
      } else { n };
    });
    found;
  };

  // Simulated email log — stores email entries that would have been sent
  public func logSimulatedEmail(
    emailLogs : List.List<NotifTypes.EmailLog>,
    nextId : Nat,
    toAddress : Text,
    subject : Text,
    body : Text,
    createdAt : Common.Timestamp,
    relatedId : ?Text,
  ) : NotifTypes.EmailLog {
    let log : NotifTypes.EmailLog = {
      id = nextId;
      to = toAddress;
      subject = subject;
      body = body;
      createdAt = createdAt;
      relatedId = relatedId;
    };
    emailLogs.add(log);
    log;
  };

  public func getEmailLogs(
    emailLogs : List.List<NotifTypes.EmailLog>,
  ) : [NotifTypes.EmailLog] {
    emailLogs.toArray();
  };

  // Helper — create booking confirmation simulated email
  public func createBookingConfirmedEmail(
    emailLogs : List.List<NotifTypes.EmailLog>,
    nextId : Nat,
    toAddress : Text,
    bookingId : Text,
    serviceName : Text,
    date : Text,
    createdAt : Common.Timestamp,
  ) : NotifTypes.EmailLog {
    let subject = "Booking Confirmed — RAP Studio #" # bookingId;
    let body = "Dear Client,\n\nYour booking for " # serviceName # " on " # date # " has been confirmed.\nBooking ID: " # bookingId # "\n\nPlease pay the ₹2 deposit to complete your booking.\n\nRegards,\nRAP Integrated Studio";
    logSimulatedEmail(emailLogs, nextId, toAddress, subject, body, createdAt, ?bookingId);
  };

  // Helper — create enrollment confirmation simulated email
  public func createEnrollmentConfirmedEmail(
    emailLogs : List.List<NotifTypes.EmailLog>,
    nextId : Nat,
    toAddress : Text,
    enrollmentId : Text,
    courseTitle : Text,
    createdAt : Common.Timestamp,
  ) : NotifTypes.EmailLog {
    let subject = "Course Enrollment Confirmed — RAP Studio";
    let body = "Dear Student,\n\nYou have been enrolled in " # courseTitle # ".\nEnrollment ID: " # enrollmentId # "\n\nPlease complete your payment of ₹5 to access the course.\n\nRegards,\nRAP Integrated Studio";
    logSimulatedEmail(emailLogs, nextId, toAddress, subject, body, createdAt, ?enrollmentId);
  };
};
