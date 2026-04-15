import List "mo:core/List";
import Map "mo:core/Map";
import ServiceTypes "../types/services";
import PaymentTypes "../types/payments";
import CourseTypes "../types/courses";
import FeedbackTypes "../types/feedback";
import NotifTypes "../types/notifications";
import AnalyticsTypes "../types/analytics";
import CmsPayTypes "../types/cms-multiservice-payments";
import FeedbackLib "feedback";

module {
  public func getBookingStats(
    bookings : List.List<ServiceTypes.BookingRequest>,
    payments : List.List<PaymentTypes.PaymentOrder>,
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    feedbacks : List.List<FeedbackTypes.Feedback>,
    emailLogs : List.List<NotifTypes.EmailLog>,
    cmsStore : Map.Map<Text, CmsPayTypes.CmsContent>,
    multiBookings : List.List<CmsPayTypes.MultiServiceBooking>,
  ) : AnalyticsTypes.BookingStats {
    var total = 0;
    var confirmed = 0;
    var pending = 0;
    var completed = 0;
    var cancelled = 0;

    for (b in bookings.values()) {
      total += 1;
      switch (b.status) {
        case (#Confirmed) { confirmed += 1 };
        case (#Pending) { pending += 1 };
        case (#Completed) { completed += 1 };
        case (#Cancelled) { cancelled += 1 };
        case _ {};
      };
    };

    var totalRevenue = 0;
    var courseRevenue = 0;

    for (p in payments.values()) {
      switch (p.status) {
        case (#Paid) {
          totalRevenue += p.amount;
          switch (p.paymentType) {
            case (#CourseEnrollment) { courseRevenue += p.amount };
            case _ {};
          };
        };
        case _ {};
      };
    };

    // Build per-service booking counts
    let serviceIds = List.empty<Text>();
    let serviceCounts = List.empty<Nat>();

    for (b in bookings.values()) {
      let found = serviceIds.findIndex(func(s) { s == b.serviceId });
      switch (found) {
        case null {
          serviceIds.add(b.serviceId);
          serviceCounts.add(1);
        };
        case (?idx) {
          let cur = serviceCounts.at(idx);
          serviceCounts.put(idx, cur + 1);
        };
      };
    };

    let revenueLen = serviceIds.size();
    let revenueList = List.empty<AnalyticsTypes.ServiceRevenue>();
    var i = 0;
    while (i < revenueLen) {
      let sId = serviceIds.at(i);
      let count = serviceCounts.at(i);
      revenueList.add({
        serviceId = sId;
        serviceName = sId;
        revenue = 0;
        bookingCount = count;
      });
      i += 1;
    };

    {
      totalBookings = total;
      confirmedBookings = confirmed;
      pendingBookings = pending;
      completedBookings = completed;
      cancelledBookings = cancelled;
      totalRevenue = totalRevenue;
      revenueByService = revenueList.toArray();
      totalCourseRevenue = courseRevenue;
      totalEnrollments = enrollments.size();
      totalFeedback = feedbacks.size();
      pendingFeedbackCount = FeedbackLib.pendingFeedbackCount(feedbacks);
      emailLogCount = emailLogs.size();
      totalCmsEntries = cmsStore.size();
      totalMultiServiceBookings = multiBookings.size();
    };
  };
};
