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

// ── Floating particle background ────────────────────────────────────────────
function ParticleBackground() {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 40%, oklch(0.18 0.06 262 / 0.9) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 60%, oklch(0.14 0.04 244 / 0.95) 0%, transparent 60%), oklch(0.11 0.014 244)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(var(--primary) / 0.6) 50%, transparent 100%)",
        }}
      />
      <div className="bokeh-orb bokeh-orb-1" />
      <div className="bokeh-orb bokeh-orb-2" />
      <div className="bokeh-orb bokeh-orb-3" />
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${5 + ((i * 5.2) % 90)}%`,
            top: `${8 + ((i * 4.7) % 84)}%`,
            background:
              i % 3 === 0
                ? "oklch(var(--primary) / 0.5)"
                : i % 3 === 1
                  ? "oklch(var(--accent) / 0.4)"
                  : "oklch(var(--foreground) / 0.2)",
          }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{
            duration: 3 + (i % 4),
            delay: i * 0.22,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

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

// ── Sign In Form ──────────────────────────────────────────────────────────────
interface SignInFormProps {
  onRegisterClick: () => void;
}

function SignInForm({ onRegisterClick }: SignInFormProps) {
  const navigate = useNavigate();
  const {
    login,
    isLoggedIn,
    role,
    loading: authLoading,
    isActorReady,
  } = useAuth();

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
  const hasRedirected = useRef(false);

  // Redirect if already logged in
  useEffect(() => {
    if (hasRedirected.current) return;
    if (isLoggedIn && role && role !== "admin") {
      hasRedirected.current = true;
      void navigate({ to: ROLE_REDIRECTS[role] ?? "/dashboard/client" });
    }
  }, [isLoggedIn, role, navigate]);

  // Restore "remember me" identifier
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
      setSigninError("Connecting to server… Please try again in a moment.");
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

      let redirectRole = "client";
      try {
        const storedSession = localStorage.getItem("rap_session");
        if (storedSession) {
          const s = JSON.parse(storedSession) as { role?: string };
          redirectRole = s.role ?? "client";
        }
      } catch {
        /* use fallback */
      }

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
        to: (ROLE_REDIRECTS[redirectRole] ?? "/dashboard/client") as "/",
      });
    } else {
      if (result.isPendingApproval) {
        setIsPendingApprovalError(true);
        setSigninError(result.error ?? "Your account is awaiting approval.");
      } else if (
        (result.error ?? "").toLowerCase().includes("suspend") ||
        (result.error ?? "").toLowerCase().includes("not approved") ||
        (result.error ?? "").toLowerCase().includes("denied")
      ) {
        setIsRejectedError(true);
        setSigninError(result.error ?? "Account not approved.");
      } else {
        setSigninError(result.error ?? "Login failed. Please try again.");
        triggerShake();
      }
    }
  };

  const hasIdentifierError = submitted && !identifier.trim();
  const hasPasswordError = submitted && !password;

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in with your{" "}
          <span className="font-semibold text-foreground">
            email or mobile number
          </span>
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
                borderColor:
                  hasIdentifierError ||
                  (signinError && !isPendingApprovalError && !isRejectedError)
                    ? "oklch(var(--destructive))"
                    : undefined,
              }}
              data-ocid="login.identifier.input"
              autoComplete="username"
            />
          </div>
          {hasIdentifierError && (
            <p
              className="text-xs text-destructive flex items-center gap-1"
              role="alert"
              data-ocid="login.identifier.field_error"
            >
              ⚠ Email or mobile number is required
            </p>
          )}
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
                borderColor:
                  hasPasswordError ||
                  (signinError && !isPendingApprovalError && !isRejectedError)
                    ? "oklch(var(--destructive))"
                    : undefined,
              }}
              data-ocid="login.password.input"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-opacity hover:opacity-80 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon show={showPassword} />
            </button>
          </div>
          {hasPasswordError && (
            <p
              className="text-xs text-destructive flex items-center gap-1"
              role="alert"
              data-ocid="login.password.field_error"
            >
              ⚠ Password is required
            </p>
          )}
        </div>

        {/* Error banners */}
        <AnimatePresence>
          {isPendingApprovalError && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.3 }}
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
                  Your account is awaiting admin approval. You will be notified
                  once approved.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isRejectedError && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-3 flex items-start gap-2.5 border border-destructive/45 bg-destructive/8"
              role="alert"
              data-ocid="login.rejected_banner"
            >
              <span className="text-lg shrink-0">🚫</span>
              <div>
                <p className="font-bold text-xs mb-0.5 text-destructive">
                  Account Not Approved
                </p>
                <p className="text-xs leading-relaxed text-foreground/80">
                  Your account was not approved. Contact{" "}
                  <a
                    href="mailto:ruchithabs550@gmail.com"
                    className="text-primary underline"
                  >
                    ruchithabs550@gmail.com
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {signinError && !isPendingApprovalError && !isRejectedError && (
            <motion.p
              key="error"
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

        {/* Remember Me */}
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

        {/* Actor warmup indicator */}
        {!isActorReady && !authLoading && (
          <p className="text-xs text-center flex items-center justify-center gap-1.5 text-primary/70">
            <SpinnerIcon /> Warming up connection…
          </p>
        )}

        <motion.button
          type="submit"
          disabled={isSigningIn || authLoading}
          whileHover={{ scale: isSigningIn || authLoading ? 1 : 1.02 }}
          whileTap={{ scale: isSigningIn || authLoading ? 1 : 0.97 }}
          className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: "var(--gradient-gold)",
            color: "oklch(var(--primary-foreground))",
            boxShadow: "0 4px 24px oklch(var(--primary) / 0.4)",
            opacity: isSigningIn || authLoading ? 0.8 : 1,
            cursor: isSigningIn || authLoading ? "not-allowed" : "pointer",
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

      {/* Role info cards */}
      <div className="grid grid-cols-2 gap-2 text-xs mt-4">
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
            Book sessions & shoots
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
          <div className="font-bold" style={{ color: "oklch(var(--accent))" }}>
            Student
          </div>
          <div className="text-muted-foreground leading-snug mt-0.5">
            Courses & certificates
          </div>
        </div>
      </div>

      {/* Not registered */}
      <p className="text-xs text-center text-muted-foreground pt-1">
        New here?{" "}
        <button
          type="button"
          onClick={onRegisterClick}
          className="text-primary font-semibold hover:underline"
          data-ocid="login.go_to_register"
        >
          Create your account
        </button>
      </p>

      {/* Staff/Admin note */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-2.5 border text-xs mt-2"
        style={{
          background: "oklch(var(--muted) / 0.4)",
          borderColor: "oklch(var(--border) / 0.5)",
        }}
      >
        <span className="text-base shrink-0">🔐</span>
        <p className="text-muted-foreground leading-snug">
          <strong className="text-foreground">Staff or Receptionist?</strong>{" "}
          Use{" "}
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
  );
}

// ── Register Panel ──────────────────────────────────────────────────────────
interface RegisterPanelProps {
  onClientSuccess: (email: string) => void;
  onSignInClick: () => void;
}

function RegisterPanel({ onClientSuccess, onSignInClick }: RegisterPanelProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          New Registration
        </h2>
        <p className="text-sm text-muted-foreground">
          Create your account as a{" "}
          <span className="text-primary font-semibold">Client</span> or{" "}
          <span
            className="font-semibold"
            style={{ color: "oklch(var(--accent))" }}
          >
            Student
          </span>
          .
        </p>
      </div>
      <RegistrationForm onClientSuccess={onClientSuccess} />
      <p className="text-xs text-center text-muted-foreground mt-4">
        Already registered?{" "}
        <button
          type="button"
          onClick={onSignInClick}
          className="text-primary font-semibold hover:underline"
          data-ocid="login.go_to_signin"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────
export function LoginPage() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("signin");
  const [showClientSuccessModal, setShowClientSuccessModal] = useState(false);
  const [registeredIdentifier, setRegisteredIdentifier] = useState("");

  const handleClientSuccess = (email: string) => {
    setRegisteredIdentifier(email);
    setShowClientSuccessModal(true);
  };

  const handleSuccessDismiss = () => {
    setShowClientSuccessModal(false);
    toast.success("Account created! Sign in with your registered credentials.");
    setMobileTab("signin");
  };

  const owners = [
    { name: "RUCHITHA B S", role: "Co-Founder" },
    { name: "ASHITHA S", role: "Co-Founder" },
    { name: "PRARTHANA R", role: "Co-Founder" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <ParticleBackground />

      {/* Top nav bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid oklch(var(--primary) / 0.15)",
          background: "oklch(var(--card) / 0.7)",
          backdropFilter: "blur(12px)",
        }}
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

      {/* Main content */}
      <div className="flex-1 flex relative z-10">
        {/* LEFT — Branding panel (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 xl:p-14"
          style={{
            borderRight: "1px solid oklch(var(--primary) / 0.12)",
            background:
              "linear-gradient(160deg, oklch(0.14 0.042 262 / 0.9) 0%, oklch(0.11 0.014 244 / 0.95) 100%)",
          }}
        >
          <div>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-bold text-3xl shadow-glow-gold gradient-gold mb-6"
              style={{ color: "oklch(var(--primary-foreground))" }}
            >
              RAP
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-display text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-3"
            >
              RAP Integrated
              <br />
              <span style={{ color: "oklch(var(--primary))" }}>Studio</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground text-base leading-relaxed mb-8"
            >
              Your gateway to premium photography, cinematic film &amp; creative
              learning
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-3"
            >
              {[
                { icon: "📸", label: "Professional Photography Sessions" },
                { icon: "🎬", label: "Cinematic Video Production" },
                { icon: "🎓", label: "50+ Photography & Film Courses" },
                { icon: "🏆", label: "Certified Professionals" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      background: "oklch(var(--primary) / 0.12)",
                      border: "1px solid oklch(var(--primary) / 0.25)",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Owners section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[3px] mb-3"
              style={{ color: "oklch(var(--primary) / 0.7)" }}
            >
              Studio Owners
            </p>
            <div className="space-y-2">
              {owners.map((owner) => (
                <div key={owner.name} className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "oklch(var(--primary) / 0.2)",
                      border: "1.5px solid oklch(var(--primary) / 0.4)",
                      color: "oklch(var(--primary))",
                    }}
                  >
                    {owner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      {owner.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {owner.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-[10px] text-muted-foreground/50">
              © {new Date().getFullYear()} RAP Integrated Studio · All rights
              reserved
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT — Auth forms */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
          {/* Mobile header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center mb-6 lg:hidden"
          >
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-primary border border-primary/25 bg-primary/10">
              ✦ RAP Studio Portal
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Welcome to RAP Studio
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Premium photography, film &amp; creative learning
            </p>
          </motion.div>

          {/* Mobile tab switcher */}
          <div className="lg:hidden flex gap-1 mb-5 p-1 rounded-2xl max-w-xs mx-auto border border-border/50 bg-card/80 w-full">
            {(["signin", "register"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                data-ocid={`login.tab.${tab}`}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300"
                style={
                  mobileTab === tab
                    ? {
                        background: "var(--gradient-gold)",
                        color: "oklch(var(--primary-foreground))",
                      }
                    : {
                        color: "oklch(var(--muted-foreground))",
                      }
                }
              >
                {tab === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            className="w-full max-w-lg"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-luxury"
              style={{
                background: "oklch(var(--card) / 0.85)",
                border: "1px solid oklch(var(--primary) / 0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Gold top accent bar */}
              <div className="h-1 w-full gradient-gold" />

              {/* Desktop tabs */}
              <div className="hidden lg:flex border-b border-border/40">
                {(["signin", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMobileTab(tab)}
                    data-ocid={`login.tab.${tab}.desktop`}
                    className="flex-1 py-4 text-sm font-bold transition-all duration-300 relative"
                    style={{
                      color:
                        mobileTab === tab
                          ? "oklch(var(--primary))"
                          : "oklch(var(--muted-foreground))",
                      borderBottom:
                        mobileTab === tab
                          ? "2px solid oklch(var(--primary))"
                          : "2px solid transparent",
                    }}
                  >
                    {tab === "signin" ? "✦ Sign In" : "✦ New Registration"}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {mobileTab === "signin" ? (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <SignInForm
                        onRegisterClick={() => setMobileTab("register")}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <RegisterPanel
                        onClientSuccess={handleClientSuccess}
                        onSignInClick={() => setMobileTab("signin")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center mt-5 pb-4"
            >
              <p className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} RAP Integrated Studio ·{" "}
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
          </motion.div>
        </div>
      </div>

      {/* Client registration success modal */}
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
