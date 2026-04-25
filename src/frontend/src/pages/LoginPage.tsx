import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ROLE_REDIRECTS: Record<string, string> = {
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

export function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    isLoggedIn,
    role,
    loading: authLoading,
    isActorReady,
  } = useAuth();

  const [mobileTab, setMobileTab] = useState<MobileTab>("register");
  const [showClientSuccessModal, setShowClientSuccessModal] = useState(false);
  const [registeredIdentifier, setRegisteredIdentifier] = useState("");
  const hasRedirected = useRef(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signinError, setSigninError] = useState("");
  const [isPendingApprovalError, setIsPendingApprovalError] = useState(false);
  const [isRejectedError, setIsRejectedError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const shakeRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (isLoggedIn && role && role !== "admin") {
      hasRedirected.current = true;
      void navigate({ to: ROLE_REDIRECTS[role] ?? "/dashboard/client" });
    }
  }, [isLoggedIn, role, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("rap_remember_identifier");
    if (saved) {
      setIdentifier(saved);
      setRememberMe(true);
    }
  }, []);

  const triggerShake = () => {
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
    setSubmitted(true);
    setIsPendingApprovalError(false);
    setIsRejectedError(false);
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setSigninError("Please enter your email or mobile number.");
      triggerShake();
      return;
    }
    if (!password) {
      setSigninError("Please enter your password.");
      triggerShake();
      return;
    }
    if (!isActorReady) {
      setSigninError("Connecting to backend… Please try again in a moment.");
      triggerShake();
      return;
    }
    setSigninError("");
    setIsSigningIn(true);
    const result = await login(trimmedId, password);
    setIsSigningIn(false);

    if (result.success) {
      if (rememberMe)
        localStorage.setItem("rap_remember_identifier", trimmedId);
      else localStorage.removeItem("rap_remember_identifier");

      const storedSession = localStorage.getItem("rap_session");
      let redirectRole = "client";
      if (storedSession) {
        try {
          const s = JSON.parse(storedSession) as { role: string };
          redirectRole = s.role;
        } catch {
          /* fallback */
        }
      }
      // Admin trying to use public login
      if (redirectRole === "admin") {
        toast.info("Admin? Please use /admin/login for secure access.", {
          duration: 5000,
        });
        void navigate({ to: "/admin/login" });
        return;
      }
      hasRedirected.current = true;
      toast.success("Welcome back! Redirecting…", { duration: 2500 });
      void navigate({
        to: ROLE_REDIRECTS[redirectRole] ?? "/dashboard/client",
      });
    } else {
      if (result.isPendingApproval) {
        setIsPendingApprovalError(true);
        setSigninError(result.error);
      } else if (
        result.error.toLowerCase().includes("suspend") ||
        result.error.toLowerCase().includes("not approved") ||
        result.error.toLowerCase().includes("denied")
      ) {
        setIsRejectedError(true);
        setSigninError(result.error);
      } else {
        setSigninError(result.error);
        triggerShake();
      }
    }
  };

  const handleClientSuccess = (email: string) => {
    setRegisteredIdentifier(email);
    setShowClientSuccessModal(true);
  };

  const handleSuccessDismiss = () => {
    setShowClientSuccessModal(false);
    setIdentifier(registeredIdentifier);
    toast.success("Account created! Sign in with your registered credentials.");
    setMobileTab("signin");
  };

  const hasIdentifierError = submitted && !identifier.trim();
  const hasPasswordError = submitted && !password;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Cinematic bokeh background */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="bokeh-orb bokeh-orb-1" />
        <div className="bokeh-orb bokeh-orb-2" />
        <div className="bokeh-orb bokeh-orb-3" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute h-px animate-fade-in"
            style={{
              top: `${18 + i * 19}%`,
              left: 0,
              right: 0,
              background: `oklch(var(--primary) / ${0.04 + i * 0.01})`,
              animationDelay: `${0.3 + i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/90 backdrop-blur-xl"
      >
        <a
          href="/"
          className="flex items-center gap-3"
          aria-label="RAP Studio home"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 shadow-glow-gold gradient-gold"
            style={{ color: "oklch(var(--primary-foreground))" }}
          >
            RAP
          </div>
          <div>
            <div className="font-display font-semibold text-foreground text-sm leading-tight">
              RAP Integrated Studio
            </div>
            <div className="text-xs text-muted-foreground leading-tight">
              Premium Photography &amp; Film
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

      <div className="flex-1 flex items-start justify-center px-4 py-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-5xl">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-primary border border-primary/25 bg-primary/10">
              ✦ RAP Studio Portal
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
              Welcome to RAP Studio
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              Your gateway to premium photography, film &amp; creative learning
            </p>
          </motion.div>

          {/* Mobile tab switcher */}
          <div className="lg:hidden flex gap-1 mb-6 p-1 rounded-2xl max-w-xs mx-auto bg-card border border-border/50">
            {(["register", "signin"] as const).map((tab) => (
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
                        color: "oklch(var(--primary-foreground))",
                      }
                    : undefined
                }
              >
                <span
                  className={
                    mobileTab === tab
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {tab === "signin" ? "Sign In" : "Register"}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-stretch gap-0 max-w-5xl mx-auto">
            {/* LEFT — New Registration */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1,
              }}
              className={`flex-1 lg:block ${mobileTab === "register" ? "block" : "hidden"}`}
            >
              <div className="h-full rounded-2xl lg:rounded-r-none border lg:border-r-0 p-6 md:p-8 login-panel">
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/15 text-primary">
                      ✦
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                      New Here?
                    </span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
                    New Registration
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Create your account as a{" "}
                    <span className="text-primary font-semibold">Client</span>{" "}
                    or{" "}
                    <span className="text-accent font-semibold">Student</span>.
                  </p>
                </div>
                <RegistrationForm onClientSuccess={handleClientSuccess} />
              </div>
            </motion.div>

            {/* Center divider */}
            <div className="hidden lg:flex flex-col items-center justify-center w-14 shrink-0 relative">
              <div className="flex-1 w-px login-divider" />
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 bg-card border-2 border-primary/60 text-primary"
                style={{ boxShadow: "0 0 16px oklch(var(--primary) / 0.25)" }}
              >
                OR
              </div>
              <div className="flex-1 w-px login-divider" />
            </div>

            {/* RIGHT — Sign In */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2,
              }}
              className={`flex-1 lg:block ${mobileTab === "signin" ? "block" : "hidden"}`}
            >
              <div className="h-full rounded-2xl lg:rounded-l-none border p-6 md:p-8 login-panel">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/15 text-primary">
                      →
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Already Registered
                    </span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sign in with your registered{" "}
                    <span className="font-semibold text-foreground">
                      email or mobile number
                    </span>
                    .
                  </p>
                </div>

                <form
                  ref={shakeRef}
                  onSubmit={(e) => void handleSignIn(e)}
                  className="space-y-4"
                  data-ocid="login.signin_form"
                  noValidate
                >
                  {/* Email or Mobile */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signin-identifier"
                      className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Email or Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-muted-foreground">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className="w-4 h-4"
                          aria-hidden="true"
                        >
                          <title>Identifier</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                          />
                        </svg>
                      </span>
                      <input
                        id="signin-identifier"
                        type="text"
                        placeholder="your@email.com or 9876543210"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setSigninError("");
                          setIsPendingApprovalError(false);
                          setIsRejectedError(false);
                        }}
                        className="input-field"
                        style={{
                          paddingLeft: "2.5rem",
                          border:
                            hasIdentifierError ||
                            (signinError &&
                              !isPendingApprovalError &&
                              !isRejectedError)
                              ? "1.5px solid oklch(var(--destructive))"
                              : undefined,
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
                      className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-muted-foreground">
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
                          setIsPendingApprovalError(false);
                          setIsRejectedError(false);
                        }}
                        className="input-field"
                        style={{
                          paddingLeft: "2.5rem",
                          paddingRight: "2.75rem",
                          border:
                            hasPasswordError ||
                            (signinError &&
                              !isPendingApprovalError &&
                              !isRejectedError)
                              ? "1.5px solid oklch(var(--destructive))"
                              : undefined,
                        }}
                        data-ocid="login.password.input"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-opacity hover:opacity-80 text-muted-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <EyeIcon show={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Error states */}
                  <AnimatePresence>
                    {isPendingApprovalError && signinError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="rounded-xl p-3 flex items-start gap-2.5 border"
                        style={{
                          background: "oklch(0.72 0.18 85 / 0.1)",
                          borderColor: "oklch(0.72 0.18 85 / 0.5)",
                        }}
                        role="alert"
                        data-ocid="login.pending_approval_banner"
                      >
                        <span className="text-lg shrink-0">⏳</span>
                        <div>
                          <p
                            className="font-bold text-xs mb-0.5"
                            style={{ color: "oklch(0.72 0.18 85)" }}
                          >
                            Account Pending Approval
                          </p>
                          <p className="text-xs leading-relaxed text-foreground/80">
                            Your account is awaiting admin approval. You will be
                            able to sign in once the admin reviews and approves
                            your registration.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isRejectedError && signinError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="rounded-xl p-3 flex items-start gap-2.5 border"
                        style={{
                          background: "oklch(var(--destructive) / 0.08)",
                          borderColor: "oklch(var(--destructive) / 0.45)",
                        }}
                        role="alert"
                        data-ocid="login.rejected_banner"
                      >
                        <span className="text-lg shrink-0">🚫</span>
                        <div>
                          <p className="font-bold text-xs mb-0.5 text-destructive">
                            Account Not Approved
                          </p>
                          <p className="text-xs leading-relaxed text-foreground/80">
                            Your account was not approved. Please contact admin
                            at{" "}
                            <a
                              href="mailto:ruchithabs550@gmail.com"
                              className="text-primary underline"
                            >
                              ruchithabs550@gmail.com
                            </a>
                            .
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {signinError &&
                      !isPendingApprovalError &&
                      !isRejectedError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs flex items-center gap-1.5 font-medium text-destructive"
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

                  {/* Remember Me + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border cursor-pointer"
                        style={{ accentColor: "oklch(var(--primary))" }}
                        data-ocid="login.remember_me.checkbox"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        Remember me
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
                      className="text-xs text-primary transition-colors duration-200 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {!isActorReady && (
                    <p className="text-xs text-center flex items-center justify-center gap-1.5 text-primary/70">
                      <SpinnerIcon /> Warming up connection…
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSigningIn || authLoading}
                    whileHover={{
                      scale: isSigningIn || authLoading ? 1 : 1.02,
                    }}
                    whileTap={{ scale: isSigningIn || authLoading ? 1 : 0.97 }}
                    className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
                    style={{
                      background: "var(--gradient-gold)",
                      color: "oklch(var(--primary-foreground))",
                      boxShadow: "0 4px 20px oklch(var(--primary) / 0.35)",
                      opacity: isSigningIn || authLoading ? 0.8 : 1,
                      cursor:
                        isSigningIn || authLoading ? "not-allowed" : "pointer",
                    }}
                    data-ocid="login.signin.primary_button"
                  >
                    {isSigningIn || authLoading ? (
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

                {/* Info cards */}
                <div className="mt-6 pt-5 border-t border-border/40 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div
                      className="rounded-xl px-3 py-3 border"
                      style={{
                        background: "oklch(var(--primary) / 0.08)",
                        borderColor: "oklch(var(--primary) / 0.3)",
                      }}
                    >
                      <div className="text-base mb-1">📸</div>
                      <div className="font-bold text-primary">Client</div>
                      <div className="text-muted-foreground leading-snug mt-0.5">
                        Book sessions &amp; shoots
                      </div>
                    </div>
                    <div
                      className="rounded-xl px-3 py-3 border"
                      style={{
                        background: "oklch(var(--accent) / 0.08)",
                        borderColor: "oklch(var(--accent) / 0.3)",
                      }}
                    >
                      <div className="text-base mb-1">🎓</div>
                      <div
                        className="font-bold"
                        style={{ color: "oklch(var(--accent))" }}
                      >
                        Student
                      </div>
                      <div className="text-muted-foreground leading-snug mt-0.5">
                        Courses &amp; certificates
                      </div>
                    </div>
                  </div>

                  {/* Staff/Receptionist note */}
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-2.5 border text-xs"
                    style={{
                      background: "oklch(var(--muted) / 0.5)",
                      borderColor: "oklch(var(--border) / 0.5)",
                    }}
                  >
                    <span className="text-base shrink-0">🔐</span>
                    <p className="text-muted-foreground leading-snug">
                      <strong className="text-foreground">
                        Staff or Receptionist?
                      </strong>{" "}
                      Register and sign in at{" "}
                      <a
                        href="/admin/login"
                        className="text-primary font-semibold hover:underline"
                        data-ocid="login.staff_admin_link"
                      >
                        /admin/login
                      </a>
                    </p>
                  </div>
                </div>
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
            <p className="text-xs text-muted-foreground/60">
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

      {/* Success modal for client registration */}
      <AnimatePresence>
        {showClientSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            data-ocid="register.success.dialog"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="w-full max-w-sm rounded-2xl border border-primary/45 p-8 shadow-elevated text-center bg-card backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-5 bg-primary/12 border-2 border-primary/40"
              >
                ✅
              </motion.div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Account Created!
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Your RAP Studio client account is ready. Welcome aboard!
              </p>
              <div className="rounded-xl border border-primary/20 px-4 py-3 mb-6 text-sm text-left bg-muted/50 text-foreground">
                <p className="font-semibold text-xs uppercase tracking-wider mb-1.5 text-primary">
                  Sign In With
                </p>
                <p>
                  Email:{" "}
                  <strong className="break-all text-primary">
                    {registeredIdentifier}
                  </strong>
                </p>
              </div>
              <Button
                onClick={handleSuccessDismiss}
                data-ocid="register.success.confirm_button"
                className="w-full h-11 text-sm font-semibold"
                style={{
                  background: "var(--gradient-gold)",
                  color: "oklch(var(--primary-foreground))",
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
