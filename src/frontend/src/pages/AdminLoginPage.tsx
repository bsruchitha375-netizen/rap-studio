import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSession, saveAdminSession } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ADMIN_PASSWORD = "rapstudio2024";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("Administrator");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const shakeControls = useAnimation();
  const passwordRef = useRef<HTMLInputElement>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const remainingAttempts = MAX_ATTEMPTS - attempts;

  useEffect(() => {
    const session = getAdminSession();
    if (session?.loggedIn) {
      void navigate({ to: "/admin" });
    } else {
      setTimeout(() => passwordRef.current?.focus(), 150);
    }
  }, [navigate]);

  const shakeInput = async () => {
    await shakeControls.start({
      x: [0, -10, 10, -10, 10, -6, 6, -3, 3, 0],
      transition: { duration: 0.5 },
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setIsVerifying(true);

    // Simulate verification delay for security feel
    await new Promise((r) => setTimeout(r, 400));

    if (password === ADMIN_PASSWORD) {
      saveAdminSession(name.trim() || "Administrator", "+917338501228");
      void navigate({ to: "/admin" });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      await shakeInput();

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
        setPasswordError(
          "Too many failed attempts. Account locked for 5 minutes.",
        );
      } else {
        const left = MAX_ATTEMPTS - newAttempts;
        setPasswordError(
          `Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`,
        );
      }
      setPassword("");
    }
    setIsVerifying(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.07 0.015 280) 0%, oklch(0.11 0.018 270) 100%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.7 0.22 70) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.22 70) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, oklch(0.07 0.015 280) 100%)",
        }}
      />
      {/* Gold glow top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.7 0.22 70 / 0.12), transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "oklch(0.135 0.018 280 / 0.96)",
            backdropFilter: "blur(24px)",
            borderColor: "oklch(0.7 0.22 70 / 0.3)",
            boxShadow:
              "0 0 80px oklch(0.7 0.22 70 / 0.12), 0 32px 64px oklch(0.05 0.01 280 / 0.6), inset 0 1px 0 oklch(0.7 0.22 70 / 0.1)",
          }}
        >
          {/* Top gold accent bar */}
          <div
            className="h-0.5 w-full"
            style={{ background: "var(--gradient-gold)" }}
          />

          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
              className="flex justify-center mb-5"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-xl"
                style={{
                  background: "var(--gradient-gold)",
                  color: "oklch(0.1 0.02 280)",
                  boxShadow:
                    "0 0 32px oklch(0.7 0.22 70 / 0.5), 0 8px 24px rgba(0,0,0,0.6)",
                }}
              >
                RAP
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div
                className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: "oklch(0.22 0.025 280)",
                  color: "oklch(0.55 0.01 280)",
                  border: "1px solid oklch(0.3 0.02 280)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-3 h-3"
                  aria-hidden="true"
                >
                  <title>Shield</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
                Restricted Access
              </div>
              <h1
                className="text-2xl font-display font-bold mb-1"
                style={{
                  color: "oklch(0.7 0.22 70)",
                  textShadow: "0 0 24px oklch(0.7 0.22 70 / 0.4)",
                }}
              >
                Admin Portal
              </h1>
              <p className="text-xs text-muted-foreground">
                Authorised personnel only
              </p>
            </motion.div>
          </div>

          {/* Form body */}
          <div className="px-8 pb-8">
            <form
              onSubmit={(e) => void handlePasswordSubmit(e)}
              className="space-y-4"
              data-ocid="admin-login-form"
            >
              {/* Name field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-name"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/75"
                >
                  Your Name
                </Label>
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="Administrator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 text-sm"
                  style={{
                    color: "#000",
                    backgroundColor: "#fff",
                    WebkitTextFillColor: "#000",
                  }}
                  data-ocid="input-admin-name"
                  autoComplete="name"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-password"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/75"
                >
                  Admin Password
                </Label>
                <motion.div animate={shakeControls} className="relative">
                  <Input
                    id="admin-password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    disabled={isLocked}
                    className={[
                      "h-11 text-sm pr-10 transition-all duration-300",
                      passwordError ? "border-destructive" : "",
                    ].join(" ")}
                    style={{
                      color: "#000",
                      backgroundColor: "#fff",
                      WebkitTextFillColor: "#000",
                    }}
                    data-ocid="input-admin-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <title>Hide</title>
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
                        <title>Show</title>
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
                    )}
                  </button>
                </motion.div>

                <AnimatePresence>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-destructive flex items-center gap-1"
                      data-ocid="admin-password.field_error"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5 shrink-0"
                        aria-hidden="true"
                      >
                        <title>Warning</title>
                        <path
                          fillRule="evenodd"
                          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.999-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {!isLocked &&
                  remainingAttempts < MAX_ATTEMPTS &&
                  remainingAttempts > 0 &&
                  !passwordError && (
                    <p className="text-xs text-muted-foreground/60">
                      {remainingAttempts} attempt
                      {remainingAttempts === 1 ? "" : "s"} remaining
                    </p>
                  )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isVerifying || isLocked || !password}
                className="w-full h-11 font-semibold text-sm mt-2"
                style={
                  !isLocked
                    ? {
                        background: "var(--gradient-gold)",
                        color: "oklch(0.1 0.02 280)",
                        boxShadow: "0 4px 20px oklch(0.7 0.22 70 / 0.35)",
                      }
                    : undefined
                }
                data-ocid="btn-admin-submit"
              >
                {isVerifying ? (
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
                    Verifying…
                  </span>
                ) : isLocked ? (
                  "Account Locked"
                ) : (
                  <span className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <title>Lock</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    Access Admin Portal
                  </span>
                )}
              </Button>
            </form>

            {/* Security note */}
            <div
              className="mt-5 flex items-start gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: "oklch(0.18 0.02 280 / 0.5)",
                border: "1px solid oklch(0.3 0.02 280 / 0.4)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary"
                aria-hidden="true"
              >
                <title>Info</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This portal is exclusively for studio owners and administrators.
                Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-5"
        >
          <a
            href="/login"
            className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-3 h-3"
              aria-hidden="true"
            >
              <title>Back</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Return to Login
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
