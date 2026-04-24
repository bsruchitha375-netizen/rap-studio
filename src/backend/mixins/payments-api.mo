import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Common "../types/common";
import PaymentTypes "../types/payments";
import ServiceTypes "../types/services";
import UserTypes "../types/users";
import NotifTypes "../types/notifications";
import UserLib "../lib/users";
import PaymentLib "../lib/payments";
import ServiceLib "../lib/services";
import NotifLib "../lib/notifications";
import StripeLib "../lib/stripe";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  nextPaymentId : Common.Counter,
  bookings : List.List<ServiceTypes.BookingRequest>,
  whatsappLogs : List.List<NotifTypes.WhatsAppLog>,
  nextWhatsAppLogId : Common.Counter,
  notifications : List.List<NotifTypes.NotificationRecord>,
  nextNotifId : Common.Counter,
) {
  // Required transform function for HTTP outcalls — strips non-deterministic headers.
  public query func transform(
    input : OutCall.TransformationInput,
  ) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Creates a Stripe Checkout Session and a local PaymentOrder record.
  // amount is in paise (INR). Returns PaymentOrder with checkoutUrl populated.
  public shared ({ caller }) func createPaymentOrder(
    amount : Nat,
    referenceId : Text,
    paymentType : PaymentTypes.PaymentType,
  ) : async PaymentTypes.PaymentOrder {
    switch (profiles.get(caller)) {
      case null { Runtime.trap("Not registered") };
      case (?_) {};
    };

    let stripeSecretKey = "sk_test_placeholder"; // Set via admin config / environment
    let successUrl = "https://rap-studio.icp0.io/booking?payment=success&session_id={CHECKOUT_SESSION_ID}";
    let cancelUrl = "https://rap-studio.icp0.io/booking?payment=cancelled";
    let metadata : [(Text, Text)] = [
      ("referenceId", referenceId),
      ("userId", caller.toText()),
      ("paymentType", paymentTypeToText(paymentType)),
    ];

    let sessionJson = await StripeLib.createCheckoutSession(
      transform,
      stripeSecretKey,
      amount,
      "inr",
      successUrl,
      cancelUrl,
      metadata,
    );

    let sessionId = switch (StripeLib.extractJsonField(sessionJson, "id")) {
      case (?sid) { sid };
      case null { Runtime.trap("Stripe session creation failed: missing id") };
    };
    let checkoutUrl = StripeLib.extractJsonField(sessionJson, "url");

    let currentId = nextPaymentId.value;
    nextPaymentId.value += 1;
    let order = PaymentLib.createPaymentOrder(
      paymentOrders,
      currentId,
      caller,
      sessionId,
      amount,
      paymentType,
      referenceId,
    );
    { order with checkoutUrl = checkoutUrl };
  };

  // Called after Stripe redirects back to successUrl.
  // Verifies session server-side, marks the order Paid, updates booking status,
  // and logs a WhatsApp confirmation message.
  public shared ({ caller }) func confirmPayment(
    confirmation : PaymentTypes.StripeConfirmation,
  ) : async Bool {
    // Verify ownership
    let order = switch (PaymentLib.getOrderByStripeSessionId(paymentOrders, confirmation.stripeSessionId)) {
      case null { Runtime.trap("Payment order not found") };
      case (?o) {
        if (not Principal.equal(o.userId, caller)) {
          Runtime.trap("Unauthorized: payment belongs to another user");
        };
        o;
      };
    };

    let stripeSecretKey = "sk_test_placeholder";
    let sessionJson = await StripeLib.retrieveCheckoutSession(
      transform,
      stripeSecretKey,
      confirmation.stripeSessionId,
    );

    let paymentStatus = switch (StripeLib.extractJsonField(sessionJson, "payment_status")) {
      case (?s) { s };
      case null { "unknown" };
    };

    if (paymentStatus != "paid") {
      // Mark as Failed so admin can investigate
      paymentOrders.mapInPlace(func(o) {
        if (o.id == order.id) { { o with status = #Failed } } else { o };
      });
      return false;
    };

    let now = Time.now();
    let confirmed = switch (PaymentLib.confirmStripePayment(paymentOrders, confirmation, now)) {
      case null { return false };
      case (?c) { c };
    };

    // Update booking status: PaymentPending → Confirmed
    switch (order.paymentType) {
      case (#BookingUpfront) {
        switch (order.referenceId.toNat()) {
          case (?bookingId) {
            ignore ServiceLib.updateBookingStatus(bookings, bookingId, #Confirmed);
          };
          case null {};
        };
      };
      case (#BookingBalance) {
        switch (order.referenceId.toNat()) {
          case (?bookingId) {
            ignore ServiceLib.updateBookingStatus(bookings, bookingId, #Completed);
          };
          case null {};
        };
      };
      case (#CourseEnrollment) {};
    };

    // Log WhatsApp confirmation (email disabled on this platform)
    let clientPhone = switch (profiles.get(caller)) {
      case (?p) { p.phone };
      case null { "" };
    };
    let clientName = switch (profiles.get(caller)) {
      case (?p) { p.name };
      case null { "Client" };
    };
    let amountRupees = confirmed.amount / 100;
    let waMsg =
      "✅ *Payment Confirmed — RAP Studio*\n\n" #
      "👤 Client: " # clientName # "\n" #
      "🧾 Order ID: " # confirmed.orderId # "\n" #
      "📎 Reference: " # confirmed.referenceId # "\n" #
      "💰 Amount Paid: ₹" # amountRupees.toText() # "\n" #
      "📅 Paid At: " # now.toText() # "\n\n" #
      "Thank you for choosing RAP Integrated Studio! 🎥";

    if (clientPhone != "") {
      let waId = nextWhatsAppLogId.value;
      nextWhatsAppLogId.value += 1;
      ignore NotifLib.logWhatsApp(whatsappLogs, waId, clientPhone, waMsg, now, ?confirmed.orderId, true);
    };

    // In-app notification
    let notifId = nextNotifId.value;
    nextNotifId.value += 1;
    ignore NotifLib.createNotification(
      notifications,
      notifId,
      caller,
      "Payment of ₹" # amountRupees.toText() # " confirmed for " # confirmed.referenceId,
      #PaymentReceipt,
      now,
    );

    true;
  };

  // Returns the verification status for a specific internal payment ID.
  public query ({ caller }) func getPaymentStatus(
    internalPaymentId : Nat,
  ) : async ?PaymentTypes.PaymentVerificationStatus {
    let isAdmin = UserLib.isRole(profiles, caller, #Admin);
    switch (PaymentLib.getPaymentVerificationStatus(paymentOrders, internalPaymentId)) {
      case null { null };
      case (?status) {
        switch (paymentOrders.find(func(o) { o.id == internalPaymentId })) {
          case null { null };
          case (?order) {
            if (Principal.equal(order.userId, caller) or isAdmin) { ?status }
            else { null };
          };
        };
      };
    };
  };

  // Returns the caller's own payment history.
  public query ({ caller }) func listMyPayments() : async [PaymentTypes.PaymentOrder] {
    PaymentLib.getMyPayments(paymentOrders, caller);
  };

  // Admin only — returns all payment orders across all users.
  public query ({ caller }) func adminGetAllPayments() : async [PaymentTypes.PaymentOrder] {
    UserLib.requireRole(profiles, caller, #Admin);
    paymentOrders.toArray();
  };

  // Admin only — enriched dashboard with clientName, bookingDetails, sorted by paidAt desc.
  public query ({ caller }) func getAdminPaymentDashboard() : async [PaymentTypes.AdminPaymentEntry] {
    UserLib.requireRole(profiles, caller, #Admin);
    PaymentLib.getAdminPaymentDashboard(paymentOrders, profiles);
  };

  // Admin only — manually confirm a payment (cash / bank transfer).
  public shared ({ caller }) func adminConfirmPayment(
    paymentId : Common.PaymentId,
    note : Text,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    let now = Time.now();
    switch (PaymentLib.adminConfirmPayment(paymentOrders, paymentId, note, now)) {
      case null { false };
      case (?confirmed) {
        // Update booking status on admin confirm
        switch (confirmed.paymentType) {
          case (#BookingUpfront) {
            switch (confirmed.referenceId.toNat()) {
              case (?bookingId) {
                ignore ServiceLib.updateBookingStatus(bookings, bookingId, #Confirmed);
              };
              case null {};
            };
          };
          case (#BookingBalance) {
            switch (confirmed.referenceId.toNat()) {
              case (?bookingId) {
                ignore ServiceLib.updateBookingStatus(bookings, bookingId, #Completed);
              };
              case null {};
            };
          };
          case (#CourseEnrollment) {};
        };
        // Log WhatsApp notification for admin confirm
        let clientPhone = switch (profiles.get(confirmed.userId)) {
          case (?p) { p.phone };
          case null { "" };
        };
        let clientName = switch (profiles.get(confirmed.userId)) {
          case (?p) { p.name };
          case null { "Client" };
        };
        if (clientPhone != "") {
          let amountRupees = confirmed.amount / 100;
          let waMsg =
            "✅ *Payment Confirmed by Admin — RAP Studio*\n\n" #
            "👤 Client: " # clientName # "\n" #
            "🧾 Order ID: " # confirmed.orderId # "\n" #
            "💰 Amount: ₹" # amountRupees.toText() # "\n" #
            "📝 Note: " # note # "\n\n" #
            "Your payment has been manually confirmed. Thank you! 🙏";
          let waId = nextWhatsAppLogId.value;
          nextWhatsAppLogId.value += 1;
          ignore NotifLib.logWhatsApp(whatsappLogs, waId, clientPhone, waMsg, now, ?confirmed.orderId, true);
        };
        true;
      };
    };
  };

  // Admin only — mark a payment as Refunded with a note.
  public shared ({ caller }) func adminRefundPayment(
    paymentId : Common.PaymentId,
    note : Text,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    switch (PaymentLib.adminRefundPayment(paymentOrders, paymentId, note)) {
      case null { false };
      case (?refunded) {
        let clientPhone = switch (profiles.get(refunded.userId)) {
          case (?p) { p.phone };
          case null { "" };
        };
        if (clientPhone != "") {
          let now = Time.now();
          let amountRupees = refunded.amount / 100;
          let waMsg =
            "↩️ *Refund Processed — RAP Studio*\n\n" #
            "🧾 Order ID: " # refunded.orderId # "\n" #
            "💰 Refund Amount: ₹" # amountRupees.toText() # "\n" #
            "📝 Reason: " # note # "\n\n" #
            "Your refund has been processed. We hope to serve you again! 🙏";
          let waId = nextWhatsAppLogId.value;
          nextWhatsAppLogId.value += 1;
          ignore NotifLib.logWhatsApp(whatsappLogs, waId, clientPhone, waMsg, now, ?refunded.orderId, true);
        };
        true;
      };
    };
  };

  // Admin only — adjust amount before payment is initiated (status must be #Created).
  public shared ({ caller }) func adminAdjustAmount(
    paymentId : Common.PaymentId,
    newAmount : Nat,
    note : Text,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    switch (PaymentLib.adminAdjustAmount(paymentOrders, paymentId, newAmount, note)) {
      case null { false };
      case (?_) { true };
    };
  };

  // ── Private helpers ──────────────────────────────────────────────────────
  func paymentTypeToText(pt : PaymentTypes.PaymentType) : Text {
    switch (pt) {
      case (#BookingUpfront)    { "BookingUpfront" };
      case (#BookingBalance)    { "BookingBalance" };
      case (#CourseEnrollment)  { "CourseEnrollment" };
    };
  };
};
