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
  };

  public type UserProfile = {
    principal : Common.UserId;
    role : UserRole;
    name : Text;
    phone : Text;
    email : ?Text;
    created : Common.Timestamp;
    status : UserStatus;
  };
};
