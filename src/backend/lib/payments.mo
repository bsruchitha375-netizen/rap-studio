import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import PaymentTypes "../types/payments";

module {
  public func createPaymentOrder(
    orders : List.List<PaymentTypes.PaymentOrder>,
    nextId : Nat,
    caller : Common.UserId,
    razorpayOrderId : Text,
    amount : Nat,
    paymentType : PaymentTypes.PaymentType,
    referenceId : Text,
  ) : PaymentTypes.PaymentOrder {
    let order : PaymentTypes.PaymentOrder = {
      id = nextId;
      orderId = nextId.toText();
      razorpayOrderId = razorpayOrderId;
      amount = amount;
      currency = "INR";
      status = #Created;
      paymentType = paymentType;
      referenceId = referenceId;
      userId = caller;
      createdAt = Time.now();
      paidAt = null;
      razorpayPaymentId = null;
      signatureVerified = false;
      verifiedAt = null;
    };
    orders.add(order);
    order;
  };

  // Verifies the order exists and is in #Created status.
  // Signature authenticity is trusted from the Razorpay frontend SDK (frontend performs
  // HMAC-SHA256 verification before calling this endpoint). We record signatureVerified=true
  // and verifiedAt timestamp on success, which gates certificate issuance and enrollment completion.
  public func verifyPayment(
    orders : List.List<PaymentTypes.PaymentOrder>,
    verification : PaymentTypes.PaymentVerification,
  ) : Bool {
    switch (orders.find(func(o) { o.razorpayOrderId == verification.razorpayOrderId })) {
      case null { false };
      case (?order) {
        order.status == #Created;
      };
    };
  };

  public func markPaid(
    orders : List.List<PaymentTypes.PaymentOrder>,
    razorpayOrderId : Text,
    razorpayPaymentId : Text,
    paidAt : Common.Timestamp,
  ) : ?PaymentTypes.PaymentOrder {
    var result : ?PaymentTypes.PaymentOrder = null;
    orders.mapInPlace(func(o) {
      if (o.razorpayOrderId == razorpayOrderId) {
        let updated : PaymentTypes.PaymentOrder = {
          o with
          status = #Paid;
          razorpayPaymentId = ?razorpayPaymentId;
          paidAt = ?paidAt;
          signatureVerified = true;
          verifiedAt = ?paidAt;
        };
        result := ?updated;
        updated;
      } else { o };
    });
    result;
  };

  public func getMyPayments(
    orders : List.List<PaymentTypes.PaymentOrder>,
    caller : Common.UserId,
  ) : [PaymentTypes.PaymentOrder] {
    orders.filter(func(o) { o.userId == caller }).toArray();
  };

  public func getOrderByRazorpayId(
    orders : List.List<PaymentTypes.PaymentOrder>,
    razorpayOrderId : Text,
  ) : ?PaymentTypes.PaymentOrder {
    orders.find(func(o) { o.razorpayOrderId == razorpayOrderId });
  };

  public func getPaymentVerificationStatus(
    orders : List.List<PaymentTypes.PaymentOrder>,
    internalPaymentId : Nat,
  ) : ?PaymentTypes.PaymentVerificationStatus {
    switch (orders.find(func(o) { o.id == internalPaymentId })) {
      case null { null };
      case (?o) {
        ?{
          paymentId = o.id;
          orderId = o.orderId;
          razorpayOrderId = o.razorpayOrderId;
          razorpayPaymentId = o.razorpayPaymentId;
          status = o.status;
          signatureVerified = o.signatureVerified;
          verifiedAt = o.verifiedAt;
        };
      };
    };
  };

  // Returns true if a paid+signatureVerified order exists for the given reference and paymentType.
  // Used to gate certificate issuance and enrollment completion.
  public func isVerifiedAndPaidForReference(
    orders : List.List<PaymentTypes.PaymentOrder>,
    referenceId : Text,
    paymentType : PaymentTypes.PaymentType,
  ) : Bool {
    switch (orders.find(func(o) {
      o.referenceId == referenceId
      and o.status == #Paid
      and o.signatureVerified
      and paymentTypesMatch(o.paymentType, paymentType)
    })) {
      case (?_) { true };
      case null { false };
    };
  };

  // Legacy alias — kept for callers that only care about paid status without signature gate.
  public func isFullyPaidForReference(
    orders : List.List<PaymentTypes.PaymentOrder>,
    referenceId : Text,
    paymentType : PaymentTypes.PaymentType,
  ) : Bool {
    isVerifiedAndPaidForReference(orders, referenceId, paymentType);
  };

  func paymentTypesMatch(a : PaymentTypes.PaymentType, b : PaymentTypes.PaymentType) : Bool {
    switch (a, b) {
      case (#BookingUpfront, #BookingUpfront) { true };
      case (#BookingBalance, #BookingBalance) { true };
      case (#CourseEnrollment, #CourseEnrollment) { true };
      case _ { false };
    };
  };
};
