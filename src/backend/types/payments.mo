import Common "common";

module {
  public type PaymentStatus = {
    #Created;
    #Paid;
    #Failed;
    #Refunded;
  };

  public type PaymentType = {
    #BookingUpfront;    // deposit (40% of total)
    #BookingBalance;    // remainder 60% after service
    #CourseEnrollment;  // full course fee
  };

  public type PaymentOrder = {
    id : Common.PaymentId;
    orderId : Text;                       // internal order reference
    stripeSessionId : ?Text;              // Stripe Checkout Session ID
    stripePaymentIntentId : ?Text;        // Stripe PaymentIntent ID
    amount : Nat;                         // in smallest currency unit (paise)
    currency : Text;                      // "INR"
    status : PaymentStatus;
    paymentType : PaymentType;
    referenceId : Text;                   // bookingId or enrollmentId as Text
    userId : Common.UserId;
    createdAt : Common.Timestamp;
    paidAt : ?Common.Timestamp;
    signatureVerified : Bool;             // true after Stripe confirm call
    verifiedAt : ?Common.Timestamp;
    checkoutUrl : ?Text;                  // Stripe-hosted checkout URL
    adminNotes : ?Text;                   // set by admin actions
  };

  // Input for confirming a Stripe payment from the frontend
  public type StripeConfirmation = {
    stripeSessionId : Text;
    stripePaymentIntentId : Text;
  };

  public type PaymentVerificationStatus = {
    paymentId : Common.PaymentId;
    orderId : Text;
    stripeSessionId : ?Text;
    stripePaymentIntentId : ?Text;
    status : PaymentStatus;
    signatureVerified : Bool;
    verifiedAt : ?Common.Timestamp;
  };

  // Duration-based pricing tiers (in paise per service slot)
  // 1h=₹100, 2h=₹200, 3h=₹350, half-day=₹500, full-day=₹800
  public type DurationTier = {
    #OneHour;
    #TwoHours;
    #ThreeHours;
    #HalfDay;
    #FullDay;
  };

  // Enriched entry for the admin payment dashboard
  public type AdminPaymentEntry = {
    order : PaymentOrder;
    clientName : Text;
    clientPhone : Text;
    bookingId : ?Common.BookingId;
    serviceId : ?Text;
    enrollmentId : ?Common.EnrollmentId;
  };
};
