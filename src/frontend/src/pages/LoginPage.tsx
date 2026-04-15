import { LoginForm } from "@/components/auth/LoginForm";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Button } from "@/components/ui/button";
import {
  useAuth,
  useIIConnectionState,
  useStoredRole,
  useUserProfile,
  warmupInternetIdentity,
} from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// Module-level warmup: fires as soon as this file is imported (before mount)
// giving the maximum possible head-start for the II AuthClient connection.
warmupInternetIdentity();

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: "/admin",
  staff: "/dashboard/staff",
  receptionist: "/dashboard/receptionist",
  client: "/dashboard/client",
  student: "/dashboard/student",
};

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [storedRole, setStoredRole] = useStoredRole();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    storedRole ?? "client",
  );
  const { data: profile } = useUserProfile();
  const [showProfileForm, setShowProfileForm] = useState(false);
  // isSigningIn: true only AFTER user clicked the Sign In button
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Deferred "Connecting…" indicator — only shows after 300ms if II not warmed
  const { isConnecting } = useIIConnectionState();

  const isAdminSelected = selectedRole === "admin";

  // After II auth resolves, redirect or show profile form
  useEffect(() => {
    if (!isAuthenticated) return;
    if (profile?.name) {
      const dest = ROLE_REDIRECTS[profile.role] ?? "/dashboard/client";
      void navigate({ to: dest });
    } else if (!isLoading) {
      setShowProfileForm(true);
      setIsSigningIn(false);
    }
  }, [isAuthenticated, isLoading, profile, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStoredRole(role);
  };

  const handleSignIn = async () => {
    if (!selectedRole) return;

    // Admin (Owner) → go directly to /admin/login, no II needed
    if (selectedRole === "admin") {
      void navigate({ to: "/admin/login" });
      return;
    }

    setIsSigningIn(true);
    try {
      await login();
    } catch {
      setIsSigningIn(false);
    }
  };

  const handleProfileComplete = (
    _name: string,
    _phone: string,
    role: UserRole,
  ) => {
    setStoredRole(role);
    void navigate({ to: ROLE_REDIRECTS[role] ?? "/dashboard/client" });
  };

  // Label for the sign-in button
  const buttonLabel = (() => {
    if (isSigningIn) {
      return (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <title>Loading</title>
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
            className="w-5 h-5"
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
          className="w-5 h-5"
          aria-hidden="true"
        >
          <title>Key</title>
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
        {/* Admin golden glow */}
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

      {/* Shutter decoration lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={`shutter-line-${i}`}
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

      {/* Card — renders immediately, no loading gate */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl border shadow-elevated overflow-hidden"
          style={{
            background: "oklch(0.155 0.018 280 / 0.85)",
            backdropFilter: "blur(20px)",
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
                className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-2xl text-primary-foreground"
                style={{
                  background: "var(--gradient-gold)",
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
              className="text-2xl font-display font-semibold text-foreground text-glow-gold"
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

            {/* Deferred "Connecting…" pill — only appears if II warmup takes >1s */}
            <AnimatePresence>
              {isConnecting && !isAdminSelected && (
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
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "oklch(0.7 0.22 70)" }}
                  />
                  Connecting to Internet Identity…
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Body — always renders immediately, no auth-gate */}
          <div className="px-8 py-7">
            <AnimatePresence mode="wait">
              {!showProfileForm ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-5">
                    <p className="section-label mb-3">Select Your Role</p>
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

                  <Button
                    onClick={() => void handleSignIn()}
                    disabled={!selectedRole || isSigningIn}
                    data-ocid="btn-sign-in-ii"
                    className="w-full h-12 text-base font-semibold"
                    style={{
                      background: selectedRole
                        ? isAdminSelected
                          ? "linear-gradient(135deg, oklch(0.72 0.18 85), oklch(0.85 0.2 90), oklch(0.72 0.18 85))"
                          : "var(--gradient-gold)"
                        : undefined,
                      boxShadow: selectedRole
                        ? isAdminSelected
                          ? "0 4px 24px oklch(0.8 0.18 85 / 0.45)"
                          : "0 4px 20px oklch(0.7 0.22 70 / 0.35)"
                        : undefined,
                      color: selectedRole ? "oklch(0.12 0.02 280)" : undefined,
                    }}
                  >
                    {buttonLabel}
                  </Button>
                </motion.div>
              ) : (
                <LoginForm
                  key="profile-form"
                  prefilledRole={selectedRole ?? "client"}
                  onComplete={handleProfileComplete}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-7 flex flex-col items-center gap-4 border-t border-border/20 pt-5">
            <a
              href="https://wa.me/917338501228"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              data-ocid="link-whatsapp-support"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
                style={{ color: "oklch(0.72 0.18 155)" }}
              >
                <title>WhatsApp</title>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.553 4.126 1.527 5.862L.057 23.52a.5.5 0 0 0 .622.609l5.806-1.522A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.908 0-3.7-.51-5.242-1.4l-.373-.215-3.87 1.015 1.032-3.763-.23-.389A9.951 9.951 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp Support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
