import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useState } from "react";
import { createActor } from "../backend";
import { UserRole } from "../backend";
import type { LoginError, PublicProfile } from "../backend";
import type { UserRole as LocalUserRole } from "../types";

// ── Constants ──────────────────────────────────────────────────────────────
const SESSION_KEY = "rap_session";
const ADMIN_SESSION_KEY = "rap_admin_session";
const CACHE_TTL_MS = 48 * 60 * 60 * 1000;

// ── Session types ──────────────────────────────────────────────────────────
export interface RapSession {
  email: string;
  role: LocalUserRole;
  profile: SerializableProfile;
  expiresAt: number;
}

// PublicProfile with bigint fields serialized as strings
export interface SerializableProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
  status: string;
  registeredAt: string;
  studentDetails?: {
    courseType: string;
    preferredSlot: string;
    learningMode: string;
  };
}

export interface AdminSession {
  name: string;
  phone: string;
  loggedIn: true;
  expiry: number;
}

// ── Login result type ──────────────────────────────────────────────────────
export type LoginResult =
  | { success: true }
  | { success: false; error: string; isPendingApproval?: boolean };

// ── Serialization helpers ──────────────────────────────────────────────────
function serializeProfile(p: PublicProfile): SerializableProfile {
  return {
    id: p.id.toString(),
    name: p.name,
    email: p.email,
    phone: p.phone,
    role: p.role as string,
    address: p.address,
    status: p.status as string,
    registeredAt: p.registeredAt.toString(),
    studentDetails: p.studentDetails
      ? {
          courseType: p.studentDetails.courseType,
          preferredSlot: p.studentDetails.preferredSlot,
          learningMode: p.studentDetails.learningMode,
        }
      : undefined,
  };
}

// ── Map LoginError variant → human-readable message ────────────────────────
function mapLoginError(err: LoginError): {
  message: string;
  isPendingApproval: boolean;
} {
  switch (err.__kind__) {
    case "pendingApproval":
      return {
        message:
          "Your account is awaiting admin approval. You will be able to log in once the admin approves your registration.",
        isPendingApproval: true,
      };
    case "notFound":
      return {
        message: "No account found. Please register first.",
        isPendingApproval: false,
      };
    case "incorrectPassword":
      return {
        message: "Incorrect password. Please try again.",
        isPendingApproval: false,
      };
    case "suspended":
      return {
        message: "Your account has been suspended. Contact admin.",
        isPendingApproval: false,
      };
    case "lockedOut":
      return {
        message: "Too many failed attempts. Please try again later.",
        isPendingApproval: false,
      };
    case "other":
      return {
        message: err.other ?? "Login failed. Please try again.",
        isPendingApproval: false,
      };
    default:
      return {
        message: "Login failed. Please try again.",
        isPendingApproval: false,
      };
  }
}

// ── Session read/write ─────────────────────────────────────────────────────
export function readSession(): RapSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as RapSession;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function writeSession(
  email: string,
  role: LocalUserRole,
  profile: PublicProfile,
): void {
  const session: RapSession = {
    email,
    role,
    profile: serializeProfile(profile),
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ── Admin session helpers (password-only, no II required) ─────────────────
export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (Date.now() > session.expiry) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveAdminSession(name: string, phone: string): void {
  const session: AdminSession = {
    name,
    phone,
    loggedIn: true,
    expiry: Date.now() + CACHE_TTL_MS,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  // Also write a rap_session so role checks work across the app
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      email: "admin@rapstudio.local",
      role: "admin",
      profile: {
        id: "admin",
        name,
        email: "admin@rapstudio.local",
        phone,
        role: "Admin",
        status: "Active",
        registeredAt: "0",
      },
      expiresAt: Date.now() + CACHE_TTL_MS,
    } satisfies RapSession),
  );
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// ── Hash password (simple SHA-256 via Web Crypto) ─────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Registration input ─────────────────────────────────────────────────────
export interface RegisterInput {
  email: string;
  name: string;
  phone: string;
  password: string;
  role: "client" | "student" | "receptionist" | "staff";
  address?: string;
  profilePhotoBytes?: Uint8Array | null;
  studentDetails?: {
    courseType: string;
    preferredSlot: string;
    learningMode: string;
  } | null;
}

// ── Map local role strings to backend UserRole enum ───────────────────────
function toBackendRole(role: string): UserRole {
  const map: Record<string, UserRole> = {
    client: UserRole.Client,
    student: UserRole.Student,
    staff: UserRole.Staff,
    receptionist: UserRole.Receptionist,
    admin: UserRole.Admin,
  };
  return map[role.toLowerCase()] ?? UserRole.Client;
}

function fromBackendRole(role: UserRole): LocalUserRole {
  const map: Record<UserRole, LocalUserRole> = {
    [UserRole.Client]: "client",
    [UserRole.Student]: "student",
    [UserRole.Staff]: "staff",
    [UserRole.Receptionist]: "receptionist",
    [UserRole.Admin]: "admin",
  };
  return map[role] ?? "client";
}

// ── Normalize identifier → canonical form for backend loginByIdentifier ──────
function normalizeIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (/^\d{10}$/.test(trimmed)) return trimmed;
  if (/^\+91\d{10}$/.test(trimmed)) return trimmed.slice(3);
  if (/^91\d{10}$/.test(trimmed)) return trimmed.slice(2);
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  return trimmed.toLowerCase();
}

// ── Main useAuth hook ──────────────────────────────────────────────────────
export function useAuth() {
  const { actor, isFetching } = useActor(createActor);
  const [session, setSessionState] = useState<RapSession | null>(() =>
    readSession(),
  );
  const [loading, setLoading] = useState(false);

  // On mount: validate session
  useEffect(() => {
    const stored = readSession();
    setSessionState(stored);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string): Promise<LoginResult> => {
      if (!actor || isFetching) {
        return {
          success: false,
          error: "Backend not ready. Please try again in a moment.",
        };
      }
      setLoading(true);
      try {
        const passwordHash = await hashPassword(password);
        const normalizedId = normalizeIdentifier(identifier);
        const result = await actor.loginByIdentifier(
          normalizedId,
          passwordHash,
        );

        if (result.__kind__ === "err") {
          const { message, isPendingApproval } = mapLoginError(result.err);
          return { success: false, error: message, isPendingApproval };
        }

        const profile = result.ok;
        const role = fromBackendRole(profile.role);
        writeSession(profile.email || normalizedId, role, profile);
        setSessionState(readSession());
        return { success: true };
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Login failed. Please try again.";
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [actor, isFetching],
  );

  const register = useCallback(
    async (
      input: RegisterInput,
    ): Promise<
      | { success: true; profile: PublicProfile; isPending: boolean }
      | { success: false; error: string }
    > => {
      if (!actor || isFetching) {
        return {
          success: false,
          error: "Backend not ready. Please try again.",
        };
      }
      setLoading(true);
      try {
        const passwordHash = await hashPassword(input.password);
        const backendRole = toBackendRole(input.role);
        const studentDetails = input.studentDetails
          ? {
              courseType: input.studentDetails.courseType,
              preferredSlot: input.studentDetails.preferredSlot,
              learningMode: input.studentDetails.learningMode,
            }
          : null;

        const result = await actor.register(
          input.email.trim().toLowerCase(),
          input.name.trim(),
          input.phone,
          passwordHash,
          backendRole,
          input.address?.trim() ?? null,
          input.profilePhotoBytes ?? null,
          studentDetails,
        );

        if (result.__kind__ === "err") {
          return { success: false, error: result.err };
        }

        const profile = result.ok;
        const role = fromBackendRole(profile.role);
        // Non-client roles are Pending — don't write session for them
        const isPending = input.role !== "client";
        if (!isPending) {
          writeSession(input.email.trim().toLowerCase(), role, profile);
          setSessionState(readSession());
        }
        return { success: true, profile, isPending };
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [actor, isFetching],
  );

  const logout = useCallback(() => {
    clearSession();
    clearAdminSession();
    setSessionState(null);
  }, []);

  return {
    user: session?.profile ?? null,
    role: session?.role ?? null,
    loading: loading || isFetching,
    isLoggedIn: session !== null,
    isAuthenticated: session !== null,
    login,
    register,
    logout,
    isActorReady: !!actor && !isFetching,
  };
}

// ── Role helpers (non-hook, read directly from storage) ───────────────────
export function getStoredRole(): LocalUserRole | null {
  const session = readSession();
  return session?.role ?? null;
}

export function useIsAdmin(): boolean {
  const adminSession = getAdminSession();
  const session = readSession();
  return adminSession !== null || session?.role === "admin";
}

export function useIsStaff(): boolean {
  const session = readSession();
  return session?.role === "staff" || session?.role === "admin";
}

export function useIsReceptionist(): boolean {
  const session = readSession();
  return session?.role === "receptionist" || session?.role === "admin";
}

// ── Legacy compatibility shims ─────────────────────────────────────────────
/** @deprecated Use readSession() instead */
export function readStoredProfile(): {
  name?: string;
  role?: LocalUserRole;
} | null {
  const s = readSession();
  if (!s) return null;
  return { name: s.profile.name, role: s.role };
}

/** @deprecated Use writeSession() instead */
export function saveUserSession(
  name: string,
  email: string,
  phone: string,
  role: LocalUserRole,
  _remember: boolean,
): void {
  const syntheticProfile: SerializableProfile = {
    id: `user_${email}`,
    name,
    email,
    phone,
    role: role.charAt(0).toUpperCase() + role.slice(1),
    status: "Active",
    registeredAt: "0",
  };
  const session: RapSession = {
    email,
    role,
    profile: syntheticProfile,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** @deprecated Use useAuth().user instead */
export function useUserProfile(): { data: SerializableProfile | null } {
  const session = readSession();
  return { data: session?.profile ?? null };
}

/** @deprecated Use getStoredRole() instead */
export function useStoredRole(): [
  LocalUserRole | null,
  (role: LocalUserRole) => void,
] {
  const [role, setRoleState] = useState<LocalUserRole | null>(() =>
    getStoredRole(),
  );
  const setRole = useCallback((newRole: LocalUserRole) => {
    const s = readSession();
    if (s) {
      s.role = newRole;
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
    setRoleState(newRole);
  }, []);
  return [role, setRole];
}

/** @deprecated No longer supported */
export function loginWithEmail(
  _email: string,
  _password: string,
  _role: LocalUserRole,
): { success: false; error: "email_not_found" } {
  return { success: false, error: "email_not_found" };
}

/** @deprecated Use useAuth().role instead */
export function useRole(): LocalUserRole | null {
  return getStoredRole();
}
