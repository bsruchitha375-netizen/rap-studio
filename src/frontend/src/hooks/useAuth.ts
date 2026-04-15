import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createActor } from "../backend";
import type { UserProfile, UserRole } from "../types";

const ROLE_STORAGE_KEY = "rap_user_role";
const PROFILE_STORAGE_KEY = "rap_user_profile";
const AUTH_CACHE_KEY = "rap_auth_cache";
const II_WARMUP_KEY = "rap_ii_warmed";
// 48hr TTL for II sessions — returning users skip II roundtrip for longer
const CACHE_TTL_MS = 48 * 60 * 60 * 1000;

// ── Resource hints injected eagerly at module load time ───────────────────────
// Runs synchronously when the module is first imported (app boot), not on click.
(function injectResourceHints() {
  if (typeof document === "undefined") return;

  const hints: Array<{ rel: string; href: string; crossOrigin?: string }> = [
    {
      rel: "preconnect",
      href: "https://identity.ic0.app",
      crossOrigin: "anonymous",
    },
    { rel: "dns-prefetch", href: "https://identity.ic0.app" },
    { rel: "preconnect", href: "https://icp-api.io", crossOrigin: "anonymous" },
    { rel: "dns-prefetch", href: "https://icp-api.io" },
  ];

  for (const { rel, href, crossOrigin } of hints) {
    const id = `hint-${rel}-${href.replace(/[^a-z0-9]/gi, "-")}`;
    if (document.getElementById(id)) continue;
    const link = document.createElement("link");
    link.id = id;
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
  }
})();

// ── Auth cache (principal + expiry) ──────────────────────────────────────────

interface AuthCache {
  principalText: string;
  cachedAt: number;
  expiry: number;
}

function readAuthCache(): AuthCache | null {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as AuthCache;
    if (Date.now() > cache.expiry) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

function writeAuthCache(principalText: string) {
  const cache: AuthCache = {
    principalText,
    cachedAt: Date.now(),
    expiry: Date.now() + CACHE_TTL_MS,
  };
  localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
}

function clearAuthCache() {
  localStorage.removeItem(AUTH_CACHE_KEY);
  localStorage.removeItem(II_WARMUP_KEY);
}

// ── Eager II warmup — called once at app boot ─────────────────────────────────
// Starts the AuthClient.create() promise in the background so by the time
// the user clicks "Sign In" the client is already instantiated.
let iiWarmupPromise: Promise<void> | null = null;

export function warmupInternetIdentity(): void {
  if (iiWarmupPromise) return; // already started
  if (typeof window === "undefined") return;

  // Mark warmup as started (survives re-renders)
  iiWarmupPromise = (async () => {
    try {
      // Dynamically import the II auth-client so the main bundle isn't blocked
      const { AuthClient } = await import("@dfinity/auth-client");
      const client = await AuthClient.create({
        idleOptions: { disableIdle: true },
      });
      // Cache the instance on window so useAuth can pick it up without re-creating
      (window as Window & { __iiAuthClient?: typeof client }).__iiAuthClient =
        client;
      localStorage.setItem(II_WARMUP_KEY, String(Date.now()));
    } catch {
      // Silently ignore — warmup is best-effort
    }
  })();
}

// ── Main auth hook ────────────────────────────────────────────────────────────

export function useAuth() {
  const { identity, loginStatus, login, clear, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = loginStatus === "success";

  // On first mount: persist auth cache if authenticated; clear if not
  useEffect(() => {
    if (isAuthenticated && identity) {
      const principalText = identity.getPrincipal().toString();
      const existing = readAuthCache();
      if (!existing || existing.principalText !== principalText) {
        writeAuthCache(principalText);
      }
    }
    if (!isAuthenticated && !isInitializing) {
      const role = localStorage.getItem(ROLE_STORAGE_KEY);
      if (!role) clearAuthCache();
    }
  }, [isAuthenticated, isInitializing, identity]);

  const principal =
    identity?.getPrincipal()?.toString() ?? readAuthCache()?.principalText;

  const handleLogout = useCallback(() => {
    clearAuthCache();
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    clear();
  }, [clear]);

  return {
    identity,
    isAuthenticated,
    principal,
    isLoading: isInitializing,
    login,
    logout: handleLogout,
  };
}

// ── Stored role ───────────────────────────────────────────────────────────────

export function useStoredRole(): [UserRole | null, (role: UserRole) => void] {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    return stored as UserRole | null;
  });

  const setRole = useCallback((newRole: UserRole) => {
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    setRoleState(newRole);
  }, []);

  return [role, setRole];
}

// ── User profile ──────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Memoized so localStorage isn't re-read on every render
  const storedProfile = useMemo<UserProfile | null>(() => {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return storedProfile;
      return storedProfile;
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: storedProfile,
    staleTime: 5 * 60 * 1000,
  });

  const setProfile = useCallback(
    (profile: UserProfile) => {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(ROLE_STORAGE_KEY, profile.role);
      // Update React Query cache immediately so all subscribers see the update
      queryClient.setQueryData<UserProfile | null>(["userProfile"], profile);
    },
    [queryClient],
  );

  return { ...query, setProfile };
}

// ── Role helpers ──────────────────────────────────────────────────────────────

export function useRole(): UserRole | null {
  const { isAuthenticated } = useAuth();
  const stored = useMemo(
    () => localStorage.getItem(ROLE_STORAGE_KEY),
    // Re-read only when auth state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  if (!isAuthenticated) return null;
  return (stored as UserRole) || null;
}

export function useRequireRole(requiredRoles: UserRole[]) {
  const { isAuthenticated, isLoading } = useAuth();
  const role = useRole();

  const hasAccess =
    isAuthenticated && role !== null && requiredRoles.includes(role);
  const shouldRedirect = !isLoading && (!isAuthenticated || !hasAccess);

  return { hasAccess, shouldRedirect, isLoading, role };
}

export function useIsAdmin(): boolean {
  const role = useRole();
  const adminSession = getAdminSession();
  return adminSession !== null || role === "admin";
}

export function useIsStaff(): boolean {
  const role = useRole();
  return role === "staff" || role === "admin";
}

export function useIsReceptionist(): boolean {
  const role = useRole();
  return role === "receptionist" || role === "admin";
}

// ── II connection state hook (used by LoginPage for "Connecting…" indicator) ──

export function useIIConnectionState(): { isConnecting: boolean } {
  const [isConnecting, setIsConnecting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const warmedAt = localStorage.getItem(II_WARMUP_KEY);
    const alreadyWarmed = warmedAt && Date.now() - Number(warmedAt) < 10_000;
    // Only show connecting indicator if II hasn't warmed up yet
    if (!alreadyWarmed) {
      // Show indicator after 300ms — much shorter than original 1s
      timerRef.current = setTimeout(() => setIsConnecting(true), 300);
    }

    // When warmup promise resolves, hide indicator
    void iiWarmupPromise?.then(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsConnecting(false);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isConnecting };
}

// ── Admin session helpers (password-only, no II required) ────────────────────

const ADMIN_SESSION_KEY = "rap_admin_session";

interface AdminSession {
  name: string;
  phone: string;
  loggedIn: true;
  expiry: number;
}

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

export function saveAdminSession(name: string, phone: string) {
  const session: AdminSession = {
    name,
    phone,
    loggedIn: true,
    expiry: Date.now() + CACHE_TTL_MS,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  const profile = {
    id: "admin",
    name,
    phone,
    role: "admin" as UserRole,
    createdAt: BigInt(Date.now()).toString(),
    isActive: true,
  };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  localStorage.setItem(ROLE_STORAGE_KEY, "admin");
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
}
