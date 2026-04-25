import Common "common";

module {
  public type UserRole = {
    #Client;
    #Student;
    #Receptionist;
    #Staff;
    #Admin;
  };

  public type UserStatus = {
    #Active;
    #Suspended;
    #Pending;
    #Rejected;
  };

  /// Typed error returned by login functions — exported to Candid so the
  /// frontend can pattern-match on #pendingApproval distinctly from other errors.
  public type LoginError = {
    #incorrectPassword;
    #notFound;
    #suspended;
    #pendingApproval;
    #lockedOut;
    #other : Text;
  };

  public type StudentDetails = {
    courseType : Text;   // "Online" | "Offline" | "Hybrid"
    preferredSlot : Text; // "Saturday" | "Sunday"
    learningMode : Text;
  };

  /// Full internal profile — passwordHash stored for login validation.
  public type UserProfile = {
    id : Common.UserId;
    email : Text;
    name : Text;
    phone : Text;
    passwordHash : Text;
    role : UserRole;
    address : ?Text;
    profilePhoto : ?Blob;
    registeredAt : Common.Timestamp;
    status : UserStatus;
    studentDetails : ?StudentDetails;
  };

  /// Public-safe view of a profile — omits passwordHash.
  public type PublicProfile = {
    id : Common.UserId;
    email : Text;
    name : Text;
    phone : Text;
    role : UserRole;
    address : ?Text;
    registeredAt : Common.Timestamp;
    status : UserStatus;
    studentDetails : ?StudentDetails;
  };

  public func toPublic(p : UserProfile) : PublicProfile {
    {
      id = p.id;
      email = p.email;
      name = p.name;
      phone = p.phone;
      role = p.role;
      address = p.address;
      registeredAt = p.registeredAt;
      status = p.status;
      studentDetails = p.studentDetails;
    };
  };

  /// Roles that require admin approval before login is permitted.
  public func requiresApproval(role : UserRole) : Bool {
    switch (role) {
      case (#Student or #Receptionist or #Staff) { true };
      case _ { false };
    };
  };
};
