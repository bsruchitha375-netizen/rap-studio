import Common "common";

module {
  public type NotificationType = {
    #BookingConfirmed;
    #BookingReminder;
    #BookingCompleted;
    #PaymentReceipt;
    #CourseEnrolled;
    #CourseCompleted;
    #WorkDelivered;
    #GeneralInfo;
  };

  public type NotificationChannel = {
    #Email;
    #WhatsApp;
    #InApp;
  };

  public type NotificationRecord = {
    id : Common.NotificationId;
    userId : Common.UserId;
    message : Text;
    notificationType : NotificationType;
    read : Bool;
    createdAt : Common.Timestamp;
  };

  // Delivery log entry for email and WhatsApp dispatches
  public type EmailLog = {
    id : Nat;
    to : Text;           // email address
    subject : Text;
    body : Text;
    createdAt : Common.Timestamp;
    relatedId : ?Text;   // bookingId, enrollmentId, or paymentId
    sent : Bool;         // true if email extension accepted the send
  };

  public type WhatsAppLog = {
    id : Nat;
    phone : Text;        // E.164 phone number e.g. "+917338501228"
    message : Text;
    createdAt : Common.Timestamp;
    relatedId : ?Text;
    sent : Bool;         // true if http-outcall succeeded
  };

  // Structured booking/enrollment details for notification templates
  public type BookingDetails = {
    bookingId : Text;
    serviceName : Text;
    date : Text;
    time : Text;
    location : Text;
    totalAmount : Nat;   // in paise
    clientEmail : Text;
    clientPhone : Text;  // E.164 format
  };

  public type PaymentReceiptDetails = {
    paymentId : Text;
    referenceId : Text;  // bookingId or enrollmentId
    amount : Nat;        // in paise
    currency : Text;
    paidAt : Text;
    clientEmail : Text;
    clientPhone : Text;
  };
};
