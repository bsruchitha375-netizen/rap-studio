import Common "common";

module {
  public type Certificate = {
    id : Common.CertificateId;
    code : Text;            // unique QR-verifiable code
    studentName : Text;
    courseName : Text;
    issuedAt : Common.Timestamp;
    courseId : Common.CourseId;
    enrollmentId : Common.EnrollmentId;
    verified : Bool;
  };
};
