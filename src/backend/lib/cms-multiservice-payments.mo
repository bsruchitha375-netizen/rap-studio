import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

import Common "../types/common";
import T "../types/cms-multiservice-payments";

module {

  // ── CMS Content ────────────────────────────────────────────────────────────

  public func getCmsContent(
    cmsStore : Map.Map<Text, T.CmsContent>,
    key : Text,
  ) : ?T.CmsContent {
    cmsStore.get(key);
  };

  public func getAllCmsContent(
    cmsStore : Map.Map<Text, T.CmsContent>,
  ) : [T.CmsContent] {
    cmsStore.values().toArray();
  };

  public func setCmsContent(
    cmsStore : Map.Map<Text, T.CmsContent>,
    caller : Common.UserId,
    key : Text,
    value : Text,
    contentType : T.CmsContentType,
  ) : () {
    let entry : T.CmsContent = {
      key = key;
      value = value;
      contentType = contentType;
      updatedAt = Time.now();
      updatedBy = caller;
    };
    cmsStore.add(key, entry);
  };

  public func deleteCmsContent(
    cmsStore : Map.Map<Text, T.CmsContent>,
    key : Text,
  ) : () {
    cmsStore.remove(key);
  };

  // ── Multi-Service Booking ──────────────────────────────────────────────────

  public func createMultiServiceBooking(
    multiBookings : List.List<T.MultiServiceBooking>,
    counter : Common.Counter,
    caller : Common.UserId,
    input : T.MultiServiceBookingInput,
  ) : Common.BookingId {
    let id = counter.value;
    let booking : T.MultiServiceBooking = {
      id = id;
      userId = caller;
      selectedServices = input.selectedServices;
      date = input.date;
      timeSlot = input.timeSlot;
      location = input.location;
      notes = input.notes;
      totalAmount = input.totalAmount;
      status = "Pending";
      createdAt = Time.now();
      adminNotes = null;
    };
    multiBookings.add(booking);
    counter.value += 1;
    id;
  };

  public func getMultiServiceBooking(
    multiBookings : List.List<T.MultiServiceBooking>,
    bookingId : Common.BookingId,
  ) : ?T.MultiServiceBooking {
    multiBookings.find(func(b) { b.id == bookingId });
  };

  public func getMyMultiServiceBookings(
    multiBookings : List.List<T.MultiServiceBooking>,
    caller : Common.UserId,
  ) : [T.MultiServiceBooking] {
    multiBookings.filter(func(b) { b.userId == caller }).toArray();
  };

  // ── Payment Admin ──────────────────────────────────────────────────────────

  public func adminUpdatePayment(
    paymentExtended : Map.Map<Common.PaymentId, T.PaymentOrderExtended>,
    _caller : Common.UserId,
    paymentId : Common.PaymentId,
    action : T.PaymentAdminAction,
    adminNote : ?Text,
  ) : Bool {
    switch (paymentExtended.get(paymentId)) {
      case null { false };
      case (?existing) {
        let newStatus = switch (action) {
          case (#confirm) { "Paid" };
          case (#refund) { "Refunded" };
          case (#adjustAmount(_)) { existing.status };
        };
        let newAmount = switch (action) {
          case (#adjustAmount(amt)) { amt };
          case _ { existing.amount };
        };
        let noteText = switch (adminNote) {
          case null { existing.adminNotes };
          case (?n) { ?n };
        };
        let updated : T.PaymentOrderExtended = {
          existing with
          status = newStatus;
          amount = newAmount;
          adminNotes = noteText;
        };
        paymentExtended.add(paymentId, updated);
        true;
      };
    };
  };

  public func getAdminPayments(
    paymentExtended : Map.Map<Common.PaymentId, T.PaymentOrderExtended>,
  ) : [T.PaymentOrderExtended] {
    paymentExtended.values().toArray();
  };

  public func getPaymentDetails(
    paymentExtended : Map.Map<Common.PaymentId, T.PaymentOrderExtended>,
    paymentId : Common.PaymentId,
  ) : ?T.PaymentOrderExtended {
    paymentExtended.get(paymentId);
  };

  // ── Sub-Service Images ─────────────────────────────────────────────────────

  public func setSubServiceImage(
    subServiceImages : Map.Map<Text, Text>,
    categoryId : Text,
    subServiceId : Text,
    imageUrl : Text,
  ) : () {
    let key = categoryId # "/" # subServiceId;
    subServiceImages.add(key, imageUrl);
  };

  public func getSubServiceImage(
    subServiceImages : Map.Map<Text, Text>,
    categoryId : Text,
    subServiceId : Text,
  ) : ?Text {
    let key = categoryId # "/" # subServiceId;
    subServiceImages.get(key);
  };

  public func getAllSubServiceImages(
    subServiceImages : Map.Map<Text, Text>,
  ) : [(Text, Text)] {
    subServiceImages.entries().toArray();
  };

  public func deleteSubServiceImage(
    subServiceImages : Map.Map<Text, Text>,
    categoryId : Text,
    subServiceId : Text,
  ) : () {
    let key = categoryId # "/" # subServiceId;
    subServiceImages.remove(key);
  };
};
