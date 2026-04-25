import List "mo:core/List";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import ServiceTypes "../types/services";
import PaymentTypes "../types/payments";
import CourseTypes "../types/courses";
import FeedbackTypes "../types/feedback";
import NotifTypes "../types/notifications";
import AnalyticsTypes "../types/analytics";
import CmsPayTypes "../types/cms-multiservice-payments";
import UserTypes "../types/users";
import Common "../types/common";
import FeedbackLib "feedback";

module {
  /// Persisted login event record stored in activityLog list.
  public type LoginEvent = {
    userId : Common.UserId;
    userName : Text;
    userRole : UserTypes.UserRole;
    loginAt : Common.Timestamp;
  };

  /// Appends a login event to the activityLog list.
  public func recordLoginEvent(
    activityLog : List.List<LoginEvent>,
    userId : Common.UserId,
    userName : Text,
    userRole : UserTypes.UserRole,
  ) {
    activityLog.add({
      userId = userId;
      userName = userName;
      userRole = userRole;
      loginAt = Time.now();
    });
  };

  public func getBookingStats(
    bookings : List.List<ServiceTypes.BookingRequest>,
    payments : List.List<PaymentTypes.PaymentOrder>,
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    feedbacks : List.List<FeedbackTypes.Feedback>,
    emailLogs : List.List<NotifTypes.EmailLog>,
    cmsStore : Map.Map<Text, CmsPayTypes.CmsContent>,
    multiBookings : List.List<CmsPayTypes.MultiServiceBooking>,
    profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
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
      totalUsers = profiles.size();
    };
  };

  /// Collects the last 50 activity events across bookings, enrollments, payments,
  /// registrations, and login events, sorted by timestamp descending.
  public func getRecentActivity(
    bookings : List.List<ServiceTypes.BookingRequest>,
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    payments : List.List<PaymentTypes.PaymentOrder>,
    profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
    activityLog : List.List<LoginEvent>,
  ) : [AnalyticsTypes.ActivityEvent] {
    let events = List.empty<AnalyticsTypes.ActivityEvent>();

    // Booking events
    for (b in bookings.values()) {
      let userName = switch (profiles.get(b.userId)) {
        case (?p) { p.name };
        case null { b.userId.toText() };
      };
      let statusText = switch (b.status) {
        case (#Pending)        { "Pending" };
        case (#Confirmed)      { "Confirmed" };
        case (#PaymentPending) { "Payment Pending" };
        case (#WorkDelivered)  { "Work Delivered" };
        case (#Completed)      { "Completed" };
        case (#Cancelled)      { "Cancelled" };
        case (#Rejected)       { "Rejected" };
      };
      events.add({
        id = "booking-" # b.id.toText();
        kind = #Booking;
        title = "Booking #" # b.id.toText() # " — " # statusText;
        detail = userName # " booked " # b.serviceId # " on " # b.date;
        userId = b.userId;
        timestamp = b.createdAt;
      });
    };

    // Enrollment events
    for (e in enrollments.values()) {
      let userName = switch (profiles.get(e.userId)) {
        case (?p) { p.name };
        case null { e.userId.toText() };
      };
      events.add({
        id = "enrollment-" # e.id.toText();
        kind = #Enrollment;
        title = "Enrollment #" # e.id.toText() # " — Course #" # e.courseId.toText();
        detail = userName # " enrolled in course " # e.courseId.toText();
        userId = e.userId;
        timestamp = e.enrolledAt;
      });
    };

    // Payment events
    for (p in payments.values()) {
      let userName = switch (profiles.get(p.userId)) {
        case (?p2) { p2.name };
        case null { p.userId.toText() };
      };
      let amountRupees = p.amount / 100;
      let statusText = switch (p.status) {
        case (#Created)  { "Created" };
        case (#Paid)     { "Paid" };
        case (#Failed)   { "Failed" };
        case (#Refunded) { "Refunded" };
      };
      events.add({
        id = "payment-" # p.id.toText();
        kind = #Payment;
        title = "Payment #" # p.id.toText() # " — ₹" # amountRupees.toText() # " " # statusText;
        detail = userName # " — Ref: " # p.referenceId;
        userId = p.userId;
        timestamp = p.createdAt;
      });
    };

    // Registration events
    for ((_, prof) in profiles.entries()) {
      events.add({
        id = "registration-" # prof.id.toText();
        kind = #Registration;
        title = "New Registration — " # prof.name;
        detail = prof.email # " registered as " # roleText(prof.role);
        userId = prof.id;
        timestamp = prof.registeredAt;
      });
    };

    // Login events
    var loginIdx = 0;
    for (ev in activityLog.values()) {
      events.add({
        id = "login-" # loginIdx.toText();
        kind = #Login;
        title = "User Login — " # ev.userName;
        detail = ev.userName # " logged in as " # roleText(ev.userRole);
        userId = ev.userId;
        timestamp = ev.loginAt;
      });
      loginIdx += 1;
    };

    // Sort descending by timestamp, take top 50
    let sorted = events.sort(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
    sorted.toArray().sliceToArray(0, 50);
  };

  func roleText(role : UserTypes.UserRole) : Text {
    switch (role) {
      case (#Client)       { "Client" };
      case (#Student)      { "Student" };
      case (#Receptionist) { "Receptionist" };
      case (#Staff)        { "Staff" };
      case (#Admin)        { "Admin" };
    };
  };
};
