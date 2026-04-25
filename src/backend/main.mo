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
import StaffTypes "types/staff";
import Common "types/common";
import UserLib "lib/users";
import AnalyticsLib "lib/analytics";

import UsersMixin "mixins/users-api";
import ServicesMixin "mixins/services-api";
import PaymentsMixin "mixins/payments-api";
import CoursesMixin "mixins/courses-api";
import CertificatesMixin "mixins/certificates-api";
import GalleryMixin "mixins/gallery-api";
import NotificationsMixin "mixins/notifications-api";
import FeedbackMixin "mixins/feedback-api";
import AdminMixin "mixins/admin-api";
import StaffMixin "mixins/staff-api";





actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Object storage (gallery blobs) ───────────────────────────────────────
  include MixinObjectStorage();

  // ── User profiles ─────────────────────────────────────────────────────────
  let profiles = Map.empty<Common.UserId, UserTypes.UserProfile>();
  let emailIndex = Map.empty<Text, Common.UserId>();
  let phoneIndex = Map.empty<Text, Common.UserId>();
  let loginAttempts = Map.empty<Text, UserLib.AttemptRecord>();

  // ── Activity log — persists login events for admin feed ───────────────────
  let activityLog = List.empty<AnalyticsLib.LoginEvent>();

  include UsersMixin(accessControlState, profiles, emailIndex, phoneIndex, loginAttempts, activityLog);

  // ── Notifications (email + WhatsApp + in-app) — declared early for payment hooks ──
  let notifications = List.empty<NotifTypes.NotificationRecord>();
  let nextNotifId : Common.Counter = { var value = 1 };
  let emailLogs = List.empty<NotifTypes.EmailLog>();
  let nextEmailLogId : Common.Counter = { var value = 1 };
  let whatsappLogs = List.empty<NotifTypes.WhatsAppLog>();
  let nextWhatsAppLogId : Common.Counter = { var value = 1 };
  include NotificationsMixin(accessControlState, profiles, notifications, nextNotifId, emailLogs, nextEmailLogId, whatsappLogs, nextWhatsAppLogId);

  // ── Admin-added service categories ───────────────────────────────────────
  let adminServices = List.empty<ServiceTypes.AdminServiceCategory>();
  let nextAdminServiceId : Common.Counter = { var value = 1000 };

  // ── Service bookings ──────────────────────────────────────────────────────
  let bookings = List.empty<ServiceTypes.BookingRequest>();
  let nextBookingId : Common.Counter = { var value = 1 };
  include ServicesMixin(accessControlState, profiles, bookings, nextBookingId, adminServices, nextAdminServiceId, notifications, nextNotifId);

  // ── Payments (Stripe) ─────────────────────────────────────────────────────
  let paymentOrders = List.empty<PaymentTypes.PaymentOrder>();
  let nextPaymentId : Common.Counter = { var value = 1 };
  let stripeConfig : PaymentTypes.StripeConfig = { var publishableKey = ""; var secretKey = "" };
  include PaymentsMixin(accessControlState, profiles, paymentOrders, nextPaymentId, bookings, whatsappLogs, nextWhatsAppLogId, notifications, nextNotifId, stripeConfig);

  // ── Admin-added courses ───────────────────────────────────────────────────
  let adminCourses = List.empty<CourseTypes.AdminCourse>();
  let nextAdminCourseId : Common.Counter = { var value = 1000 };

  // ── Course enrollments ────────────────────────────────────────────────────
  let enrollments = List.empty<CourseTypes.CourseEnrollment>();
  let nextEnrollmentId : Common.Counter = { var value = 1 };

  // ── Lessons, quizzes, and progress (new) ─────────────────────────────────
  let lessons = List.empty<CourseTypes.Lesson>();
  let nextLessonId : Common.Counter = { var value = 1 };
  let nextQuizQuestionId : Common.Counter = { var value = 1 };
  let lessonProgress = List.empty<CourseTypes.LessonProgress>();
  let courseProgress = List.empty<CourseTypes.CourseLessonProgress>();

  include CoursesMixin(accessControlState, profiles, enrollments, paymentOrders, nextEnrollmentId, adminCourses, nextAdminCourseId, lessons, nextLessonId, nextQuizQuestionId, lessonProgress, courseProgress);

  // ── Certificates ──────────────────────────────────────────────────────────
  let certificates = List.empty<CertTypes.Certificate>();
  let nextCertId : Common.Counter = { var value = 1 };
  include CertificatesMixin(accessControlState, profiles, certificates, enrollments, paymentOrders, nextCertId);

  // ── Gallery media ─────────────────────────────────────────────────────────
  let mediaItems = List.empty<GalleryTypes.MediaItem>();
  let nextMediaId : Common.Counter = { var value = 1 };
  include GalleryMixin(accessControlState, profiles, mediaItems, nextMediaId);

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
  let subServiceBlobs = Map.empty<Text, Blob>();
  include CmsPayMixin(accessControlState, profiles, cmsStore, multiBookings, multiBookingCounter, paymentExtended, subServiceImages, subServiceBlobs);

  // ── Staff work assignments ────────────────────────────────────────────────
  let workAssignments = List.empty<StaffTypes.WorkAssignment>();
  let nextAssignmentId : Common.Counter = { var value = 1 };
  include StaffMixin(accessControlState, profiles, workAssignments, nextAssignmentId);

  // ── Admin dashboard ───────────────────────────────────────────────────────
  include AdminMixin(accessControlState, profiles, emailIndex, phoneIndex, bookings, paymentOrders, enrollments, feedbacks, emailLogs, cmsStore, multiBookings, activityLog);
};
