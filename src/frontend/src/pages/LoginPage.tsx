import { LoginForm } from "@/components/auth/LoginForm";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Button } from "@/components/ui/button";
import {
  readStoredProfile,
  useAuth,
  useIIConnectionState,
  useStoredRole,
  useUserProfile,
  warmupInternetIdentity,
} from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Fire warmup as soon as module is imported — maximum head-start for II
warmupInternetIdentity();

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: "/admin",
  staff: "/dashboard/staff",
  receptionist: "/dashboard/receptionist",
  client: "/dashboard/client",
  student: "/dashboard/student",
};

type AuthStage =
  | "idle" // showing role selector
  | "connecting" // user clicked, II opening
  | "success" // II auth succeeded, checking profile
  | "profile" // new user, fill profile
  | "error"; // auth failed

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [storedRole, setStoredRole] = useStoredRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    storedRole ?? "client",
  );
  const { data: profile } = useUserProfile();
  const { isConnecting } = useIIConnectionState();
  const [stage, setStage] = useState<AuthStage>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Prevent double-redirect
  const hasRedirected = useRef(false);

  const isAdminSelected = selectedRole === "admin";

  // ── Fast path: already have a valid stored session → redirect immediately ──
  useEffect(() => {
    if (hasRedirected.current) return;
    const stored = readStoredProfile();
    if (stored?.name && stored?.role) {
      hasRedirected.current = true;
      const dest = ROLE_REDIRECTS[stored.role] ?? "/dashboard/client";
      void navigate({ to: dest });
    }
    // navigate is stable (TanStack Router), readStoredProfile is pure — safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ── After II auth resolves, redirect or show profile form ─────────────────
  useEffect(() => {
    if (!isAuthenticated || hasRedirected.current) return;
    if (isLoading) return; // wait for isInitializing to settle

    // Has a saved profile → go straight to dashboard
    if (profile?.name) {
      hasRedirected.current = true;
      const dest = ROLE_REDIRECTS[profile.role] ?? "/dashboard/client";
      void navigate({ to: dest });
      return;
    }

    // No profile yet → show profile completion form
    setStage("profile");
  }, [isAuthenticated, isLoading, profile, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStoredRole(role);
  };

  const handleSignIn = async () => {
    if (!selectedRole) return;

    // Admin → redirect to password-based admin login
    if (selectedRole === "admin") {
      void navigate({ to: "/admin/login" });
      return;
    }

    setStage("connecting");
    setErrorMsg("");

    try {
      await login();
      setStage("success");
    } catch (err: unknown) {
      // User cancelled the II popup — treat as idle, not error
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("cancel") ||
        msg.toLowerCase().includes("closed") ||
        msg.toLowerCase().includes("user abort")
      ) {
        setStage("idle");
      } else if (
        msg.toLowerCase().includes("network") ||
        msg.toLowerCase().includes("fetch") ||
        msg.toLowerCase().includes("timeout")
      ) {
        setErrorMsg(
          "Network error — please check your connection and try again.",
        );
        setStage("error");
      } else {
        setErrorMsg("Authentication failed. Please try again.");
        setStage("error");
      }
    }
  };

  const handleRetry = () => {
    setStage("idle");
    setErrorMsg("");
  };

  const handleProfileComplete = (
    _name: string,
    _phone: string,
    role: UserRole,
  ) => {
    setStoredRole(role);
    hasRedirected.current = true;
    void navigate({ to: ROLE_REDIRECTS[role] ?? "/dashboard/client" });
  };

  const isConnectingToII = stage === "connecting" || stage === "success";

  // ── Sign In button label ───────────────────────────────────────────────────
  const buttonLabel = (() => {
    if (isConnectingToII) {
      return (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <title>Authenticating</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Authenticating…
        </span>
      );
    }
    if (isAdminSelected) {
      return (
        <span className="flex items-center gap-2 font-bold">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5 shrink-0"
            aria-hidden="true"
          >
            <title>Shield</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
          Go to Admin Portal
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-5 h-5 shrink-0"
          aria-hidden="true"
        >
          <title>Sign In</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"
          />
        </svg>
        Sign In with Internet Identity
      </span>
    );
  })();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.1 0.018 280)" }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.68 0.2 290 / 0.2), transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.22 70 / 0.15), transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1], x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <AnimatePresence>
          {isAdminSelected && (
            <motion.div
              key="admin-glow"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.85 0.18 85 / 0.12), transparent 70%)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Cinematic shutter lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={`shutter-${i}`}
            className="absolute h-px"
            style={{
              top: `${15 + i * 14}%`,
              left: "-10%",
              right: "-10%",
              background: `oklch(0.7 0.22 70 / ${0.04 + i * 0.01})`,
            }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.3 + i * 0.1,
              duration: 1.5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl border shadow-elevated overflow-hidden"
          style={{
            background: "oklch(0.155 0.018 280 / 0.92)",
            backdropFilter: "blur(24px)",
            borderColor: isAdminSelected
              ? "oklch(0.7 0.18 85 / 0.5)"
              : "oklch(0.3 0.02 280 / 0.5)",
            transition: "border-color 0.4s ease",
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-border/30">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center mb-5"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-2xl"
                style={{
                  background: "var(--gradient-gold)",
                  color: "oklch(0.12 0.02 280)",
                  boxShadow:
                    "0 0 32px oklch(0.7 0.22 70 / 0.45), 0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                RAP
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-display font-semibold text-foreground"
              style={{ textShadow: "0 0 24px oklch(0.7 0.22 70 / 0.4)" }}
            >
              Welcome Back to RAP Studio
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground mt-1"
            >
              {isAdminSelected
                ? "Owner portal — you will be redirected to Admin Login"
                : "Sign in to access your account"}
            </motion.p>

            {/* II warmup connecting pill */}
            <AnimatePresence>
              {isConnecting && !isAdminSelected && stage === "idle" && (
                <motion.div
                  key="connecting-pill"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "oklch(0.25 0.02 280)",
                    color: "oklch(0.65 0.06 280)",
                  }}
                  aria-live="polite"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                    style={{ background: "oklch(0.7 0.22 70)" }}
                  />
                  Preparing secure connection…
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Body */}
          <div className="px-8 py-7">
            <AnimatePresence mode="wait">
              {stage === "profile" ? (
                <LoginForm
                  key="profile-form"
                  prefilledRole={selectedRole}
                  onComplete={handleProfileComplete}
                />
              ) : (
                <motion.div
                  key="role-select"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Role selector */}
                  <div className="mb-5">
                    <p
                      className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3"
                      style={{ letterSpacing: "0.12em" }}
                    >
                      Select Your Role
                    </p>
                    <RoleSelector
                      selectedRole={selectedRole}
                      onRoleSelect={handleRoleSelect}
                      availableRoles={[
                        "client",
                        "student",
                        "receptionist",
                        "staff",
                        "admin",
                      ]}
                    />
                  </div>

                  {/* Error state */}
                  <AnimatePresence>
                    {stage === "error" && errorMsg && (
                      <motion.div
                        key="error-banner"
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4 rounded-xl border px-4 py-3 flex items-start gap-3"
                        style={{
                          background: "oklch(0.28 0.06 25 / 0.15)",
                          borderColor: "oklch(0.58 0.22 25 / 0.4)",
                        }}
                        role="alert"
                        data-ocid="login.error_state"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 mt-0.5 shrink-0"
                          style={{ color: "oklch(0.7 0.22 25)" }}
                          aria-hidden="true"
                        >
                          <title>Error</title>
                          <path
                            fillRule="evenodd"
                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm"
                            style={{ color: "oklch(0.85 0.05 25)" }}
                          >
                            {errorMsg}
                          </p>
                        </div>
                        <button
                          onClick={handleRetry}
                          type="button"
                          className="text-xs font-semibold shrink-0 transition-colors duration-200"
                          style={{ color: "oklch(0.7 0.22 70)" }}
                          data-ocid="login.retry_button"
                        >
                          Try Again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sign In button */}
                  <Button
                    onClick={() => void handleSignIn()}
                    disabled={isConnectingToII}
                    data-ocid="login.primary_button"
                    className="w-full h-12 text-base font-semibold transition-all duration-300"
                    style={{
                      background: isAdminSelected
                        ? "linear-gradient(135deg, oklch(0.72 0.18 85), oklch(0.85 0.2 90), oklch(0.72 0.18 85))"
                        : "var(--gradient-gold)",
                      boxShadow: isAdminSelected
                        ? "0 4px 24px oklch(0.8 0.18 85 / 0.45)"
                        : "0 4px 20px oklch(0.7 0.22 70 / 0.35)",
                      color: "oklch(0.12 0.02 280)",
                    }}
                  >
                    {buttonLabel}
                  </Button>

                  {/* Helper text */}
                  <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
                    {isAdminSelected ? (
                      "You will be redirected to a secure password-protected portal."
                    ) : (
                      <>
                        Secure login via{" "}
                        <span className="text-foreground/70 font-medium">
                          Internet Identity
                        </span>
                        . No passwords stored.
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 pt-4 border-t border-border/20 text-center">
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} RAP Integrated Studio.{" "}
              <a
                href="mailto:ruchithabs550@gmail.com"
                className="hover:text-muted-foreground transition-colors duration-200"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
