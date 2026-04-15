import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

import AccessControl "mo:caffeineai-authorization/access-control";

import Common "../types/common";
import UserTypes "../types/users";
import T "../types/cms-multiservice-payments";
import UserLib "../lib/users";
import Lib "../lib/cms-multiservice-payments";

// Mixin: CMS content management, multi-service booking, payment admin controls, and sub-service images.
mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  cmsStore : Map.Map<Text, T.CmsContent>,
  multiBookings : List.List<T.MultiServiceBooking>,
  multiBookingCounter : Common.Counter,
  paymentExtended : Map.Map<Common.PaymentId, T.PaymentOrderExtended>,
  subServiceImages : Map.Map<Text, Text>,
) {

  // ── CMS — public reads ─────────────────────────────────────────────────────

  public query func getCmsContent(key : Text) : async ?T.CmsContent {
    Lib.getCmsContent(cmsStore, key);
  };

  public query func getAllCmsContent() : async [T.CmsContent] {
    Lib.getAllCmsContent(cmsStore);
  };

  // ── CMS — admin writes ─────────────────────────────────────────────────────

  public shared ({ caller }) func setCmsContent(
    key : Text,
    value : Text,
    contentType : T.CmsContentType,
  ) : async () {
    UserLib.requireRole(profiles, caller, #Admin);
    Lib.setCmsContent(cmsStore, caller, key, value, contentType);
  };

  public shared ({ caller }) func deleteCmsContent(key : Text) : async () {
    UserLib.requireRole(profiles, caller, #Admin);
    Lib.deleteCmsContent(cmsStore, key);
  };

  // ── Multi-Service Booking ──────────────────────────────────────────────────

  public shared ({ caller }) func createMultiServiceBooking(
    input : T.MultiServiceBookingInput,
  ) : async Common.BookingId {
    Lib.createMultiServiceBooking(multiBookings, multiBookingCounter, caller, input);
  };

  public query ({ caller }) func getMyMultiServiceBookings() : async [T.MultiServiceBooking] {
    Lib.getMyMultiServiceBookings(multiBookings, caller);
  };

  // ── Payment Admin ──────────────────────────────────────────────────────────

  public shared ({ caller }) func adminUpdatePayment(
    paymentId : Common.PaymentId,
    action : T.PaymentAdminAction,
    adminNote : ?Text,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    Lib.adminUpdatePayment(paymentExtended, caller, paymentId, action, adminNote);
  };

  public shared ({ caller }) func getAdminPayments() : async [T.PaymentOrderExtended] {
    UserLib.requireRole(profiles, caller, #Admin);
    Lib.getAdminPayments(paymentExtended);
  };

  public query func getPaymentDetails(
    paymentId : Common.PaymentId,
  ) : async ?T.PaymentOrderExtended {
    Lib.getPaymentDetails(paymentExtended, paymentId);
  };

  // ── Sub-Service Images — public read ───────────────────────────────────────

  public query func getSubServiceImage(
    categoryId : Text,
    subServiceId : Text,
  ) : async ?Text {
    Lib.getSubServiceImage(subServiceImages, categoryId, subServiceId);
  };

  public query func getAllSubServiceImages() : async [(Text, Text)] {
    Lib.getAllSubServiceImages(subServiceImages);
  };

  // ── Sub-Service Images — admin writes ──────────────────────────────────────

  public shared ({ caller }) func setSubServiceImage(
    categoryId : Text,
    subServiceId : Text,
    imageUrl : Text,
  ) : async () {
    UserLib.requireRole(profiles, caller, #Admin);
    Lib.setSubServiceImage(subServiceImages, categoryId, subServiceId, imageUrl);
  };

  public shared ({ caller }) func deleteSubServiceImage(
    categoryId : Text,
    subServiceId : Text,
  ) : async () {
    UserLib.requireRole(profiles, caller, #Admin);
    Lib.deleteSubServiceImage(subServiceImages, categoryId, subServiceId);
  };
};
