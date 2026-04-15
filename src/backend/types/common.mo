module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type BookingId = Nat;
  public type CourseId = Nat;
  public type PaymentId = Nat;
  public type EnrollmentId = Nat;
  public type MediaId = Nat;
  public type NotificationId = Nat;
  public type CertificateId = Nat;
  // Mutable counter passed by reference to mixins
  public type Counter = { var value : Nat };
};
