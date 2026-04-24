import List "mo:core/List";
import Principal "mo:core/Principal";
import Common "../types/common";
import NotifTypes "../types/notifications";

module {
  // Creates and appends an in-app NotificationRecord.
  public func createNotification(
    notifications : List.List<NotifTypes.NotificationRecord>,
    nextId : Nat,
    userId : Common.UserId,
    message : Text,
    notifType : NotifTypes.NotificationType,
    createdAt : Common.Timestamp,
  ) : NotifTypes.NotificationRecord {
    let record : NotifTypes.NotificationRecord = {
      id = nextId;
      userId = userId;
      message = message;
      notificationType = notifType;
      read = false;
      createdAt = createdAt;
    };
    notifications.add(record);
    record;
  };

  // Returns all notifications for the caller, newest first.
  public func getMyNotifications(
    notifications : List.List<NotifTypes.NotificationRecord>,
    caller : Common.UserId,
  ) : [NotifTypes.NotificationRecord] {
    notifications
      .filter(func(n) { Principal.equal(n.userId, caller) })
      .reverse()
      .toArray();
  };

  // Marks a notification as read. Returns false if not found or wrong owner.
  public func markRead(
    notifications : List.List<NotifTypes.NotificationRecord>,
    notificationId : Common.NotificationId,
    caller : Common.UserId,
  ) : Bool {
    var found = false;
    notifications.mapInPlace(func(n) {
      if (n.id == notificationId and Principal.equal(n.userId, caller)) {
        found := true;
        { n with read = true };
      } else { n };
    });
    found;
  };

  // Appends an EmailLog entry (real send dispatched via email extension in the mixin).
  public func logEmail(
    emailLogs : List.List<NotifTypes.EmailLog>,
    nextId : Nat,
    toAddress : Text,
    subject : Text,
    body : Text,
    createdAt : Common.Timestamp,
    relatedId : ?Text,
    sent : Bool,
  ) : NotifTypes.EmailLog {
    let entry : NotifTypes.EmailLog = {
      id = nextId;
      to = toAddress;
      subject = subject;
      body = body;
      createdAt = createdAt;
      relatedId = relatedId;
      sent = sent;
    };
    emailLogs.add(entry);
    entry;
  };

  // Appends a WhatsAppLog entry (real send dispatched via http-outcalls in the mixin).
  public func logWhatsApp(
    whatsappLogs : List.List<NotifTypes.WhatsAppLog>,
    nextId : Nat,
    phone : Text,
    message : Text,
    createdAt : Common.Timestamp,
    relatedId : ?Text,
    sent : Bool,
  ) : NotifTypes.WhatsAppLog {
    let entry : NotifTypes.WhatsAppLog = {
      id = nextId;
      phone = phone;
      message = message;
      createdAt = createdAt;
      relatedId = relatedId;
      sent = sent;
    };
    whatsappLogs.add(entry);
    entry;
  };

  // Returns all email logs (admin only — caller check in mixin).
  public func getEmailLogs(
    emailLogs : List.List<NotifTypes.EmailLog>,
  ) : [NotifTypes.EmailLog] {
    emailLogs.toArray();
  };

  // Returns all WhatsApp logs (admin only — caller check in mixin).
  public func getWhatsAppLogs(
    whatsappLogs : List.List<NotifTypes.WhatsAppLog>,
  ) : [NotifTypes.WhatsAppLog] {
    whatsappLogs.toArray();
  };

  // Builds the booking confirmation email subject and body text.
  public func buildBookingConfirmationEmail(
    details : NotifTypes.BookingDetails,
  ) : (Text, Text) {
    let subject = "Booking Confirmed — RAP Studio: " # details.serviceName;
    let body =
      "Dear Valued Client,\n\n" #
      "Your booking at RAP Studio has been confirmed.\n\n" #
      "Booking ID: " # details.bookingId # "\n" #
      "Service: " # details.serviceName # "\n" #
      "Date: " # details.date # "\n" #
      "Time: " # details.time # "\n" #
      "Location: " # details.location # "\n" #
      "Total Amount: ₹" # (details.totalAmount / 100).toText() # "\n\n" #
      "Please arrive 10 minutes before your scheduled time.\n\n" #
      "Thank you for choosing RAP Integrated Studio.\n" #
      "— RUCHITHA B S, ASHITHA S, PRARTHANA R";
    (subject, body);
  };

  // Builds the payment receipt email subject and body text.
  public func buildPaymentReceiptEmail(
    details : NotifTypes.PaymentReceiptDetails,
  ) : (Text, Text) {
    let subject = "Payment Receipt — RAP Studio #" # details.paymentId;
    let body =
      "Dear Valued Client,\n\n" #
      "Your payment has been received and confirmed.\n\n" #
      "Payment ID: " # details.paymentId # "\n" #
      "Reference: " # details.referenceId # "\n" #
      "Amount: " # details.amount.toText() # " " # details.currency # "\n" #
      "Paid At: " # details.paidAt # "\n\n" #
      "Thank you for your payment. We look forward to serving you.\n\n" #
      "— RAP Integrated Studio";
    (subject, body);
  };

  // Builds the 24-hour reminder email subject and body text.
  public func buildProgressReminderEmail(
    details : NotifTypes.BookingDetails,
  ) : (Text, Text) {
    let subject = "Reminder: Your RAP Studio session tomorrow — " # details.serviceName;
    let body =
      "Dear Valued Client,\n\n" #
      "This is a friendly reminder about your upcoming session.\n\n" #
      "Service: " # details.serviceName # "\n" #
      "Date: " # details.date # "\n" #
      "Time: " # details.time # "\n" #
      "Location: " # details.location # "\n\n" #
      "Please ensure you are prepared and arrive on time.\n\n" #
      "— RAP Integrated Studio";
    (subject, body);
  };

  // Builds the completion + feedback-link email subject and body text.
  public func buildCompletionEmail(
    details : NotifTypes.BookingDetails,
    feedbackLink : Text,
  ) : (Text, Text) {
    let subject = "Session Complete — Thank you for choosing RAP Studio";
    let body =
      "Dear Valued Client,\n\n" #
      "Your session has been completed. Thank you for choosing RAP Integrated Studio.\n\n" #
      "Service: " # details.serviceName # "\n" #
      "Booking ID: " # details.bookingId # "\n\n" #
      "We would love to hear your feedback:\n" # feedbackLink # "\n\n" #
      "Your review helps us grow and serve you better.\n\n" #
      "— RUCHITHA B S, ASHITHA S, PRARTHANA R";
    (subject, body);
  };

  // Builds the WhatsApp message text for a booking confirmation.
  public func buildBookingConfirmationWhatsApp(
    details : NotifTypes.BookingDetails,
  ) : Text {
    "✅ *Booking Confirmed — RAP Studio*\n\n" #
    "📋 Booking ID: " # details.bookingId # "\n" #
    "🎬 Service: " # details.serviceName # "\n" #
    "📅 Date: " # details.date # "\n" #
    "⏰ Time: " # details.time # "\n" #
    "📍 Location: " # details.location # "\n" #
    "💰 Total: ₹" # (details.totalAmount / 100).toText() # "\n\n" #
    "Please arrive 10 mins early. Thank you for choosing RAP Studio! 🎥";
  };

  // Builds the WhatsApp message text for a payment receipt.
  public func buildPaymentReceiptWhatsApp(
    details : NotifTypes.PaymentReceiptDetails,
  ) : Text {
    "🧾 *Payment Receipt — RAP Studio*\n\n" #
    "Payment ID: " # details.paymentId # "\n" #
    "Reference: " # details.referenceId # "\n" #
    "Amount: " # details.amount.toText() # " " # details.currency # "\n" #
    "Paid: " # details.paidAt # "\n\n" #
    "Your payment is confirmed. Thank you! 🙏";
  };

  // Builds the WhatsApp message text for a 24-hour reminder.
  public func buildProgressReminderWhatsApp(
    details : NotifTypes.BookingDetails,
  ) : Text {
    "⏰ *Reminder — RAP Studio Session Tomorrow*\n\n" #
    "🎬 Service: " # details.serviceName # "\n" #
    "📅 Date: " # details.date # "\n" #
    "⏰ Time: " # details.time # "\n" #
    "📍 Location: " # details.location # "\n\n" #
    "Get ready and see you tomorrow! 🎥";
  };

  // Builds the WhatsApp message text for a completion + feedback message.
  public func buildCompletionWhatsApp(
    details : NotifTypes.BookingDetails,
    feedbackLink : Text,
  ) : Text {
    "🎉 *Session Complete — RAP Studio*\n\n" #
    "Thank you for choosing RAP Integrated Studio!\n" #
    "Service: " # details.serviceName # "\n\n" #
    "We'd love your feedback 🙏\n" # feedbackLink;
  };
};
