import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import StaffTypes "../types/staff";
import UserTypes "../types/users";

module {
  public func assignWork(
    assignments : List.List<StaffTypes.WorkAssignment>,
    profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
    nextId : Nat,
    input : StaffTypes.WorkAssignmentInput,
  ) : StaffTypes.WorkAssignment {
    // Verify staff member exists
    switch (profiles.get(input.staffId)) {
      case null { Runtime.trap("Staff member not found") };
      case (?p) {
        switch (p.role) {
          case (#Staff) {};
          case _ { Runtime.trap("Target user is not a Staff member") };
        };
      };
    };
    let clientName = "Client";  // resolved from booking at query time
    let assignment : StaffTypes.WorkAssignment = {
      id = nextId;
      bookingId = input.bookingId;
      staffId = input.staffId;
      clientName = clientName;
      sessionDate = input.sessionDate;
      sessionType = input.sessionType;
      status = #Assigned;
      deliverables = [];
      assignedAt = Time.now();
      notes = input.notes;
    };
    assignments.add(assignment);
    assignment;
  };

  public func getMyAssignedWork(
    assignments : List.List<StaffTypes.WorkAssignment>,
    caller : Common.UserId,
  ) : [StaffTypes.WorkAssignment] {
    assignments.filter(func(a) { a.staffId == caller }).toArray();
  };

  public func getAllAssignments(
    assignments : List.List<StaffTypes.WorkAssignment>,
  ) : [StaffTypes.WorkAssignment] {
    assignments.toArray();
  };

  public func submitDeliverable(
    assignments : List.List<StaffTypes.WorkAssignment>,
    caller : Common.UserId,
    assignmentId : Nat,
    fileUrl : Text,
    fileName : Text,
  ) : Bool {
    var found = false;
    assignments.mapInPlace(func(a) {
      if (a.id == assignmentId and a.staffId == caller) {
        found := true;
        let newDeliverable : StaffTypes.Deliverable = {
          fileUrl = fileUrl;
          fileName = fileName;
          submittedAt = Time.now();
        };
        let updated : [StaffTypes.Deliverable] = a.deliverables.concat([newDeliverable]);
        { a with deliverables = updated; status = #Delivered };
      } else { a };
    });
    found;
  };

  public func getMyUploadedWork(
    assignments : List.List<StaffTypes.WorkAssignment>,
    caller : Common.UserId,
  ) : [StaffTypes.WorkAssignment] {
    assignments.filter(func(a) {
      a.staffId == caller and a.deliverables.size() > 0
    }).toArray();
  };

  public func updateAssignmentStatus(
    assignments : List.List<StaffTypes.WorkAssignment>,
    assignmentId : Nat,
    status : StaffTypes.AssignmentStatus,
  ) : Bool {
    var found = false;
    assignments.mapInPlace(func(a) {
      if (a.id == assignmentId) {
        found := true;
        { a with status = status };
      } else { a };
    });
    found;
  };
};
