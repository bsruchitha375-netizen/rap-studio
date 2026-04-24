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
  // Student — generate certificate after full ₹5 payment and 100% progress
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
    // Check payment is fully paid
    let paid = PaymentLib.isVerifiedAndPaidForReference(
      paymentOrders,
      enrollmentId.toText(),
      #CourseEnrollment,
    );
    if (not paid) {
      Runtime.trap("Full payment of ₹5 required to issue certificate");
    };
    let callerProfile = switch (UserLib.getProfile(profiles, caller)) {
      case null { Runtime.trap("Profile not found") };
      case (?p) { p };
    };
    let course = switch (CourseLib.getCourseById(enrollment.courseId)) {
      case null { Runtime.trap("Course not found") };
      case (?c) { c };
    };
    let cert = CertLib.generateCertificate(
      certificates,
      nextCertId.value,
      enrollment,
      callerProfile.name,
      course.title,
    );
    nextCertId.value += 1;
    // Mark certificate code on enrollment
    ignore CourseLib.markCertificateIssued(enrollments, enrollmentId, cert.code);
    cert;
  };

  // Public — anyone can look up a certificate by code
  public query func getCertificate(code : Text) : async ?CertTypes.Certificate {
    CertLib.getCertificateByCode(certificates, code);
  };

  // Public — QR code verification endpoint
  public query func verifyCertificate(code : Text) : async Bool {
    CertLib.verifyCertificate(certificates, code);
  };
};
