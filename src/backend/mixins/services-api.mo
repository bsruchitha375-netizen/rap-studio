import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import ServiceTypes "../types/services";
import UserTypes "../types/users";
import UserLib "../lib/users";
import ServiceLib "../lib/services";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  bookings : List.List<ServiceTypes.BookingRequest>,
  nextBookingId : Common.Counter,
) {
  // Public — no auth required
  public query func getServiceCategories() : async [ServiceTypes.ServiceCategory] {
    ServiceLib.getServiceCategories();
  };

  // Public — returns only date+time+status, zero client details
  public query func getPublicCalendar() : async [ServiceTypes.BookingSlot] {
    ServiceLib.getPublicCalendar(bookings);
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

  // Admin triggers payment request to user after receptionist confirms
  public shared ({ caller }) func triggerPaymentRequest(
    bookingId : Common.BookingId,
    paymentType : Text,
  ) : async Text {
    UserLib.requireRole(profiles, caller, #Admin);
    switch (ServiceLib.getBookingById(bookings, bookingId)) {
      case null { Runtime.trap("Booking not found") };
      case (?booking) {
        // Return a deep link for WhatsApp or a message — actual Razorpay order
        // is created through createPaymentOrder in payments-api
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
};
