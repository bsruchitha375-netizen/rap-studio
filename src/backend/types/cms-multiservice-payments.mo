import Common "common";

module {

  // ── CMS Content ────────────────────────────────────────────────────────────
  public type CmsContentType = {
    #text;
    #color;
    #imageUrl;
  };

  public type CmsContent = {
    key : Text;
    value : Text;
    contentType : CmsContentType;
    updatedAt : Common.Timestamp;
    updatedBy : Common.UserId;
  };

  // ── Multi-Service Booking ──────────────────────────────────────────────────
  public type SelectedServiceItem = {
    serviceId : Text;
    subServiceId : Text;
    name : Text;
    price : Nat;
  };

  public type MultiServiceBookingInput = {
    selectedServices : [SelectedServiceItem];
    date : Text;
    timeSlot : Text;
    location : Text;
    notes : ?Text;
    totalAmount : Nat;
  };

  // ── Payment Admin Action ───────────────────────────────────────────────────
  public type PaymentAdminAction = {
    #confirm;
    #refund;
    #adjustAmount : Nat;
  };

  // ── Extended Payment Order (with selected services and admin notes) ─────────
  // Used as the stored type for enhanced payment records
  public type PaymentOrderExtended = {
    id : Common.PaymentId;
    orderId : Text;
    razorpayOrderId : Text;
    amount : Nat;
    currency : Text;
    status : Text;           // mirrors PaymentStatus as Text for shared boundary
    paymentType : Text;      // mirrors PaymentType as Text
    referenceId : Text;
    userId : Common.UserId;
    createdAt : Common.Timestamp;
    paidAt : ?Common.Timestamp;
    razorpayPaymentId : ?Text;
    selectedServices : [SelectedServiceItem];
    adminNotes : ?Text;
  };

  // ── Multi-Service Booking Record ───────────────────────────────────────────
  public type MultiServiceBooking = {
    id : Common.BookingId;
    userId : Common.UserId;
    selectedServices : [SelectedServiceItem];
    date : Text;
    timeSlot : Text;
    location : Text;
    notes : ?Text;
    totalAmount : Nat;
    status : Text;           // BookingStatus as Text
    createdAt : Common.Timestamp;
    adminNotes : ?Text;
  };
};
