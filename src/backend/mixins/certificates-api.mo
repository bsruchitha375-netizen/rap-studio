import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CertTypes "../types/certificates";
import CourseTypes "../types/courses";
import PaymentTypes "../types/payments";
import UserTypes "../types/users";
import UserLib "../lib/users";
import CertLib "../lib/certificates";
import CourseLib "../lib/courses";
import PaymentLib "../lib/payments";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  certificates : List.List<CertTypes.Certificate>,
  enrollments : List.List<CourseTypes.CourseEnrollment>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  nextCertId : Common.Counter,
) {
  /// Student — generate/download certificate.
  /// Requires: all lessons complete (progress=100) AND #CertificateDownload payment confirmed.
  /// Enrollment itself is FREE — payment is ONLY required at this final certificate download step.
  public shared ({ caller }) func generateCertificate(
    enrollmentId : Common.EnrollmentId,
  ) : async CertTypes.Certificate {
    let enrollment = switch (CourseLib.getEnrollmentById(enrollments, enrollmentId)) {
      case null { Runtime.trap("Enrollment not found") };
      case (?e) { e };
    };
    if (enrollment.userId != caller) {
      Runtime.trap("Not your enrollment");
    };
    // Check all lessons are complete
    if (enrollment.progress < 100) {
      Runtime.trap("Course not yet completed — watch all videos and pass all quizzes first");
    };
    // Check payment for certificate download (#CertificateDownload type)
    let paid = PaymentLib.isVerifiedAndPaidForReference(
      paymentOrders,
      enrollmentId.toText(),
      #CertificateDownload,
    );
    if (not paid) {
      Runtime.trap("Certificate download payment required — please complete the ₹5 certificate fee first");
    };
    let callerProfile = switch (UserLib.getProfile(profiles, caller)) {
      case null { Runtime.trap("Profile not found") };
      case (?p) { p };
    };
    // Try to get course title — check both static and admin courses
    let courseTitle = switch (CourseLib.getCourseById(enrollment.courseId)) {
      case (?c) { c.title };
      case null { "Course #" # enrollment.courseId.toText() };
    };
    let cert = CertLib.generateCertificate(
      certificates,
      nextCertId.value,
      enrollment,
      callerProfile.name,
      courseTitle,
    );
    nextCertId.value += 1;
    // Mark certificate code on enrollment
    ignore CourseLib.markCertificateIssued(enrollments, enrollmentId, cert.code);
    cert;
  };

  /// Public — anyone can look up a certificate by code
  public query func getCertificate(code : Text) : async ?CertTypes.Certificate {
    CertLib.getCertificateByCode(certificates, code);
  };

  /// Public — QR code verification endpoint
  public query func verifyCertificate(code : Text) : async Bool {
    CertLib.verifyCertificate(certificates, code);
  };

  /// Student — check if certificate download payment is done for an enrollment.
  /// Frontend uses this to know whether to show "Pay for Certificate" or "Download" button.
  public query ({ caller }) func isCertificatePaymentDone(enrollmentId : Common.EnrollmentId) : async Bool {
    PaymentLib.isVerifiedAndPaidForReference(
      paymentOrders,
      enrollmentId.toText(),
      #CertificateDownload,
    );
  };

  /// Get certificate for an enrollment (if already issued).
  public query ({ caller }) func getMyCertificate(enrollmentId : Common.EnrollmentId) : async ?CertTypes.Certificate {
    switch (CourseLib.getEnrollmentById(enrollments, enrollmentId)) {
      case null { null };
      case (?e) {
        if (e.userId != caller and not UserLib.isRole(profiles, caller, #Admin)) {
          return null;
        };
        CertLib.getCertificateByEnrollment(certificates, enrollmentId);
      };
    };
  };
};
