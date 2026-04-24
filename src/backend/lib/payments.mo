import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Common "../types/common";
import PaymentTypes "../types/payments";
import UserTypes "../types/users";

module {
  // ── Amount calculation ────────────────────────────────────────────────────
  // Returns per-service price in paise for the given duration tier.
  // 1h=₹100, 2h=₹200, 3h=₹350, half-day=₹500, full-day=₹800
  public func priceForDuration(tier : PaymentTypes.DurationTier) : Nat {
    switch (tier) {
      case (#OneHour)    { 10000  }; // ₹100 × 100 paise
      case (#TwoHours)   { 20000  }; // ₹200
      case (#ThreeHours) { 35000  }; // ₹350
      case (#HalfDay)    { 50000  }; // ₹500
      case (#FullDay)    { 80000  }; // ₹800
    };
  };

  // Returns upfront deposit (40%) for a given total amount in paise.
  public func upfrontDeposit(totalPaise : Nat) : Nat {
    (totalPaise * 40) / 100;
  };

  // Returns balance (60%) for a given total amount in paise.
  public func balanceAmount(totalPaise : Nat) : Nat {
    totalPaise - upfrontDeposit(totalPaise);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  // Creates a new PaymentOrder and appends it to the list.
  public func createPaymentOrder(
    orders : List.List<PaymentTypes.PaymentOrder>,
    nextId : Nat,
    caller : Common.UserId,
    stripeSessionId : Text,
    amount : Nat,
    paymentType : PaymentTypes.PaymentType,
    referenceId : Text,
  ) : PaymentTypes.PaymentOrder {
    let order : PaymentTypes.PaymentOrder = {
      id = nextId;
      orderId = "ORD-" # nextId.toText();
      stripeSessionId = ?stripeSessionId;
      stripePaymentIntentId = null;
      amount = amount;
      currency = "INR";
      status = #Created;
      paymentType = paymentType;
      referenceId = referenceId;
      userId = caller;
      createdAt = Time.now();
      paidAt = null;
      signatureVerified = false;
      verifiedAt = null;
      checkoutUrl = null;
      adminNotes = null;
    };
    orders.add(order);
    order;
  };

  // Marks an order as Paid after Stripe server-side verification.
  public func confirmStripePayment(
    orders : List.List<PaymentTypes.PaymentOrder>,
    confirmation : PaymentTypes.StripeConfirmation,
    paidAt : Common.Timestamp,
  ) : ?PaymentTypes.PaymentOrder {
    var updated : ?PaymentTypes.PaymentOrder = null;
    orders.mapInPlace(func(order) {
      switch (order.stripeSessionId) {
        case (?sid) {
          if (sid == confirmation.stripeSessionId) {
            let confirmed : PaymentTypes.PaymentOrder = {
              order with
              stripePaymentIntentId = ?confirmation.stripePaymentIntentId;
              status = #Paid;
              signatureVerified = true;
              verifiedAt = ?paidAt;
              paidAt = ?paidAt;
            };
            updated := ?confirmed;
            confirmed;
          } else { order };
        };
        case null { order };
      };
    });
    updated;
  };

  // Admin: manually confirm a payment (cash/bank transfer bypass).
  public func adminConfirmPayment(
    orders : List.List<PaymentTypes.PaymentOrder>,
    paymentId : Common.PaymentId,
    note : Text,
    now : Common.Timestamp,
  ) : ?PaymentTypes.PaymentOrder {
    var updated : ?PaymentTypes.PaymentOrder = null;
    orders.mapInPlace(func(order) {
      if (order.id == paymentId) {
        let confirmed : PaymentTypes.PaymentOrder = {
          order with
          status = #Paid;
          signatureVerified = true;
          verifiedAt = ?now;
          paidAt = ?now;
          adminNotes = ?note;
        };
        updated := ?confirmed;
        confirmed;
      } else { order };
    });
    updated;
  };

  // Admin: mark a paid order as Refunded and add a refund note.
  public func adminRefundPayment(
    orders : List.List<PaymentTypes.PaymentOrder>,
    paymentId : Common.PaymentId,
    note : Text,
  ) : ?PaymentTypes.PaymentOrder {
    var updated : ?PaymentTypes.PaymentOrder = null;
    orders.mapInPlace(func(order) {
      if (order.id == paymentId) {
        let refunded : PaymentTypes.PaymentOrder = {
          order with
          status = #Refunded;
          adminNotes = ?note;
        };
        updated := ?refunded;
        refunded;
      } else { order };
    });
    updated;
  };

  // Admin: update amount before payment is initiated (status must be #Created).
  public func adminAdjustAmount(
    orders : List.List<PaymentTypes.PaymentOrder>,
    paymentId : Common.PaymentId,
    newAmount : Nat,
    note : Text,
  ) : ?PaymentTypes.PaymentOrder {
    var updated : ?PaymentTypes.PaymentOrder = null;
    orders.mapInPlace(func(order) {
      if (order.id == paymentId) {
        switch (order.status) {
          case (#Created) {
            let adjusted : PaymentTypes.PaymentOrder = {
              order with
              amount = newAmount;
              adminNotes = ?note;
            };
            updated := ?adjusted;
            adjusted;
          };
          case _ { order };
        };
      } else { order };
    });
    updated;
  };

  // Retrieves a single order by its Stripe Session ID.
  public func getOrderByStripeSessionId(
    orders : List.List<PaymentTypes.PaymentOrder>,
    stripeSessionId : Text,
  ) : ?PaymentTypes.PaymentOrder {
    orders.find(func(o) {
      switch (o.stripeSessionId) {
        case (?sid) { sid == stripeSessionId };
        case null { false };
      };
    });
  };

  // Returns the public verification status for a given internal payment ID.
  public func getPaymentVerificationStatus(
    orders : List.List<PaymentTypes.PaymentOrder>,
    internalPaymentId : Nat,
  ) : ?PaymentTypes.PaymentVerificationStatus {
    switch (orders.find(func(o) { o.id == internalPaymentId })) {
      case null { null };
      case (?order) {
        ?{
          paymentId = order.id;
          orderId = order.orderId;
          stripeSessionId = order.stripeSessionId;
          stripePaymentIntentId = order.stripePaymentIntentId;
          status = order.status;
          signatureVerified = order.signatureVerified;
          verifiedAt = order.verifiedAt;
        };
      };
    };
  };

  // Returns all orders for the given caller.
  public func getMyPayments(
    orders : List.List<PaymentTypes.PaymentOrder>,
    caller : Common.UserId,
  ) : [PaymentTypes.PaymentOrder] {
    orders.filter(func(o) { Principal.equal(o.userId, caller) }).toArray();
  };

  // Returns true if a Paid+signatureVerified order exists for (referenceId, paymentType).
  public func isVerifiedAndPaidForReference(
    orders : List.List<PaymentTypes.PaymentOrder>,
    referenceId : Text,
    paymentType : PaymentTypes.PaymentType,
  ) : Bool {
    switch (orders.find(func(o) {
      o.referenceId == referenceId and
      o.signatureVerified and
      (switch (o.status) { case (#Paid) { true }; case _ { false } }) and
      (switch (o.paymentType, paymentType) {
        case (#BookingUpfront, #BookingUpfront) { true };
        case (#BookingBalance, #BookingBalance) { true };
        case (#CourseEnrollment, #CourseEnrollment) { true };
        case _ { false };
      })
    })) {
      case (?_) { true };
      case null { false };
    };
  };

  // Returns enriched payment entries for the admin dashboard, sorted by paidAt desc.
  public func getAdminPaymentDashboard(
    orders : List.List<PaymentTypes.PaymentOrder>,
    profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  ) : [PaymentTypes.AdminPaymentEntry] {
    // Build enriched entries
    let entries = orders.map<PaymentTypes.PaymentOrder, PaymentTypes.AdminPaymentEntry>(func(order) {
      let (clientName, clientPhone) = switch (profiles.get(order.userId)) {
        case (?p) { (p.name, p.phone) };
        case null { ("Unknown", "") };
      };
      // Attempt to parse referenceId as bookingId (Nat)
      let bookingId : ?Common.BookingId = switch (order.paymentType) {
        case (#BookingUpfront) {
          switch (order.referenceId.toNat()) {
            case (?n) { ?n };
            case null { null };
          };
        };
        case (#BookingBalance) {
          switch (order.referenceId.toNat()) {
            case (?n) { ?n };
            case null { null };
          };
        };
        case (#CourseEnrollment) { null };
      };
      let enrollmentId : ?Common.EnrollmentId = switch (order.paymentType) {
        case (#CourseEnrollment) {
          switch (order.referenceId.toNat()) {
            case (?n) { ?n };
            case null { null };
          };
        };
        case _ { null };
      };
      let serviceId : ?Text = switch (order.paymentType) {
        case (#BookingUpfront) { ?order.referenceId };
        case (#BookingBalance) { ?order.referenceId };
        case (#CourseEnrollment) { null };
      };
      {
        order = order;
        clientName = clientName;
        clientPhone = clientPhone;
        bookingId = bookingId;
        serviceId = serviceId;
        enrollmentId = enrollmentId;
      };
    });
    // Sort paid orders first (by paidAt desc), then pending
    let arr = entries.toArray();
    arr.sort(func(a, b) {
      let aTime : Int = switch (a.order.paidAt) { case (?t) { t }; case null { 0 } };
      let bTime : Int = switch (b.order.paidAt) { case (?t) { t }; case null { 0 } };
      if (bTime > aTime) { #less }
      else if (bTime < aTime) { #greater }
      else { #equal };
    });
  };
};
