import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Common "../types/common";
import Types "../types/users";

module {
  // ── Phone normalization ────────────────────────────────────────────────────
  // Strips +91, 91 prefix from Indian phone numbers to get the 10-digit form.
  public func normalizePhone(phone : Text) : Text {
    var s = phone;
    // Strip leading +91
    switch (s.stripStart(#text("+91"))) {
      case (?stripped) { s := stripped };
      case null {};
    };
    // Strip leading 91 for 12-digit numbers
    if (s.size() == 12) {
      switch (s.stripStart(#text("91"))) {
        case (?stripped) { s := stripped };
        case null {};
      };
    };
    s;
  };

  // ── Login attempt tracking ────────────────────────────────────────────────

  public type AttemptRecord = { count : Nat; lastAttemptAt : Int };

  public func isLockedOut(
    attempts : Map.Map<Text, AttemptRecord>,
    identifier : Text,
    now : Int,
  ) : Bool {
    // lockoutNs: 15 minutes in nanoseconds
    let lockoutNs : Int = 900_000_000_000;
    let maxAttempts : Nat = 5;
    switch (attempts.get(identifier)) {
      case null { false };
      case (?rec) {
        if (rec.count >= maxAttempts) {
          // Check if lockout window has passed
          now - rec.lastAttemptAt < lockoutNs;
        } else { false };
      };
    };
  };

  public func recordFailedAttempt(
    attempts : Map.Map<Text, AttemptRecord>,
    identifier : Text,
    now : Int,
  ) {
    let current : AttemptRecord = switch (attempts.get(identifier)) {
      case null { { count = 0; lastAttemptAt = now } };
      case (?r) { r };
    };
    attempts.add(identifier, { count = current.count + 1; lastAttemptAt = now });
  };

  public func clearAttempts(
    attempts : Map.Map<Text, AttemptRecord>,
    identifier : Text,
  ) {
    attempts.remove(identifier);
  };

  /// Register a new user.
  /// Client → status #Active (no approval needed).
  /// Student, Receptionist, Staff → status #Pending (admin must approve before login).
  /// Admin role is blocked at the mixin layer; this function never sees it.
  public func register(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    emailIndex : Map.Map<Text, Common.UserId>,
    phoneIndex : Map.Map<Text, Common.UserId>,
    caller : Common.UserId,
    email : Text,
    name : Text,
    phone : Text,
    passwordHash : Text,
    role : Types.UserRole,
    address : ?Text,
    profilePhoto : ?Blob,
    studentDetails : ?Types.StudentDetails,
  ) : { #ok : Types.UserProfile; #err : Text } {
    // Reject admin registrations via this path
    switch (role) {
      case (#Admin) { return #err("Admin registration not permitted") };
      case _ {};
    };
    // Deduplicate by email
    let normalEmail = email.toLower();
    if (emailIndex.containsKey(normalEmail)) {
      return #err("Email already registered");
    };
    // Deduplicate by phone (if provided)
    let normalPhone = normalizePhone(phone);
    if (normalPhone != "" and phoneIndex.containsKey(normalPhone)) {
      return #err("Phone number already registered");
    };
    let status : Types.UserStatus = switch (role) {
      case (#Client) { #Active };
      case _ { #Pending };
    };
    let profile : Types.UserProfile = {
      id = caller;
      email = normalEmail;
      name;
      phone = normalPhone;
      passwordHash;
      role;
      address;
      profilePhoto;
      registeredAt = Time.now();
      status;
      studentDetails;
    };
    profiles.add(caller, profile);
    emailIndex.add(normalEmail, caller);
    if (normalPhone != "") {
      phoneIndex.add(normalPhone, caller);
    };
    #ok(profile);
  };

  public func getProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) : ?Types.UserProfile {
    profiles.get(caller);
  };

  /// Look up a user profile by email address (for login flow).
  public func getProfileByEmail(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    emailIndex : Map.Map<Text, Common.UserId>,
    email : Text,
  ) : ?Types.UserProfile {
    switch (emailIndex.get(email)) {
      case null { null };
      case (?uid) { profiles.get(uid) };
    };
  };

  /// Login by email + password.
  /// Returns typed LoginError — including #pendingApproval when status is #Pending.
  public func loginByEmail(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    emailIndex : Map.Map<Text, Common.UserId>,
    email : Text,
    passwordHash : Text,
  ) : { #ok : Types.PublicProfile; #err : Types.LoginError } {
    let normalEmail = email.toLower();
    switch (emailIndex.get(normalEmail)) {
      case null { #err(#notFound) };
      case (?uid) {
        switch (profiles.get(uid)) {
          case null { #err(#notFound) };
          case (?p) {
            if (p.passwordHash != passwordHash) { return #err(#incorrectPassword) };
            switch (p.status) {
              case (#Pending) { #err(#pendingApproval) };
              case (#Suspended) { #err(#suspended) };
              case (#Rejected) { #err(#suspended) };
              case (#Active) { #ok(Types.toPublic(p)) };
            };
          };
        };
      };
    };
  };

  /// Login by email OR 10-digit phone (with/without +91) OR username (name field).
  /// Enforces: #Pending → #err(#pendingApproval), #Suspended → #err(#suspended).
  /// Checks lockout, records failed attempts, clears on success.
  public func loginByIdentifier(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    emailIndex : Map.Map<Text, Common.UserId>,
    phoneIndex : Map.Map<Text, Common.UserId>,
    loginAttempts : Map.Map<Text, AttemptRecord>,
    identifier : Text,
    passwordHash : Text,
    now : Int,
  ) : { #ok : Types.PublicProfile; #err : Types.LoginError } {
    let key = identifier.toLower();
    // Lockout check
    if (isLockedOut(loginAttempts, key, now)) {
      return #err(#lockedOut);
    };
    // Resolve profile: try email, then phone, then name match
    let resolved : ?Types.UserProfile = switch (emailIndex.get(key)) {
      case (?uid) { profiles.get(uid) };
      case null {
        let normalPhone = normalizePhone(identifier);
        switch (phoneIndex.get(normalPhone)) {
          case (?uid) { profiles.get(uid) };
          case null {
            // Fall back to name match
            profiles.values().find(func(p) { p.name.toLower() == key });
          };
        };
      };
    };
    switch (resolved) {
      case null {
        recordFailedAttempt(loginAttempts, key, now);
        #err(#notFound);
      };
      case (?p) {
        if (p.passwordHash != passwordHash) {
          recordFailedAttempt(loginAttempts, key, now);
          return #err(#incorrectPassword);
        };
        switch (p.status) {
          case (#Pending) { #err(#pendingApproval) };
          case (#Suspended) { #err(#suspended) };
          case (#Rejected) { #err(#suspended) };
          case (#Active) {
            clearAttempts(loginAttempts, key);
            #ok(Types.toPublic(p));
          };
        };
      };
    };
  };

  /// Return the public profile for a given email — used for safe session restoration.
  /// Does NOT expose passwordHash.
  public func getPublicProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    emailIndex : Map.Map<Text, Common.UserId>,
    email : Text,
  ) : ?Types.PublicProfile {
    switch (emailIndex.get(email)) {
      case null { null };
      case (?uid) {
        switch (profiles.get(uid)) {
          case null { null };
          case (?p) { ?Types.toPublic(p) };
        };
      };
    };
  };

  public func updateProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    phoneIndex : Map.Map<Text, Common.UserId>,
    caller : Common.UserId,
    name : Text,
    phone : Text,
    address : ?Text,
  ) : Bool {
    switch (profiles.get(caller)) {
      case null { false };
      case (?existing) {
        // Update phone index
        if (existing.phone != "" and existing.phone != phone) {
          phoneIndex.remove(normalizePhone(existing.phone));
        };
        if (phone != "") {
          phoneIndex.add(normalizePhone(phone), caller);
        };
        let updated : Types.UserProfile = { existing with name = name; phone = phone; address = address };
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

  /// Admin only — approve a pending user: sets status to #Active.
  public func approveUser(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    callerProfiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    userId : Common.UserId,
  ) : { #ok; #err : Text } {
    switch (callerProfiles.get(caller)) {
      case null { return #err("Caller not registered") };
      case (?cp) {
        switch (cp.role) {
          case (#Admin) {};
          case _ { return #err("Admin access required") };
        };
      };
    };
    switch (profiles.get(userId)) {
      case null { #err("User not found") };
      case (?target) {
        let updated : Types.UserProfile = { target with status = #Active };
        profiles.add(userId, updated);
        #ok;
      };
    };
  };

  /// Admin only — reject a pending user: sets status to #Rejected.
  public func rejectUser(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    callerProfiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    userId : Common.UserId,
  ) : { #ok; #err : Text } {
    switch (callerProfiles.get(caller)) {
      case null { return #err("Caller not registered") };
      case (?cp) {
        switch (cp.role) {
          case (#Admin) {};
          case _ { return #err("Admin access required") };
        };
      };
    };
    switch (profiles.get(userId)) {
      case null { #err("User not found") };
      case (?target) {
        let updated : Types.UserProfile = { target with status = #Rejected };
        profiles.add(userId, updated);
        #ok;
      };
    };
  };

  /// Admin only — list all users with status #Pending.
  /// Efficient: O(n) scan over profiles. Safe to call at polling frequency.
  public func listPendingUsers(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
  ) : [Types.PublicProfile] {
    let pending = profiles.values().filter(
      func(p : Types.UserProfile) : Bool { p.status == #Pending },
    );
    pending.map<Types.UserProfile, Types.PublicProfile>(func(p) { Types.toPublic(p) }).toArray();
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

  /// Admin only — directly create a user with any role and set status to #Active.
  /// Does NOT require admin approval — account is immediately usable.
  /// Generates a deterministic UserId from the email address.
  /// Checks for duplicate email and phone before creating.
  public func adminCreateUser(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    emailIndex : Map.Map<Text, Common.UserId>,
    phoneIndex : Map.Map<Text, Common.UserId>,
    callerProfiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    email : Text,
    name : Text,
    phone : Text,
    passwordHash : Text,
    role : Types.UserRole,
    address : ?Text,
    studentDetails : ?Types.StudentDetails,
  ) : { #ok : Types.PublicProfile; #err : Text } {
    // Caller must be Admin
    switch (callerProfiles.get(caller)) {
      case null { return #err("Caller not registered") };
      case (?cp) {
        switch (cp.role) {
          case (#Admin) {};
          case _ { return #err("Admin access required") };
        };
      };
    };
    let normalEmail = email.toLower();
    if (emailIndex.containsKey(normalEmail)) {
      return #err("Email already registered");
    };
    let normalPhone = normalizePhone(phone);
    if (normalPhone != "" and phoneIndex.containsKey(normalPhone)) {
      return #err("Phone number already registered");
    };
    // Derive a deterministic principal from the email blob
    let emailBlob = normalEmail.encodeUtf8();
    let newUserId : Common.UserId = emailBlob.fromBlob();
    if (profiles.containsKey(newUserId)) {
      return #err("User ID conflict — email already maps to an existing account");
    };
    let profile : Types.UserProfile = {
      id = newUserId;
      email = normalEmail;
      name;
      phone = normalPhone;
      passwordHash;
      role;
      address;
      profilePhoto = null;
      registeredAt = Time.now();
      status = #Active;
      studentDetails;
    };
    profiles.add(newUserId, profile);
    emailIndex.add(normalEmail, newUserId);
    if (normalPhone != "") {
      phoneIndex.add(normalPhone, newUserId);
    };
    #ok(Types.toPublic(profile));
  };

  /// Admin only — permanently remove a user from the platform.
  /// Also cleans up email and phone indexes.
  public func deleteUser(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    emailIndex : Map.Map<Text, Common.UserId>,
    phoneIndex : Map.Map<Text, Common.UserId>,
    callerProfiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    userId : Common.UserId,
  ) : { #ok; #err : Text } {
    // Caller must be Admin
    switch (callerProfiles.get(caller)) {
      case null { return #err("Caller not registered") };
      case (?cp) {
        switch (cp.role) {
          case (#Admin) {};
          case _ { return #err("Admin access required") };
        };
      };
    };
    switch (profiles.get(userId)) {
      case null { #err("User not found") };
      case (?target) {
        profiles.remove(userId);
        emailIndex.remove(target.email);
        if (target.phone != "") {
          phoneIndex.remove(target.phone);
        };
        #ok;
      };
    };
  };
};
