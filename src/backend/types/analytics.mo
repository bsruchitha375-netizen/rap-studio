import Common "common";

module {
  public type ServiceRevenue = {
    serviceId : Text;
    serviceName : Text;
    revenue : Nat;
    bookingCount : Nat;
  };

  public type BookingStats = {
    totalBookings : Nat;
    confirmedBookings : Nat;
    pendingBookings : Nat;
    completedBookings : Nat;
    cancelledBookings : Nat;
    totalRevenue : Nat;
    revenueByService : [ServiceRevenue];
    totalCourseRevenue : Nat;
    totalEnrollments : Nat;
    totalFeedback : Nat;
    pendingFeedbackCount : Nat;
    emailLogCount : Nat;
    totalCmsEntries : Nat;
    totalMultiServiceBookings : Nat;
    totalUsers : Nat;
  };

  // Alias so frontend can refer to either name
  public type AnalyticsSummary = BookingStats;

  public type ActivityEventKind = {
    #Booking;
    #Enrollment;
    #Payment;
    #Registration;
    #Login;
  };

  /// A single activity event for the live admin feed.
  public type ActivityEvent = {
    id : Text;                      // "<kind>-<entityId>"
    kind : ActivityEventKind;
    title : Text;                   // human-readable headline
    detail : Text;                  // secondary line
    userId : Common.UserId;
    timestamp : Common.Timestamp;
  };
};
