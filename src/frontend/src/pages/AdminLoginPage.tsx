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
  const [passwordError, setPasswordError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const shakeControls = useAnimation();
  const passwordRef = useRef<HTMLInputElement>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const remainingAttempts = MAX_ATTEMPTS - attempts;

  // If admin is already logged in (valid session), skip straight to dashboard
  useEffect(() => {
    const session = getAdminSession();
    if (session?.loggedIn) {
      void navigate({ to: "/admin" });
    } else {
      // Focus the password field immediately for fast entry
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
      style={{ background: "oklch(0.09 0.015 280)" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.7 0.22 70) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.22 70) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, oklch(0.09 0.015 280) 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div
          className="rounded-2xl border shadow-elevated overflow-hidden"
          style={{
            background: "oklch(0.135 0.018 280 / 0.92)",
            backdropFilter: "blur(20px)",
            borderColor: "oklch(0.3 0.02 280 / 0.5)",
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
              className="flex justify-center mb-5"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl text-primary-foreground"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow:
                    "0 0 24px oklch(0.7 0.22 70 / 0.4), 0 6px 20px rgba(0,0,0,0.5)",
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
              <div className="section-label mb-2">Restricted Access</div>
              <h1
                className="text-2xl font-display font-bold text-glow-gold"
                style={{ color: "oklch(0.7 0.22 70)" }}
              >
                Admin Portal
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5">
                Authorised personnel only
              </p>
            </motion.div>
          </div>

          {/* Security badge */}
          <div className="mx-8 mb-6 flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 bg-card/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4 text-primary shrink-0"
              aria-hidden="true"
            >
              <title>Shield</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
            <span className="text-xs text-muted-foreground">
              Password-protected admin access
            </span>
          </div>

          {/* Body — direct password entry, no II required */}
          <div className="px-8 pb-8">
            <form
              onSubmit={(e) => void handlePasswordSubmit(e)}
              className="space-y-4"
              data-ocid="admin-login-form"
            >
              {/* Optional name customisation */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-name" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="Administrator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-card/40 border-border transition-all duration-300 focus:border-primary focus:shadow-[0_0_12px_oklch(0.7_0.22_70_/_0.2)]"
                  data-ocid="input-admin-name"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="text-sm font-medium">
                  Admin Password
                </Label>
                <motion.div animate={shakeControls}>
                  <Input
                    id="admin-password"
                    ref={passwordRef}
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    disabled={isLocked}
                    className={[
                      "bg-card/40 border-border transition-all duration-300",
                      "focus:border-primary focus:shadow-[0_0_12px_oklch(0.7_0.22_70_/_0.2)]",
                      passwordError ? "border-destructive" : "",
                    ].join(" ")}
                    data-ocid="input-admin-password"
                    autoComplete="current-password"
                  />
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

              <Button
                type="submit"
                disabled={isVerifying || isLocked || !password}
                className="w-full h-11 font-semibold"
                style={
                  !isLocked ? { background: "var(--gradient-gold)" } : undefined
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
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-5"
        >
          <a
            href="/login"
            className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200"
          >
            ← Return to Login
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
