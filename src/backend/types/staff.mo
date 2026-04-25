import Common "common";

module {
  public type AssignmentStatus = {
    #Assigned;
    #InProgress;
    #Delivered;
    #Approved;
  };

  public type Deliverable = {
    fileUrl : Text;
    fileName : Text;
    submittedAt : Common.Timestamp;
  };

  public type WorkAssignment = {
    id : Nat;
    bookingId : Common.BookingId;
    staffId : Common.UserId;
    clientName : Text;
    sessionDate : Text;
    sessionType : Text;   // e.g. "Wedding Shoot", "Portrait" etc.
    status : AssignmentStatus;
    deliverables : [Deliverable];
    assignedAt : Common.Timestamp;
    notes : ?Text;
  };

  public type WorkAssignmentInput = {
    bookingId : Common.BookingId;
    staffId : Common.UserId;
    sessionDate : Text;
    sessionType : Text;
    notes : ?Text;
  };
};
