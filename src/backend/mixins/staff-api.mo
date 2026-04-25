import List "mo:core/List";
import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import StaffTypes "../types/staff";
import UserTypes "../types/users";
import UserLib "../lib/users";
import StaffLib "../lib/staff";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  workAssignments : List.List<StaffTypes.WorkAssignment>,
  nextAssignmentId : Common.Counter,
) {
  // Admin — assign a booking session to a staff member
  public shared ({ caller }) func assignWork(
    input : StaffTypes.WorkAssignmentInput,
  ) : async StaffTypes.WorkAssignment {
    UserLib.requireRole(profiles, caller, #Admin);
    let assignment = StaffLib.assignWork(workAssignments, profiles, nextAssignmentId.value, input);
    nextAssignmentId.value += 1;
    assignment;
  };

  // Staff — get own assigned work sessions
  public query ({ caller }) func getMyAssignedWork() : async [StaffTypes.WorkAssignment] {
    StaffLib.getMyAssignedWork(workAssignments, caller);
  };

  // Staff — submit a deliverable file reference (URL from object storage)
  public shared ({ caller }) func submitDeliverable(
    assignmentId : Nat,
    fileUrl : Text,
    fileName : Text,
  ) : async Bool {
    // Verify caller is staff
    UserLib.requireRole(profiles, caller, #Staff);
    StaffLib.submitDeliverable(workAssignments, caller, assignmentId, fileUrl, fileName);
  };

  // Staff — get own submitted work deliverables
  public query ({ caller }) func getMyUploadedWork() : async [StaffTypes.WorkAssignment] {
    StaffLib.getMyUploadedWork(workAssignments, caller);
  };

  // Admin / Receptionist — view all assignments
  public query ({ caller }) func getAllWorkAssignments() : async [StaffTypes.WorkAssignment] {
    UserLib.requireAdminOrReceptionist(profiles, caller);
    StaffLib.getAllAssignments(workAssignments);
  };

  // Admin — update assignment status (e.g. approve deliverable)
  public shared ({ caller }) func updateAssignmentStatus(
    assignmentId : Nat,
    status : StaffTypes.AssignmentStatus,
  ) : async Bool {
    UserLib.requireAdminOrStaff(profiles, caller);
    StaffLib.updateAssignmentStatus(workAssignments, assignmentId, status);
  };
};
