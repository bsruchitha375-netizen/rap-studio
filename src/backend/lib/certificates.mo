import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import CertTypes "../types/certificates";
import CourseTypes "../types/courses";

module {
  public func generateCertificate(
    certificates : List.List<CertTypes.Certificate>,
    nextId : Nat,
    enrollment : CourseTypes.CourseEnrollment,
    studentName : Text,
    courseName : Text,
  ) : CertTypes.Certificate {
    // For online courses: progress must be 100
    // For offline courses with no lessons: progress check is bypassed (certificates-api checks payment)
    switch (enrollment.paymentStatus) {
      case (#FullyPaid) {};
      case _ { Runtime.trap("Full payment required before certificate can be issued") };
    };
    // Return existing certificate if already generated
    switch (certificates.find(func(c) { c.enrollmentId == enrollment.id })) {
      case (?existing) { existing };
      case null {
        let now = Time.now();
        let code = generateCode(enrollment.id, now);
        let cert : CertTypes.Certificate = {
          id = nextId;
          code = code;
          studentName = studentName;
          courseName = courseName;
          issuedAt = now;
          courseId = enrollment.courseId;
          enrollmentId = enrollment.id;
          verified = true;
        };
        certificates.add(cert);
        cert;
      };
    };
  };

  // Generate a unique certificate code
  func generateCode(enrollmentId : Nat, timestamp : Int) : Text {
    let tsAbs = Int.abs(timestamp);
    "RAP-" # enrollmentId.toText() # "-" # (tsAbs % 999999999).toText();
  };

  public func getCertificateByCode(
    certificates : List.List<CertTypes.Certificate>,
    code : Text,
  ) : ?CertTypes.Certificate {
    certificates.find(func(c) { c.code == code });
  };

  public func verifyCertificate(
    certificates : List.List<CertTypes.Certificate>,
    code : Text,
  ) : Bool {
    switch (certificates.find(func(c) { c.code == code })) {
      case null { false };
      case (?c) { c.verified };
    };
  };

  public func getCertificateByEnrollment(
    certificates : List.List<CertTypes.Certificate>,
    enrollmentId : Common.EnrollmentId,
  ) : ?CertTypes.Certificate {
    certificates.find(func(c) { c.enrollmentId == enrollmentId });
  };
};
