import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import FeedbackTypes "../types/feedback";

module {
  public func addFeedback(
    feedbacks : List.List<FeedbackTypes.Feedback>,
    nextId : Nat,
    caller : Common.UserId,
    targetId : Text,
    targetType : FeedbackTypes.FeedbackTargetType,
    rating : Nat,
    comment : Text,
    createdAt : Common.Timestamp,
  ) : FeedbackTypes.Feedback {
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    let fb : FeedbackTypes.Feedback = {
      id = nextId;
      userId = caller;
      targetId = targetId;
      targetType = targetType;
      rating = rating;
      comment = comment;
      createdAt = createdAt;
      responderComment = null;
    };
    feedbacks.add(fb);
    fb;
  };

  public func getFeedbackForTarget(
    feedbacks : List.List<FeedbackTypes.Feedback>,
    targetId : Text,
  ) : [FeedbackTypes.Feedback] {
    feedbacks.filter(func(f) { f.targetId == targetId }).toArray();
  };

  public func getMyFeedback(
    feedbacks : List.List<FeedbackTypes.Feedback>,
    caller : Common.UserId,
  ) : [FeedbackTypes.Feedback] {
    feedbacks.filter(func(f) { f.userId == caller }).toArray();
  };

  public func getAllFeedback(
    feedbacks : List.List<FeedbackTypes.Feedback>,
  ) : [FeedbackTypes.Feedback] {
    feedbacks.toArray();
  };

  public func respondToFeedback(
    feedbacks : List.List<FeedbackTypes.Feedback>,
    feedbackId : Nat,
    responderComment : Text,
  ) : Bool {
    var found = false;
    feedbacks.mapInPlace(func(f) {
      if (f.id == feedbackId) {
        found := true;
        { f with responderComment = ?responderComment };
      } else { f };
    });
    found;
  };

  public func pendingFeedbackCount(
    feedbacks : List.List<FeedbackTypes.Feedback>,
  ) : Nat {
    feedbacks.filter(func(f) { f.responderComment == null }).size();
  };
};
