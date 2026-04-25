import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
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
  stripeConfig : PaymentTypes.StripeConfig,
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

    let stripeSecretKey = stripeConfig.secretKey;
    if (stripeSecretKey == "") {
      Runtime.trap("Stripe keys not configured. Please set them in admin Settings.");
    };

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

    let stripeSecretKey = stripeConfig.secretKey;
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

  // Alias — frontend polls this name for live updates.
  public query ({ caller }) func getMyPayments() : async [PaymentTypes.PaymentOrder] {
    PaymentLib.getMyPayments(paymentOrders, caller);
  };

  // Admin only — returns all payment orders across all users.
  public query ({ caller }) func adminGetAllPayments() : async [PaymentTypes.PaymentOrder] {
    UserLib.requireRole(profiles, caller, #Admin);
    paymentOrders.toArray();
  };

  // Alias — admin polls this name for live dashboard updates.
  public query ({ caller }) func getAllPayments() : async [PaymentTypes.PaymentOrder] {
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

  // ── Stripe key management (admin only) ───────────────────────────────────

  /// Store live Stripe publishable and secret keys in canister state.
  /// Both must be non-empty. Replaces any previously stored keys.
  public shared ({ caller }) func setStripeKeys(publishableKey : Text, secretKey : Text) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    if (publishableKey == "" or secretKey == "") {
      Runtime.trap("Both publishableKey and secretKey must be non-empty");
    };
    stripeConfig.publishableKey := publishableKey;
    stripeConfig.secretKey := secretKey;
    true;
  };

  /// Returns masked keys for admin display: first 8 chars + *** + last 4.
  /// Returns null fields when keys have not been set yet.
  public query ({ caller }) func getStripeConfig() : async { publishableKey : Text; secretKey : Text; configured : Bool } {
    UserLib.requireRole(profiles, caller, #Admin);
    let pk = stripeConfig.publishableKey;
    let sk = stripeConfig.secretKey;
    let configured = pk != "" and sk != "";
    {
      publishableKey = if (pk == "") { "" } else { maskKey(pk) };
      secretKey = if (sk == "") { "" } else { maskKey(sk) };
      configured = configured;
    };
  };

  /// Makes a lightweight GET /v1/products?limit=1 call to verify the configured secret key.
  /// Returns #ok("connected") if the key is valid, #err with message otherwise.
  public shared ({ caller }) func testStripeConnection() : async { #ok : Text; #err : Text } {
    UserLib.requireRole(profiles, caller, #Admin);
    let sk = stripeConfig.secretKey;
    if (sk == "") {
      return #err("Stripe keys not configured. Please set them in admin Settings.");
    };
    let auth = StripeLib.basicAuthHeader(sk);
    let responseJson = await OutCall.httpGetRequest(
      "https://api.stripe.com/v1/products?limit=1",
      [{ name = "Authorization"; value = "Basic " # auth }],
      transform,
    );
    // A successful response contains "object":"list". An auth failure contains "error".
    if (responseJson.contains(#text "\"error\"")) {
      let msg = switch (StripeLib.extractJsonField(responseJson, "message")) {
        case (?m) { m };
        case null { "Stripe API returned an error. Check your secret key." };
      };
      #err(msg);
    } else {
      #ok("connected");
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

  // Returns "first8***last4" for display, or the full key if too short.
  func maskKey(key : Text) : Text {
    let size = key.size();
    if (size <= 12) { return "***" };
    let prefix = key.chars().toArray();
    var p = "";
    var i = 0;
    for (c in prefix.vals()) {
      if (i < 8) { p #= Text.fromChar(c) };
      i += 1;
    };
    let suffix = key.chars().toArray();
    var s = "";
    var j = 0;
    for (c in suffix.vals()) {
      if (j >= size - 4) { s #= Text.fromChar(c) };
      j += 1;
    };
    p # "***" # s;
  };
};
