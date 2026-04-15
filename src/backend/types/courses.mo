import Common "common";

module {
  public type CourseMode = {
    #Online;
    #Offline;
    #Hybrid;
  };

  public type CourseStatus = {
    #Active;
    #Inactive;
    #ComingSoon;
  };

  public type Course = {
    id : Common.CourseId;
    title : Text;
    category : Text;
    mode : CourseMode;
    price : Nat;   // always 5 (INR)
    description : Text;
    duration : Text;
    prerequisites : [Text];
    imageUrl : Text;
    status : CourseStatus;
  };

  public type PaymentStatus = {
    #Pending;
    #PartiallyPaid;
    #FullyPaid;
    #Overdue;
  };

  public type CourseEnrollment = {
    id : Common.EnrollmentId;
    userId : Common.UserId;
    courseId : Common.CourseId;
    enrolledAt : Common.Timestamp;
    paymentStatus : PaymentStatus;
    completedAt : ?Common.Timestamp;
    certificateCode : ?Text;
    progress : Nat;  // 0-100
  };
};
