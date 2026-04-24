import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Button } from "@/components/ui/button";
import {
  readStoredProfile,
  saveUserSession,
  useStoredRole,
  warmupInternetIdentity,
} from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

warmupInternetIdentity();

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: "/admin",
  staff: "/dashboard/staff",
  receptionist: "/dashboard/receptionist",
  client: "/dashboard/client",
  student: "/dashboard/student",
};

type MobileTab = "signin" | "register";

const SpinnerIcon = () => (
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
);

const EyeIcon = ({ show }: { show: boolean }) =>
  show ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <title>Hide password</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <title>Show password</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );

const inputBase: React.CSSProperties = {
  color: "#000",
  backgroundColor: "#fff",
  border: "1px solid rgba(0,0,0,0.18)",
  borderRadius: "0.6rem",
  padding: "0.65rem 0.875rem",
  width: "100%",
  fontSize: "0.9rem",
  outline: "none",
  WebkitTextFillColor: "#000",
  transition: "border 0.2s, box-shadow 0.2s",
};

const inputFocus: React.CSSProperties = {
  border: "1.5px solid oklch(0.7 0.22 70)",
  boxShadow: "0 0 0 3px oklch(0.7 0.22 70 / 0.18)",
};

const inputError: React.CSSProperties = {
  border: "1.5px solid #ef4444",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [storedRole, setStoredRole] = useStoredRole();
  const [signinRole, setSigninRole] = useState<UserRole>(
    storedRole ?? "client",
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>("signin");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const hasRedirected = useRef(false);

  // Signin form state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signinError, setSigninError] = useState("");
  const [identifierFocused, setIdentifierFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const shakeRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (hasRedirected.current) return;
    const stored = readStoredProfile();
    if (stored?.name && stored?.role) {
      hasRedirected.current = true;
      void navigate({ to: ROLE_REDIRECTS[stored.role] ?? "/dashboard/client" });
    }
  }, [navigate]);

  const handleSigninRoleSelect = (role: UserRole) => {
    setSigninRole(role);
    setStoredRole(role);
    setSigninError("");
    if (role === "admin") {
      void navigate({ to: "/admin/login" });
    }
  };

  const shakeForm = () => {
    const el = shakeRef.current;
    if (!el) return;
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-3px)" },
        { transform: "translateX(3px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 480, easing: "ease-in-out" },
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signinRole === "admin") {
      void navigate({ to: "/admin/login" });
      return;
    }
    if (!identifier.trim()) {
      setSigninError("Please enter your username or mobile number.");
      shakeForm();
      return;
    }
    if (!password) {
      setSigninError("Please enter your password.");
      shakeForm();
      return;
    }
    setSigninError("");
    setIsSigningIn(true);
    await new Promise((r) => setTimeout(r, 900));

    // Retrieve stored users and verify credentials
    const stored = readStoredProfile();
    const usersRaw = localStorage.getItem("rap_users_db");
    const users: Array<{
      identifier: string;
      password: string;
      name: string;
      phone: string;
      role: UserRole;
    }> = usersRaw ? (JSON.parse(usersRaw) as typeof users) : [];

    const normalised = identifier.trim().toLowerCase();
    const match = users.find(
      (u) =>
        (u.identifier.toLowerCase() === normalised ||
          u.phone.replace(/\D/g, "") === normalised.replace(/\D/g, "")) &&
        u.password === password,
    );

    if (match) {
      saveUserSession(match.name, match.phone, match.role, rememberMe);
      hasRedirected.current = true;
      setIsSigningIn(false);
      toast.success(`Welcome back, ${match.name}!`);
      void navigate({ to: ROLE_REDIRECTS[match.role] ?? "/dashboard/client" });
      return;
    }

    // Fallback: check if stored profile matches (for existing sessions)
    if (stored?.name) {
      const storedPhone = stored.phone?.replace(/\D/g, "") ?? "";
      const enteredPhone = identifier.replace(/\D/g, "");
      if (
        storedPhone === enteredPhone ||
        stored.name.toLowerCase().includes(normalised)
      ) {
        saveUserSession(
          stored.name,
          stored.phone ?? "",
          stored.role,
          rememberMe,
        );
        hasRedirected.current = true;
        setIsSigningIn(false);
        toast.success(`Welcome back, ${stored.name}!`);
        void navigate({
          to: ROLE_REDIRECTS[stored.role] ?? "/dashboard/client",
        });
        return;
      }
    }

    setIsSigningIn(false);
    setSigninError(
      "Invalid credentials. Please check your username/mobile and password.",
    );
    shakeForm();
  };

  const handleRegistrationSubmit = () => {
    setShowOtpModal(true);
  };

  const handleOtpDismiss = () => {
    setShowOtpModal(false);
    toast.success(
      "Account created! Please sign in with your mobile and password.",
    );
    setMobileTab("signin");
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.08 0.02 280) 0%, oklch(0.12 0.018 270) 40%, oklch(0.1 0.015 260) 100%)",
      }}
    >
      {/* Bokeh animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          {
            w: 500,
            h: 500,
            top: -120,
            right: -80,
            color: "oklch(0.68 0.2 290 / 0.22)",
            dur: 25,
            dx: [0, 30, -20, 0],
            dy: [0, -40, 25, 0],
          },
          {
            w: 400,
            h: 400,
            bottom: -100,
            left: -80,
            color: "oklch(0.7 0.22 70 / 0.18)",
            dur: 30,
            dx: [0, -35, 20, 0],
            dy: [0, 30, -25, 0],
            delay: 4,
          },
          {
            w: 350,
            h: 350,
            top: "45%",
            left: "30%",
            color: "oklch(0.65 0.18 190 / 0.12)",
            dur: 35,
            dx: [0, 20, -15, 0],
            dy: [0, -20, 15, 0],
            delay: 8,
          },
        ].map((orb, i) => (
          <motion.div
            key={`orb-bg-${i + 1}`}
            className="absolute rounded-full"
            style={{
              width: orb.w,
              height: orb.h,
              top: "top" in orb ? orb.top : undefined,
              bottom: "bottom" in orb ? orb.bottom : undefined,
              left: "left" in orb ? orb.left : undefined,
              right: "right" in orb ? orb.right : undefined,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              filter: "blur(80px)",
              opacity: 0.18,
            }}
            animate={{ x: orb.dx, y: orb.dy, scale: [1, 1.1, 0.95, 1] }}
            transition={{
              duration: orb.dur,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: "delay" in orb ? orb.delay : 0,
            }}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-px"
            style={{
              top: `${15 + i * 17}%`,
              left: 0,
              right: 0,
              background: `oklch(0.7 0.22 70 / ${0.03 + i * 0.006})`,
            }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 2, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 py-4 border-b"
        style={{
          borderColor: "oklch(0.3 0.02 280 / 0.35)",
          background: "oklch(0.1 0.018 280 / 0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        <a href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{
              background: "var(--gradient-gold)",
              color: "oklch(0.1 0.02 280)",
              boxShadow: "0 0 24px oklch(0.7 0.22 70 / 0.45)",
            }}
          >
            RAP
          </div>
          <div>
            <div
              className="font-display font-semibold text-foreground text-sm leading-tight"
              style={{ textShadow: "0 0 18px oklch(0.7 0.22 70 / 0.5)" }}
            >
              RAP Integrated Studio
            </div>
            <div className="text-xs text-muted-foreground leading-tight">
              Premium Photography & Film
            </div>
          </div>
        </a>
        <a
          href="mailto:ruchithabs550@gmail.com"
          className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 hidden sm:block"
        >
          Need help? Contact us
        </a>
      </motion.header>

      {/* Main */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-5xl">
          {/* Hero heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center mb-8"
          >
            <div
              className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                background: "oklch(0.7 0.22 70 / 0.12)",
                border: "1px solid oklch(0.7 0.22 70 / 0.25)",
                color: "oklch(0.7 0.22 70)",
              }}
            >
              ✦ RAP Studio Portal
            </div>
            <h1
              className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2"
              style={{ textShadow: "0 0 32px oklch(0.7 0.22 70 / 0.4)" }}
            >
              Welcome to RAP Studio
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              Your gateway to premium photography, film & creative learning
            </p>
          </motion.div>

          {/* Mobile tab toggle */}
          <div
            className="lg:hidden flex gap-1 mb-6 p-1 rounded-2xl max-w-xs mx-auto"
            style={{
              background: "oklch(0.14 0.018 280 / 0.9)",
              border: "1px solid oklch(0.3 0.02 280 / 0.5)",
            }}
          >
            {(["signin", "register"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                data-ocid={`login.tab.${tab}`}
                className="flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300"
                style={
                  mobileTab === tab
                    ? {
                        background: "var(--gradient-gold)",
                        color: "oklch(0.1 0.02 280)",
                        boxShadow: "0 2px 12px oklch(0.7 0.22 70 / 0.35)",
                      }
                    : { color: "oklch(0.55 0.01 280)" }
                }
              >
                {tab === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Two-panel layout */}
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-0 max-w-5xl mx-auto">
            {/* ── LEFT PANEL: Already Registered (Sign In) ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1,
              }}
              className={[
                "flex-1 lg:block",
                mobileTab === "signin" ? "block" : "hidden",
              ].join(" ")}
            >
              <div
                className="h-full rounded-2xl lg:rounded-r-none border lg:border-r-0 p-6 md:p-8 shadow-elevated"
                style={{
                  background: "oklch(0.135 0.018 280 / 0.94)",
                  backdropFilter: "blur(28px)",
                  borderColor:
                    signinRole === "admin"
                      ? "oklch(0.78 0.2 85 / 0.5)"
                      : "oklch(0.3 0.02 280 / 0.5)",
                  transition: "border-color 0.4s ease",
                  boxShadow:
                    "0 0 60px oklch(0.7 0.22 70 / 0.08), inset 0 1px 0 oklch(0.7 0.22 70 / 0.06)",
                }}
              >
                {/* Panel header */}
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: "oklch(0.22 0.025 280)",
                        color: "oklch(0.7 0.22 70)",
                      }}
                    >
                      ⟶
                    </span>
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "oklch(0.7 0.22 70)" }}
                    >
                      Already Registered
                    </span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
                    {signinRole === "admin"
                      ? "Admin Portal Access"
                      : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {signinRole === "admin"
                      ? "Owner portal — you'll be redirected to the secure admin login."
                      : "Select your role and sign in with your credentials."}
                  </p>
                </div>

                {/* Role selector */}
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Sign in as
                  </p>
                  <RoleSelector
                    selectedRole={signinRole}
                    onRoleSelect={handleSigninRoleSelect}
                    availableRoles={[
                      "client",
                      "student",
                      "receptionist",
                      "staff",
                      "admin",
                    ]}
                  />
                </div>

                {/* Credential form (hidden when admin) */}
                <AnimatePresence mode="wait">
                  {signinRole !== "admin" ? (
                    <motion.div
                      key="credential-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <form
                        ref={shakeRef}
                        onSubmit={(e) => void handleSignIn(e)}
                        className="space-y-4"
                        data-ocid="login.signin_form"
                        noValidate
                      >
                        {/* Username / Mobile */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor="signin-identifier"
                            className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider"
                          >
                            Username or Mobile Number
                          </label>
                          <div className="relative">
                            <span
                              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                              style={{ color: "oklch(0.5 0.08 280)" }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                className="w-4 h-4"
                                aria-hidden="true"
                              >
                                <title>User</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                              </svg>
                            </span>
                            <input
                              id="signin-identifier"
                              type="text"
                              placeholder="Your username or 10-digit mobile"
                              value={identifier}
                              onChange={(e) => {
                                setIdentifier(e.target.value);
                                setSigninError("");
                              }}
                              onFocus={() => setIdentifierFocused(true)}
                              onBlur={() => setIdentifierFocused(false)}
                              style={{
                                ...inputBase,
                                paddingLeft: "2.5rem",
                                ...(identifierFocused ? inputFocus : {}),
                                ...(signinError ? inputError : {}),
                              }}
                              data-ocid="login.identifier.input"
                              autoComplete="username"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor="signin-password"
                            className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider"
                          >
                            Password
                          </label>
                          <div className="relative">
                            <span
                              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                              style={{ color: "oklch(0.5 0.08 280)" }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                className="w-4 h-4"
                                aria-hidden="true"
                              >
                                <title>Password</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                />
                              </svg>
                            </span>
                            <input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                setSigninError("");
                              }}
                              onFocus={() => setPasswordFocused(true)}
                              onBlur={() => setPasswordFocused(false)}
                              style={{
                                ...inputBase,
                                paddingLeft: "2.5rem",
                                paddingRight: "2.75rem",
                                ...(passwordFocused ? inputFocus : {}),
                                ...(signinError ? inputError : {}),
                              }}
                              data-ocid="login.password.input"
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-opacity hover:opacity-80"
                              style={{ color: "oklch(0.4 0.04 280)" }}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              <EyeIcon show={showPassword} />
                            </button>
                          </div>
                          {/* Inline error */}
                          <AnimatePresence>
                            {signinError && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-xs flex items-center gap-1.5 font-medium"
                                style={{ color: "#ef4444" }}
                                role="alert"
                                data-ocid="login.signin.error_state"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-3.5 h-3.5 shrink-0"
                                  aria-hidden="true"
                                >
                                  <title>Error</title>
                                  <path
                                    fillRule="evenodd"
                                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {signinError}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Remember me + forgot */}
                        <div className="flex items-center justify-between">
                          <label
                            className="flex items-center gap-2 cursor-pointer group"
                            data-ocid="login.remember_me"
                          >
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-3.5 h-3.5 rounded accent-yellow-500"
                              aria-label="Remember me for 48 hours"
                            />
                            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                              Remember me (48hr)
                            </span>
                          </label>
                          <button
                            type="button"
                            data-ocid="login.forgot_password"
                            onClick={() =>
                              toast.info(
                                "Contact admin at ruchithabs550@gmail.com to reset your password.",
                                { duration: 6000 },
                              )
                            }
                            className="text-xs transition-colors duration-200 hover:underline"
                            style={{ color: "oklch(0.7 0.22 70)" }}
                          >
                            Forgot Password?
                          </button>
                        </div>

                        {/* Sign In button */}
                        <motion.button
                          type="submit"
                          disabled={isSigningIn}
                          whileHover={{ scale: isSigningIn ? 1 : 1.02 }}
                          whileTap={{ scale: isSigningIn ? 1 : 0.97 }}
                          className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
                          style={{
                            background: "var(--gradient-gold)",
                            color: "oklch(0.1 0.02 280)",
                            boxShadow: "0 4px 20px oklch(0.7 0.22 70 / 0.35)",
                            opacity: isSigningIn ? 0.8 : 1,
                            cursor: isSigningIn ? "not-allowed" : "pointer",
                          }}
                          data-ocid="login.signin.primary_button"
                        >
                          {isSigningIn ? (
                            <>
                              <SpinnerIcon /> Signing In…
                            </>
                          ) : (
                            <>
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                className="w-4 h-4 shrink-0"
                                aria-hidden="true"
                              >
                                <title>Sign In</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                                />
                              </svg>
                              Sign In to RAP Studio
                            </>
                          )}
                        </motion.button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="admin-redirect"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Button
                        onClick={() => void navigate({ to: "/admin/login" })}
                        data-ocid="login.admin.primary_button"
                        className="w-full h-12 font-semibold text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.72 0.18 85), oklch(0.85 0.2 90), oklch(0.72 0.18 85))",
                          boxShadow: "0 4px 24px oklch(0.8 0.18 85 / 0.45)",
                          color: "oklch(0.1 0.02 280)",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="w-4 h-4 mr-2 shrink-0"
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
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Redirected to secure password-protected portal.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Role access info */}
                <div
                  className="mt-5 pt-4 border-t"
                  style={{ borderColor: "oklch(0.3 0.02 280 / 0.35)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Role Access
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      {
                        role: "Client",
                        desc: "Book sessions, view history",
                        color: "oklch(0.7 0.22 70)",
                      },
                      {
                        role: "Student",
                        desc: "Courses & certificates",
                        color: "oklch(0.65 0.2 230)",
                      },
                      {
                        role: "Staff",
                        desc: "Upload & manage work",
                        color: "oklch(0.65 0.18 190)",
                      },
                      {
                        role: "Receptionist",
                        desc: "Manage bookings",
                        color: "oklch(0.65 0.16 160)",
                      },
                    ].map(({ role, desc, color }) => (
                      <div
                        key={role}
                        className="rounded-lg px-3 py-2"
                        style={{
                          background: "oklch(0.18 0.02 280 / 0.5)",
                          border: `1px solid ${color.replace(")", " / 0.18)")}`,
                        }}
                      >
                        <div className="font-semibold" style={{ color }}>
                          {role}
                        </div>
                        <div className="text-muted-foreground leading-snug mt-0.5">
                          {desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gold divider — desktop only */}
            <div className="hidden lg:flex flex-col items-center justify-center w-14 shrink-0 relative">
              <div
                className="flex-1 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, oklch(0.7 0.22 70 / 0.5) 50%, transparent)",
                }}
              />
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10"
                style={{
                  background: "oklch(0.14 0.018 280)",
                  border: "2px solid oklch(0.7 0.22 70 / 0.6)",
                  color: "oklch(0.7 0.22 70)",
                  boxShadow: "0 0 16px oklch(0.7 0.22 70 / 0.25)",
                }}
              >
                OR
              </div>
              <div
                className="flex-1 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.7 0.22 70 / 0.5) 50%, transparent)",
                }}
              />
            </div>

            {/* ── RIGHT PANEL: New Registration ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2,
              }}
              className={[
                "flex-1 lg:block",
                mobileTab === "register" ? "block" : "hidden",
              ].join(" ")}
            >
              <div
                className="h-full rounded-2xl lg:rounded-l-none border p-6 md:p-8 shadow-elevated"
                style={{
                  background: "oklch(0.135 0.018 280 / 0.92)",
                  backdropFilter: "blur(28px)",
                  borderColor: "oklch(0.3 0.02 280 / 0.5)",
                  boxShadow:
                    "0 0 60px oklch(0.68 0.2 290 / 0.06), inset 0 1px 0 oklch(0.7 0.22 70 / 0.05)",
                }}
              >
                {/* Panel header */}
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: "oklch(0.22 0.025 280)",
                        color: "oklch(0.7 0.22 70)",
                      }}
                    >
                      ✦
                    </span>
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "oklch(0.7 0.22 70)" }}
                    >
                      New Here?
                    </span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
                    New Registration
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Join as a Client or Student — your creative journey begins
                    here.
                  </p>
                </div>

                {/* Role type toggle */}
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    I want to join as
                  </p>
                  <RoleSelector
                    selectedRole={null}
                    onRoleSelect={() => {}}
                    availableRoles={["client", "student"]}
                    registrationMode
                    data-ocid="register.role_selector"
                  />
                </div>

                {/* Full registration form */}
                <RegistrationForm onSubmit={handleRegistrationSubmit} />
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mt-8 pb-4"
          >
            <p className="text-xs text-muted-foreground/50">
              © {new Date().getFullYear()} RAP Integrated Studio.{" "}
              <a
                href="mailto:ruchithabs550@gmail.com"
                className="hover:text-muted-foreground transition-colors duration-200"
              >
                Contact Support
              </a>
              {" · "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-muted-foreground transition-colors duration-200"
              >
                Built with caffeine.ai
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "oklch(0.05 0.01 280 / 0.85)",
              backdropFilter: "blur(8px)",
            }}
            data-ocid="otp.dialog"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="w-full max-w-sm rounded-2xl border p-8 shadow-elevated text-center"
              style={{
                background: "oklch(0.14 0.018 280 / 0.98)",
                backdropFilter: "blur(28px)",
                borderColor: "oklch(0.7 0.22 70 / 0.45)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-5"
                style={{
                  background: "oklch(0.7 0.22 70 / 0.12)",
                  border: "2px solid oklch(0.7 0.22 70 / 0.4)",
                }}
              >
                ✅
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Account Created!
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Your account has been registered successfully.
              </p>
              <div
                className="rounded-xl border px-4 py-3 mb-6 text-sm text-left"
                style={{
                  background: "oklch(0.22 0.025 280 / 0.5)",
                  borderColor: "oklch(0.7 0.22 70 / 0.2)",
                  color: "oklch(0.75 0.04 280)",
                }}
              >
                <p
                  className="font-semibold text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "oklch(0.7 0.22 70)" }}
                >
                  Next Steps
                </p>
                <p>
                  Sign in using your <strong>mobile number</strong> and the
                  password you just created.
                </p>
              </div>
              <Button
                onClick={handleOtpDismiss}
                data-ocid="otp.confirm_button"
                className="w-full h-11 text-sm font-semibold"
                style={{
                  background: "var(--gradient-gold)",
                  color: "oklch(0.1 0.02 280)",
                }}
              >
                Go to Sign In
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
