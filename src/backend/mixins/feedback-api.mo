import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import FeedbackTypes "../types/feedback";
import UserTypes "../types/users";
import UserLib "../lib/users";
import FeedbackLib "../lib/feedback";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  feedbacks : List.List<FeedbackTypes.Feedback>,
  nextFeedbackId : Common.Counter,
) {
  // Client/Student — submit feedback for a booking or course
  public shared ({ caller }) func addFeedback(
    targetId : Text,
    targetType : FeedbackTypes.FeedbackTargetType,
    rating : Nat,
    comment : Text,
  ) : async FeedbackTypes.Feedback {
    switch (profiles.get(caller)) {
      case null { Runtime.trap("Please register first") };
      case (?_) {};
    };
    let fb = FeedbackLib.addFeedback(
      feedbacks,
      nextFeedbackId.value,
      caller,
      targetId,
      targetType,
      rating,
      comment,
      Time.now(),
    );
    nextFeedbackId.value += 1;
    fb;
  };

  // Public — get all feedback for a specific booking or course
  public query func getFeedbackForTarget(
    targetId : Text,
  ) : async [FeedbackTypes.Feedback] {
    FeedbackLib.getFeedbackForTarget(feedbacks, targetId);
  };

  // User — own feedback history
  public query ({ caller }) func getMyFeedback() : async [FeedbackTypes.Feedback] {
    FeedbackLib.getMyFeedback(feedbacks, caller);
  };

  // Admin — all feedback
  public query ({ caller }) func getAllFeedback() : async [FeedbackTypes.Feedback] {
    UserLib.requireRole(profiles, caller, #Admin);
    FeedbackLib.getAllFeedback(feedbacks);
  };

  // Admin — respond to a feedback entry
  public shared ({ caller }) func respondToFeedback(
    feedbackId : Nat,
    responderComment : Text,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    FeedbackLib.respondToFeedback(feedbacks, feedbackId, responderComment);
  };
};
