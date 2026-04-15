import Common "common";

module {
  public type FeedbackTargetType = {
    #Service;
    #Course;
  };

  public type Feedback = {
    id : Nat;
    userId : Common.UserId;
    targetId : Text;           // bookingId or courseId as Text
    targetType : FeedbackTargetType;
    rating : Nat;              // 1-5
    comment : Text;
    createdAt : Common.Timestamp;
    responderComment : ?Text;  // admin reply
  };
};
