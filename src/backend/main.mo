import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";


import CmsPayTypes "types/cms-multiservice-payments";
import CmsPayMixin "mixins/cms-multiservice-payments-api";

import UserTypes "types/users";
import ServiceTypes "types/services";
import CourseTypes "types/courses";
import PaymentTypes "types/payments";
import CertTypes "types/certificates";
import GalleryTypes "types/gallery";
import NotifTypes "types/notifications";
import FeedbackTypes "types/feedback";
import Common "types/common";

import UsersMixin "mixins/users-api";
import ServicesMixin "mixins/services-api";
import PaymentsMixin "mixins/payments-api";
import CoursesMixin "mixins/courses-api";
import CertificatesMixin "mixins/certificates-api";
import GalleryMixin "mixins/gallery-api";
import NotificationsMixin "mixins/notifications-api";
import FeedbackMixin "mixins/feedback-api";
import AdminMixin "mixins/admin-api";


actor {
  // ── Authorization state ──────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Object storage (gallery blobs) ───────────────────────────────────────
  include MixinObjectStorage();

  // ── User profiles ─────────────────────────────────────────────────────────
  let profiles = Map.empty<Common.UserId, UserTypes.UserProfile>();
  include UsersMixin(accessControlState, profiles);

  // ── Service bookings ──────────────────────────────────────────────────────
  let bookings = List.empty<ServiceTypes.BookingRequest>();
  let nextBookingId : Common.Counter = { var value = 1 };
  include ServicesMixin(accessControlState, profiles, bookings, nextBookingId);

  // ── Payments ──────────────────────────────────────────────────────────────
  let paymentOrders = List.empty<PaymentTypes.PaymentOrder>();
  let nextPaymentId : Common.Counter = { var value = 1 };
  include PaymentsMixin(accessControlState, profiles, paymentOrders, nextPaymentId);

  // ── Course enrollments ────────────────────────────────────────────────────
  let enrollments = List.empty<CourseTypes.CourseEnrollment>();
  let nextEnrollmentId : Common.Counter = { var value = 1 };
  include CoursesMixin(accessControlState, profiles, enrollments, paymentOrders, nextEnrollmentId);

  // ── Certificates ──────────────────────────────────────────────────────────
  let certificates = List.empty<CertTypes.Certificate>();
  let nextCertId : Common.Counter = { var value = 1 };
  include CertificatesMixin(accessControlState, profiles, certificates, enrollments, paymentOrders, nextCertId);

  // ── Gallery media ─────────────────────────────────────────────────────────
  let mediaItems = List.empty<GalleryTypes.MediaItem>();
  let nextMediaId : Common.Counter = { var value = 1 };
  include GalleryMixin(accessControlState, profiles, mediaItems, nextMediaId);

  // ── Notifications + simulated email log ───────────────────────────────────
  let notifications = List.empty<NotifTypes.NotificationRecord>();
  let nextNotifId : Common.Counter = { var value = 1 };
  let emailLogs = List.empty<NotifTypes.EmailLog>();
  let nextEmailLogId : Common.Counter = { var value = 1 };
  include NotificationsMixin(accessControlState, profiles, notifications, nextNotifId, emailLogs, nextEmailLogId);

  // ── Feedback ──────────────────────────────────────────────────────────────
  let feedbacks = List.empty<FeedbackTypes.Feedback>();
  let nextFeedbackId : Common.Counter = { var value = 1 };
  include FeedbackMixin(accessControlState, profiles, feedbacks, nextFeedbackId);

  // ── CMS content, multi-service bookings, payment admin, sub-service images ──
  let cmsStore = Map.empty<Text, CmsPayTypes.CmsContent>();
  let multiBookings = List.empty<CmsPayTypes.MultiServiceBooking>();
  let multiBookingCounter : Common.Counter = { var value = 1 };
  let paymentExtended = Map.empty<Common.PaymentId, CmsPayTypes.PaymentOrderExtended>();
  let subServiceImages = Map.empty<Text, Text>();
  include CmsPayMixin(accessControlState, profiles, cmsStore, multiBookings, multiBookingCounter, paymentExtended, subServiceImages);

  // ── Admin dashboard ───────────────────────────────────────────────────────
  include AdminMixin(accessControlState, profiles, bookings, paymentOrders, enrollments, feedbacks, emailLogs, cmsStore, multiBookings);
};
