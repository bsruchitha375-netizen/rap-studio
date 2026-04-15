import Common "common";

module {
  public type PaymentStatus = {
    #Created;
    #Paid;
    #Failed;
    #Refunded;
  };

  public type PaymentType = {
    #BookingUpfront;    // ₹2
    #BookingBalance;    // ₹3
    #CourseEnrollment;  // ₹5
  };

  public type PaymentOrder = {
    id : Common.PaymentId;
    orderId : Text;
    razorpayOrderId : Text;
    amount : Nat;       // in paise (200 = ₹2, 300 = ₹3, 500 = ₹5)
    currency : Text;    // "INR"
    status : PaymentStatus;
    paymentType : PaymentType;
    referenceId : Text; // bookingId or enrollmentId as Text
    userId : Common.UserId;
    createdAt : Common.Timestamp;
    paidAt : ?Common.Timestamp;
    razorpayPaymentId : ?Text;
    signatureVerified : Bool;  // true only after successful verifyPayment call
    verifiedAt : ?Common.Timestamp;
  };

  public type PaymentVerification = {
    razorpayPaymentId : Text;
    razorpayOrderId : Text;
    razorpaySignature : Text;
  };

  public type PaymentVerificationStatus = {
    paymentId : Common.PaymentId;
    orderId : Text;
    razorpayOrderId : Text;
    razorpayPaymentId : ?Text;
    status : PaymentStatus;
    signatureVerified : Bool;
    verifiedAt : ?Common.Timestamp;
  };
};
