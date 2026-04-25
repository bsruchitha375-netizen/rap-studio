import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import UserTypes "../types/users";
import UserLib "../lib/users";
import AnalyticsLib "../lib/analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  emailIndex : Map.Map<Text, Common.UserId>,
  phoneIndex : Map.Map<Text, Common.UserId>,
  loginAttempts : Map.Map<Text, UserLib.AttemptRecord>,
  activityLog : List.List<AnalyticsLib.LoginEvent>,
) {
  /// Register a new user with email + passwordHash as primary credentials.
  /// Admin role is disallowed through this path — defaults to Client.
  /// Client → registered as Active immediately.
  /// Student, Receptionist, Staff → registered as Pending; must be approved by admin before login.
  public shared ({ caller }) func register(
    email : Text,
    name : Text,
    phone : Text,
    passwordHash : Text,
    role : UserTypes.UserRole,
    address : ?Text,
    profilePhoto : ?Blob,
    studentDetails : ?UserTypes.StudentDetails,
  ) : async { #ok : UserTypes.PublicProfile; #err : Text } {
    // Disallow admin role through public registration
    let safeRole : UserTypes.UserRole = switch (role) {
      case (#Admin) { #Client };
      case r { r };
    };
    switch (UserLib.register(profiles, emailIndex, phoneIndex, caller, email, name, phone, passwordHash, safeRole, address, profilePhoto, studentDetails)) {
      case (#ok(p)) {
        // Log registration event
        activityLog.add({
          userId = p.id;
          userName = p.name;
          userRole = p.role;
          loginAt = Time.now();
        });
        #ok(UserTypes.toPublic(p));
      };
      case (#err(e)) { #err(e) };
    };
  };

  /// Login by email + passwordHash.
  /// Returns typed LoginError — #pendingApproval when account awaits admin approval.
  /// Kept for backward compatibility — delegates to loginByIdentifier.
  public shared func loginByEmail(
    email : Text,
    passwordHash : Text,
  ) : async { #ok : UserTypes.PublicProfile; #err : UserTypes.LoginError } {
    UserLib.loginByEmail(profiles, emailIndex, email, passwordHash);
  };

  /// Login by email OR phone number (10-digit, with/without +91) OR username.
  /// Enforces lockout after 5 failed attempts per identifier (15-minute window).
  /// Returns #err(#pendingApproval) for Pending accounts; admin must approve first.
  /// On success, records a login event in the activity log.
  public shared func loginByIdentifier(
    identifier : Text,
    passwordHash : Text,
  ) : async { #ok : UserTypes.PublicProfile; #err : UserTypes.LoginError } {
    let now = Time.now();
    let result = UserLib.loginByIdentifier(profiles, emailIndex, phoneIndex, loginAttempts, identifier, passwordHash, now);
    switch (result) {
      case (#ok(pub)) {
        activityLog.add({
          userId = pub.id;
          userName = pub.name;
          userRole = pub.role;
          loginAt = now;
        });
      };
      case (#err(_)) {};
    };
    result;
  };

  /// Return public profile for session restoration — no password required.
  /// Safe to call without credentials; omits passwordHash.
  public query func getPublicProfile(email : Text) : async ?UserTypes.PublicProfile {
    UserLib.getPublicProfile(profiles, emailIndex, email);
  };

  public query ({ caller }) func getMyProfile() : async ?UserTypes.PublicProfile {
    switch (UserLib.getProfile(profiles, caller)) {
      case null { null };
      case (?p) { ?UserTypes.toPublic(p) };
    };
  };

  public shared ({ caller }) func updateProfile(
    name : Text,
    phone : Text,
    address : ?Text,
  ) : async Bool {
    UserLib.updateProfile(profiles, phoneIndex, caller, name, phone, address);
  };

  /// Admin only — suspend or activate a user account.
  public shared ({ caller }) func manageUser(
    userId : Common.UserId,
    action : Text,
  ) : async Bool {
    UserLib.manageUser(profiles, caller, userId, action);
  };

  // Required by authorization extension — returns profile for the caller
  public query ({ caller }) func getCallerUserProfile() : async ?UserTypes.PublicProfile {
    switch (UserLib.getProfile(profiles, caller)) {
      case null { null };
      case (?p) { ?UserTypes.toPublic(p) };
    };
  };

  /// Compatibility shim for authorization extension — creates a minimal profile if none exists.
  public shared ({ caller }) func saveCallerUserProfile(
    name : Text,
    phone : Text,
    role : UserTypes.UserRole,
  ) : async () {
    let safeRole : UserTypes.UserRole = switch (role) {
      case (#Admin) { #Client };
      case r { r };
    };
    // Use caller principal as a derived email key so legacy callers still work
    let derivedEmail = caller.toText();
    ignore UserLib.register(profiles, emailIndex, phoneIndex, caller, derivedEmail, name, phone, "", safeRole, null, null, null);
  };
};
