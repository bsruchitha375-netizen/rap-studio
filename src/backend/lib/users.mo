import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import Types "../types/users";

module {
  public func register(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    name : Text,
    phone : Text,
    role : Types.UserRole,
  ) : Types.UserProfile {
    switch (profiles.get(caller)) {
      case (?existing) { existing };
      case null {
        let profile : Types.UserProfile = {
          principal = caller;
          role = role;
          name = name;
          phone = phone;
          email = null;
          created = Time.now();
          status = #Active;
        };
        profiles.add(caller, profile);
        profile;
      };
    };
  };

  public func getProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) : ?Types.UserProfile {
    profiles.get(caller);
  };

  public func updateProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    name : Text,
    phone : Text,
  ) : Bool {
    switch (profiles.get(caller)) {
      case null { false };
      case (?existing) {
        let updated : Types.UserProfile = { existing with name = name; phone = phone };
        profiles.add(caller, updated);
        true;
      };
    };
  };

  public func manageUser(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    userId : Common.UserId,
    action : Text,
  ) : Bool {
    switch (profiles.get(caller)) {
      case null { Runtime.trap("Caller not registered") };
      case (?callerProfile) {
        switch (callerProfile.role) {
          case (#Admin) {};
          case _ { Runtime.trap("Admin access required") };
        };
      };
    };
    switch (profiles.get(userId)) {
      case null { false };
      case (?target) {
        let newStatus : Types.UserStatus = if (action == "suspend") { #Suspended }
          else if (action == "activate") { #Active }
          else { Runtime.trap("Unknown action") };
        let updated : Types.UserProfile = { target with status = newStatus };
        profiles.add(userId, updated);
        true;
      };
    };
  };

  public func isRole(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    role : Types.UserRole,
  ) : Bool {
    switch (profiles.get(caller)) {
      case null { false };
      case (?p) {
        switch (p.role, role) {
          case (#Admin, #Admin) { true };
          case (#Staff, #Staff) { true };
          case (#Receptionist, #Receptionist) { true };
          case (#Client, #Client) { true };
          case (#Student, #Student) { true };
          case _ { false };
        };
      };
    };
  };

  public func isAdminOrStaff(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) : Bool {
    switch (profiles.get(caller)) {
      case null { false };
      case (?p) {
        switch (p.role) {
          case (#Admin) { true };
          case (#Staff) { true };
          case _ { false };
        };
      };
    };
  };

  public func requireRole(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    role : Types.UserRole,
  ) {
    if (not isRole(profiles, caller, role)) {
      Runtime.trap("Unauthorized: required role not met");
    };
  };

  public func requireAdminOrStaff(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) {
    if (not isAdminOrStaff(profiles, caller)) {
      Runtime.trap("Unauthorized: admin or staff access required");
    };
  };

  public func requireAdminOrReceptionist(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) {
    switch (profiles.get(caller)) {
      case null { Runtime.trap("Unauthorized: not registered") };
      case (?p) {
        switch (p.role) {
          case (#Admin) {};
          case (#Receptionist) {};
          case _ { Runtime.trap("Unauthorized: admin or receptionist required") };
        };
      };
    };
  };
};
