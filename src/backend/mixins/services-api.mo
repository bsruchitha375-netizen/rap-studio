import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import ServiceTypes "../types/services";
import NotifTypes "../types/notifications";
import UserTypes "../types/users";
import UserLib "../lib/users";
import ServiceLib "../lib/services";
import NotifLib "../lib/notifications";
import AnalyticsLib "../lib/analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  bookings : List.List<ServiceTypes.BookingRequest>,
  nextBookingId : Common.Counter,
  adminServices : List.List<ServiceTypes.AdminServiceCategory>,
  nextAdminServiceId : Common.Counter,
  notifications : List.List<NotifTypes.NotificationRecord>,
  nextNotifId : Common.Counter,
  activityLog : List.List<AnalyticsLib.LoginEvent>,
) {
  // Public — merges static + admin-added service categories
  public query func getServiceCategories() : async [ServiceTypes.ServiceCategory] {
    ServiceLib.getMergedServiceCategories(adminServices);
  };

  // Public — returns only date+time+status, zero client details
  public query func getPublicCalendar() : async [ServiceTypes.BookingSlot] {
    ServiceLib.getPublicCalendar(bookings);
  };

  // Query image blob for an admin-added service category
  public query func getAdminServiceBlob(serviceId : Common.ServiceId) : async ?Blob {
    switch (ServiceLib.getAdminServiceById(adminServices, serviceId)) {
      case null { null };
      case (?svc) { svc.imageBlob };
    };
  };

  // Client only
  public shared ({ caller }) func createBookingRequest(
    input : ServiceTypes.BookingInput,
  ) : async ServiceTypes.BookingRequest {
    switch (profiles.get(caller)) {
      case null { Runtime.trap("Please register before booking") };
      case (?_) {};
    };
    let booking = ServiceLib.createBookingRequest(bookings, nextBookingId.value, caller, input);
    nextBookingId.value += 1;
    // Create in-app notification for admin — new booking alert
    let userName = switch (profiles.get(caller)) {
      case (?p) { p.name };
      case null { caller.toText() };
    };
    let userRole = switch (profiles.get(caller)) {
      case (?p) { p.role };
      case null { #Client };
    };
    let notifId = nextNotifId.value;
    nextNotifId.value += 1;
    ignore NotifLib.createNotification(
      notifications,
      notifId,
      caller,
      "New booking #" # booking.id.toText() # " from " # userName # " for " # input.serviceId # " on " # input.date,
      #GeneralInfo,
      Time.now(),
    );
    // Log booking activity for admin dashboard
    AnalyticsLib.recordBookingEvent(activityLog, caller, userName, userRole, booking.id, input.serviceId);
    booking;
  };

  // Client — own bookings only
  public query ({ caller }) func getMyBookings() : async [ServiceTypes.BookingRequest] {
    ServiceLib.getMyBookings(bookings, caller);
  };

  // Receptionist / Admin
  public query ({ caller }) func getAllBookings() : async [ServiceTypes.BookingRequest] {
    UserLib.requireAdminOrReceptionist(profiles, caller);
    ServiceLib.getAllBookings(bookings);
  };

  // Receptionist confirms availability
  public shared ({ caller }) func confirmBooking(
    bookingId : Common.BookingId,
  ) : async Bool {
    UserLib.requireAdminOrReceptionist(profiles, caller);
    ServiceLib.confirmBooking(bookings, bookingId, caller);
  };

  // Receptionist / Admin — reject a booking with a reason
  public shared ({ caller }) func rejectBooking(
    bookingId : Common.BookingId,
    reason : Text,
  ) : async Bool {
    UserLib.requireAdminOrReceptionist(profiles, caller);
    ServiceLib.rejectBooking(bookings, bookingId, reason);
  };

  // Receptionist / Admin — reschedule a booking to a new date and time
  public shared ({ caller }) func rescheduleBooking(
    bookingId : Common.BookingId,
    newDate : Text,
    newTime : Text,
  ) : async Bool {
    UserLib.requireAdminOrReceptionist(profiles, caller);
    ServiceLib.rescheduleBooking(bookings, bookingId, newDate, newTime);
  };

  // Receptionist / Admin — get bookings for a specific date
  public query ({ caller }) func getBookingsByDate(
    date : Text,
  ) : async [ServiceTypes.BookingRequest] {
    UserLib.requireAdminOrReceptionist(profiles, caller);
    ServiceLib.getBookingsByDate(bookings, date);
  };

  // Admin triggers payment request to user after receptionist confirms
  public shared ({ caller }) func triggerPaymentRequest(
    bookingId : Common.BookingId,
    paymentType : Text,
  ) : async Text {
    UserLib.requireRole(profiles, caller, #Admin);
    switch (ServiceLib.getBookingById(bookings, bookingId)) {
      case null { Runtime.trap("Booking not found") };
      case (?booking) {
        "Payment request triggered for booking #" # booking.id.toText();
      };
    };
  };

  // Mark work as delivered (Staff/Admin)
  public shared ({ caller }) func markWorkDelivered(
    bookingId : Common.BookingId,
  ) : async Bool {
    UserLib.requireAdminOrStaff(profiles, caller);
    ServiceLib.updateBookingStatus(bookings, bookingId, #WorkDelivered);
  };

  // Admin — add a new service category (stored in canister state)
  public shared ({ caller }) func adminAddService(
    input : ServiceTypes.AdminServiceInput,
  ) : async ServiceTypes.AdminServiceCategory {
    UserLib.requireRole(profiles, caller, #Admin);
    let svc = ServiceLib.adminAddService(adminServices, nextAdminServiceId.value, input);
    nextAdminServiceId.value += 1;
    svc;
  };

  // Admin — update an existing admin-added service category
  public shared ({ caller }) func adminUpdateService(
    serviceId : Common.ServiceId,
    input : ServiceTypes.AdminServiceInput,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    ServiceLib.adminUpdateService(adminServices, serviceId, input);
  };

  // Admin — delete an admin-added service category
  public shared ({ caller }) func adminDeleteService(
    serviceId : Common.ServiceId,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    ServiceLib.adminDeleteService(adminServices, serviceId);
  };

  // Admin — list all admin-added service categories (with blobs)
  public query ({ caller }) func getAllAdminServices() : async [ServiceTypes.AdminServiceCategory] {
    UserLib.requireRole(profiles, caller, #Admin);
    ServiceLib.getAllAdminServices(adminServices);
  };
};
