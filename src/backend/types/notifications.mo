import Common "common";

module {
  public type NotificationType = {
    #BookingConfirmed;
    #PaymentRequired;
    #CourseEnrolled;
    #WorkDelivered;
    #GeneralInfo;
  };

  public type NotificationRecord = {
    id : Common.NotificationId;
    userId : Common.UserId;
    message : Text;
    notificationType : NotificationType;
    read : Bool;
    createdAt : Common.Timestamp;
  };

  // Simulated email log entry (email is disabled — stored for admin view only)
  public type EmailLog = {
    id : Nat;
    to : Text;
    subject : Text;
    body : Text;
    createdAt : Common.Timestamp;
    relatedId : ?Text;
  };
};
