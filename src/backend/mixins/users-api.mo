import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import UserTypes "../types/users";
import UserLib "../lib/users";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
) {
  public shared ({ caller }) func register(
    name : Text,
    phone : Text,
    role : UserTypes.UserRole,
  ) : async UserTypes.UserProfile {
    // Prevent registering as Admin through normal registration
    let safeRole : UserTypes.UserRole = switch (role) {
      case (#Admin) { #Client };
      case r { r };
    };
    UserLib.register(profiles, caller, name, phone, safeRole);
  };

  public query ({ caller }) func getMyProfile() : async ?UserTypes.UserProfile {
    UserLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func updateProfile(
    name : Text,
    phone : Text,
  ) : async Bool {
    UserLib.updateProfile(profiles, caller, name, phone);
  };

  // Admin only
  public shared ({ caller }) func manageUser(
    userId : Common.UserId,
    action : Text,
  ) : async Bool {
    UserLib.manageUser(profiles, caller, userId, action);
  };

  // Required by authorization extension — returns profile for the caller
  public query ({ caller }) func getCallerUserProfile() : async ?UserTypes.UserProfile {
    UserLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(
    name : Text,
    phone : Text,
    role : UserTypes.UserRole,
  ) : async () {
    let safeRole : UserTypes.UserRole = switch (role) {
      case (#Admin) { #Client };
      case r { r };
    };
    ignore UserLib.register(profiles, caller, name, phone, safeRole);
  };
};
