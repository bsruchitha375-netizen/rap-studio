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
        // Log registration event (distinct from login event)
        AnalyticsLib.recordRegistrationEvent(activityLog, p.id, p.name, p.role);
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
        AnalyticsLib.recordLoginEvent(activityLog, pub.id, pub.name, pub.role);
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
  /// Admin role is allowed here so admin can seed their own profile.
  public shared ({ caller }) func saveCallerUserProfile(
    name : Text,
    phone : Text,
    role : UserTypes.UserRole,
  ) : async () {
    // Use caller principal as a derived email key so legacy callers still work
    let derivedEmail = caller.toText();
    // If profile already exists, skip — don't overwrite
    switch (profiles.get(caller)) {
      case (?_) { return };
      case null {};
    };
    // Allow Admin role here — admin seeds their own profile on first login
    // All other roles follow normal status rules (Admin → Active immediately)
    let status : UserTypes.UserStatus = switch (role) {
      case (#Admin or #Client) { #Active };
      case _ { #Pending };
    };
    let profile : UserTypes.UserProfile = {
      id = caller;
      email = derivedEmail;
      name = name;
      phone = phone;
      passwordHash = "";
      role = role;
      address = null;
      profilePhoto = null;
      registeredAt = Time.now();
      status = status;
      studentDetails = null;
    };
    profiles.add(caller, profile);
    emailIndex.add(derivedEmail, caller);
  };

  /// Bootstrap: allows the admin to register themselves with full admin role.
  /// Only works if no admin profile exists yet for this caller.
  /// Returns #ok if profile created, #err if already exists.
  public shared ({ caller }) func bootstrapAdminProfile(
    name : Text,
    email : Text,
    phone : Text,
    passwordHash : Text,
  ) : async { #ok : UserTypes.PublicProfile; #err : Text } {
    // Reject if caller already has a profile
    switch (profiles.get(caller)) {
      case (?existing) {
        // If already admin, just return existing
        switch (existing.role) {
          case (#Admin) { return #ok(UserTypes.toPublic(existing)) };
          case _ { return #err("Profile already exists with non-admin role") };
        };
      };
      case null {};
    };
    let normalEmail = if (email == "") { caller.toText() } else { email.toLower() };
    // Check if email already in use by another user
    switch (emailIndex.get(normalEmail)) {
      case (?existingId) {
        if (existingId != caller) {
          return #err("Email already registered by another user");
        };
      };
      case null {};
    };
    let profile : UserTypes.UserProfile = {
      id = caller;
      email = normalEmail;
      name = name;
      phone = phone;
      passwordHash = passwordHash;
      role = #Admin;
      address = null;
      profilePhoto = null;
      registeredAt = Time.now();
      status = #Active;
      studentDetails = null;
    };
    profiles.add(caller, profile);
    emailIndex.add(normalEmail, caller);
    if (phone != "") {
      phoneIndex.add(phone, caller);
    };
    AnalyticsLib.recordRegistrationEvent(activityLog, caller, name, #Admin);
    #ok(UserTypes.toPublic(profile));
  };

  /// Admin — list all registered users (public profiles, no password hash).
  public query ({ caller }) func getAllUsers() : async [UserTypes.PublicProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    profiles.values().map<UserTypes.UserProfile, UserTypes.PublicProfile>(
      func(p) { UserTypes.toPublic(p) }
    ).toArray();
  };

  /// Admin — list all pending users awaiting approval.
  public query ({ caller }) func listPendingUsers() : async [UserTypes.PublicProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    UserLib.listPendingUsers(profiles);
  };

  /// Admin — approve a pending user.
  public shared ({ caller }) func approveUser(userId : Common.UserId) : async { #ok; #err : Text } {
    UserLib.approveUser(profiles, profiles, caller, userId);
  };

  /// Admin — reject a pending user.
  public shared ({ caller }) func rejectUser(userId : Common.UserId) : async { #ok; #err : Text } {
    UserLib.rejectUser(profiles, profiles, caller, userId);
  };

  /// Admin — directly create a user with any role, immediately active.
  public shared ({ caller }) func adminCreateUser(
    email : Text,
    name : Text,
    phone : Text,
    passwordHash : Text,
    role : UserTypes.UserRole,
    address : ?Text,
    studentDetails : ?UserTypes.StudentDetails,
  ) : async { #ok : UserTypes.PublicProfile; #err : Text } {
    UserLib.adminCreateUser(profiles, emailIndex, phoneIndex, profiles, caller, email, name, phone, passwordHash, role, address, studentDetails);
  };

  /// Admin — delete any user account permanently.
  public shared ({ caller }) func deleteUser(userId : Common.UserId) : async { #ok; #err : Text } {
    UserLib.deleteUser(profiles, emailIndex, phoneIndex, profiles, caller, userId);
  };

  /// Admin — bulk fetch multiple user profiles.
  public query ({ caller }) func bulkGetUserProfiles(userIds : [Common.UserId]) : async [UserTypes.PublicProfile] {
    UserLib.requireRole(profiles, caller, #Admin);
    UserLib.bulkGetUserProfiles(profiles, userIds);
  };
};
