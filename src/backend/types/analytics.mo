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
  };
};
