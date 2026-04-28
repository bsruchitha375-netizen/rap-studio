import { UserRole, createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  getAdminSession,
  hashPassword,
  saveAdminSession,
  useAuth,
} from "@/hooks/useAuth";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "rapstudio2024";
const MAX_ATTEMPTS = 3;
const WARN_AFTER = 2; // show warning after this many failures
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// ── Lockout countdown hook ─────────────────────────────────────────────────────
function useLockoutCountdown(lockedUntil: number | null): string {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!lockedUntil) {
      setRemaining("");
      return;
    }
    const until = lockedUntil;
    function update() {
      const diff = until - Date.now();
      if (diff <= 0) {
        setRemaining("");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${secs.toString().padStart(2, "0")}`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);
  return remaining;
}

// ── Password strength ─────────────────────────────────────────────────────────
function getPasswordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
// Using semantic token-compatible colors
const STRENGTH_COLOR_STYLES: Record<number, React.CSSProperties> = {
  0: {},
  1: { background: "oklch(0.58 0.22 25)" },
  2: { background: "oklch(0.65 0.18 50)" },
  3: { background: "oklch(0.65 0.18 250)" },
  4: { background: "oklch(0.65 0.18 150)" },
};
const STRENGTH_TEXT_COLORS: Record<number, string> = {
  0: "",
  1: "oklch(0.58 0.22 25)",
  2: "oklch(0.65 0.18 50)",
  3: "oklch(0.65 0.18 250)",
  4: "oklch(0.65 0.18 150)",
};

const SpinnerIcon = () => (
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
);

// ── FieldError ────────────────────────────────────────────────────────────────
function FieldError({ msg, ocid }: { msg?: string; ocid?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="text-xs text-destructive flex items-center gap-1.5 pt-0.5"
          data-ocid={ocid}
          role="alert"
        >
          <AlertTriangle className="w-3 h-3 shrink-0" />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ── PasswordInput ─────────────────────────────────────────────────────────────
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  hasError,
  ocid,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  ocid?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder ?? "Password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="input-field pr-11"
        style={{
          borderColor: hasError ? "oklch(var(--destructive))" : undefined,
          opacity: disabled ? 0.5 : 1,
        }}
        data-ocid={ocid}
        autoComplete={autoComplete ?? "current-password"}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-lg hover:bg-muted/40"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── PasswordStrengthBar ───────────────────────────────────────────────────────
function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="space-y-1 mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={
              strength >= lvl
                ? STRENGTH_COLOR_STYLES[strength]
                : { background: "oklch(var(--muted))" }
            }
          />
        ))}
      </div>
      {strength > 0 && (
        <p
          className="text-[10px] text-muted-foreground"
          style={{ color: STRENGTH_TEXT_COLORS[strength] }}
        >
          {STRENGTH_LABELS[strength]} password
        </p>
      )}
    </div>
  );
}

// ── Gold divider ───────────────────────────────────────────────────────────────
function GoldDivider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-3 py-2">
      <div
        className="flex-1 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, oklch(var(--primary) / 0.4), transparent)",
        }}
      />
      <span
        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[2px] whitespace-nowrap border"
        style={{
          color: "oklch(var(--primary))",
          borderColor: "oklch(var(--primary) / 0.3)",
          background: "oklch(var(--primary) / 0.08)",
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, oklch(var(--primary) / 0.4), transparent)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SIGN-IN SECTION
// ─────────────────────────────────────────────────────────────────────────────
function AdminSignInSection() {
  const navigate = useNavigate();
  const { actor } = useActor(createActor);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const shakeControls = useAnimation();
  const passwordRef = useRef<HTMLInputElement>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const lockoutCountdown = useLockoutCountdown(isLocked ? lockedUntil : null);
  const remainingAttempts = MAX_ATTEMPTS - attempts;
  const showWarning = attempts >= WARN_AFTER && !isLocked;

  useEffect(() => {
    setTimeout(() => passwordRef.current?.focus(), 200);
  }, []);

  const shakeInput = async () => {
    await shakeControls.start({
      x: [0, -10, 10, -10, 10, -6, 6, -3, 3, 0],
      transition: { duration: 0.5 },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (isLocked) return;
    if (!password) {
      setPasswordError("Please enter the admin password.");
      return;
    }
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 400));

    if (password === ADMIN_PASSWORD) {
      saveAdminSession("Administrator", "+917338501228");
      // Bootstrap admin profile in the backend so all panels see real data
      if (actor) {
        try {
          const pwdHash = await hashPassword(ADMIN_PASSWORD);
          await actor
            .bootstrapAdminProfile(
              "Administrator",
              "admin@rapstudio.local",
              "+917338501228",
              pwdHash,
            )
            .catch(() => {}); // ignore if already exists
        } catch {
          // non-blocking: profile may already exist
        }
      }
      toast.success("Welcome back, Administrator!");
      void navigate({ to: "/admin" });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      await shakeInput();
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        setLockedUntil(until);
        setPasswordError("Too many failed attempts. Locked for 15 minutes.");
        toast.error(
          "Account locked for 15 minutes due to too many failed attempts.",
        );
      } else {
        const left = MAX_ATTEMPTS - newAttempts;
        setPasswordError(
          `Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining before lockout.`,
        );
        toast.error("Incorrect password.");
      }
      setPassword("");
    }
    setIsVerifying(false);
  };

  return (
    <div>
      {/* Admin header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 280 }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-display font-bold text-2xl shadow-glow-gold gradient-gold"
              style={{ color: "oklch(var(--primary-foreground))" }}
            >
              RAP
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center shadow-sm"
              style={{ background: "oklch(0.65 0.18 150)" }}
            >
              <ShieldCheck
                className="w-3.5 h-3.5"
                style={{ color: "oklch(1 0 0)" }}
              />
            </div>
          </div>
        </motion.div>
        <div
          className="inline-flex items-center gap-1.5 mb-2.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
          style={{
            background: "oklch(var(--muted))",
            color: "oklch(var(--muted-foreground))",
            borderColor: "oklch(var(--border))",
          }}
        >
          <Shield className="w-3 h-3 text-primary" />
          Restricted Access
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1 tracking-tight">
          Admin Portal
        </h1>
        <p className="text-xs text-muted-foreground">
          RAP Integrated Studio — Owner Access
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </div>

      {/* Warning banner — shown after WARN_AFTER attempts */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl border"
            style={{
              borderColor: "oklch(0.72 0.18 85 / 0.5)",
              background: "oklch(0.72 0.18 85 / 0.08)",
            }}
            data-ocid="admin-login.warning_banner"
          >
            <AlertTriangle
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: "oklch(0.72 0.18 85)" }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(0.72 0.18 85)" }}
              >
                Warning: Multiple Failed Attempts
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"}{" "}
                remaining before 15-minute lockout.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lockout banner */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl border border-destructive/40 bg-destructive/8"
            data-ocid="admin-login.lockout_banner"
          >
            <Lock className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Account Locked
              </p>
              {lockoutCountdown && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try again in{" "}
                  <span className="font-mono font-bold text-destructive">
                    {lockoutCountdown}
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4"
        data-ocid="admin-login.form"
        noValidate
      >
        <div className="space-y-1.5">
          <label
            htmlFor="admin-password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <Lock className="w-3 h-3" />
            Admin Password
          </label>
          <motion.div animate={shakeControls}>
            <PasswordInput
              id="admin-password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                if (passwordError) setPasswordError("");
              }}
              placeholder="Enter admin password"
              disabled={isLocked}
              hasError={!!(submitted && !password) || !!passwordError}
              ocid="admin-login.password.input"
            />
          </motion.div>
          <FieldError
            msg={
              passwordError ||
              (submitted && !password
                ? "Please enter the admin password."
                : undefined)
            }
            ocid="admin-login.password.field_error"
          />
          {!isLocked &&
            remainingAttempts < MAX_ATTEMPTS &&
            remainingAttempts > 0 &&
            !passwordError && (
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "oklch(0.72 0.18 85 / 0.8)" }}
                />
                {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"}{" "}
                remaining before lockout
              </p>
            )}
        </div>

        <Button
          type="submit"
          disabled={isVerifying || isLocked}
          className="w-full h-11 font-semibold text-sm flex items-center justify-center gap-2 transition-smooth"
          style={
            !isLocked
              ? {
                  background: "var(--gradient-gold)",
                  color: "oklch(var(--primary-foreground))",
                  boxShadow: "0 4px 24px oklch(var(--primary) / 0.35)",
                }
              : undefined
          }
          data-ocid="admin-login.submit_button"
        >
          {isVerifying ? (
            <>
              <SpinnerIcon /> Verifying…
            </>
          ) : isLocked ? (
            lockoutCountdown ? (
              `Locked — ${lockoutCountdown}`
            ) : (
              "Account Locked"
            )
          ) : (
            <>
              <Lock className="w-4 h-4" /> Access Admin Dashboard
            </>
          )}
        </Button>
      </form>

      <div
        className="mt-4 flex items-start gap-2.5 px-3 py-2.5 rounded-xl border"
        style={{
          background: "oklch(var(--muted) / 0.4)",
          borderColor: "oklch(var(--border) / 0.6)",
        }}
      >
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          This portal is exclusively for studio owners. Unauthorized access
          attempts are logged.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF & RECEPTIONIST — REGISTER TAB
// ─────────────────────────────────────────────────────────────────────────────
type StaffRole = "Staff" | "Receptionist";

interface RegForm {
  role: StaffRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  department: string;
}

function StaffRegisterTab() {
  const { register: doRegister, isActorReady } = useAuth();
  const [form, setForm] = useState<RegForm>({
    role: "Staff",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    department: "",
  });
  const [errors, setErrors] = useState<Partial<RegForm & { submit: string }>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const set = (key: keyof RegForm, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<RegForm & { submit: string }> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email is required.";
    if (
      !form.phone.trim() ||
      !/^\d{10}$/.test(form.phone?.replace(/\D/g, "") ?? "")
    )
      e.phone = "10-digit mobile number required.";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    if (!form.address.trim()) e.address = "Address is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isActorReady) {
      toast.error("Backend not ready. Please try again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await doRegister({
        email: form.email,
        name: form.name,
        phone: form.phone?.replace(/\D/g, "") ?? "",
        password: form.password,
        role: form.role.toLowerCase() as "staff" | "receptionist",
        address: form.address,
      });
      if (!result.success) {
        setErrors({ submit: result.error });
        toast.error(result.error);
      } else {
        setSuccessBanner(true);
        setForm({
          role: form.role,
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          address: "",
          department: "",
        });
        setErrors({});
        toast.success("Registration submitted! Awaiting admin approval.");
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ROLE_OPTIONS: {
    value: StaffRole;
    label: string;
    icon: React.ReactNode;
    desc: string;
    activeStyle: React.CSSProperties;
  }[] = [
    {
      value: "Receptionist",
      label: "Receptionist",
      icon: <Users className="w-4 h-4" />,
      desc: "Manage bookings & client coordination",
      activeStyle: {
        borderColor: "oklch(var(--accent) / 0.6)",
        background: "oklch(var(--accent) / 0.12)",
        color: "oklch(var(--accent))",
      },
    },
    {
      value: "Staff",
      label: "Staff",
      icon: <Briefcase className="w-4 h-4" />,
      desc: "Photography, videography & production",
      activeStyle: {
        borderColor: "oklch(var(--primary) / 0.6)",
        background: "oklch(var(--primary) / 0.12)",
        color: "oklch(var(--primary))",
      },
    },
  ];

  return (
    <div>
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2.5 px-4 py-3.5 rounded-xl border"
            style={{
              borderColor: "oklch(0.72 0.18 85 / 0.5)",
              background: "oklch(0.72 0.18 85 / 0.1)",
            }}
            data-ocid="staff-register.success_state"
          >
            <CheckCircle2
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: "oklch(0.72 0.18 85)" }}
            />
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.72 0.18 85)" }}
              >
                Registration Submitted!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your account is awaiting admin approval. You will receive access
                once approved.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(false)}
              className="ml-auto text-muted-foreground hover:text-foreground text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4"
        data-ocid="staff-register.form"
        noValidate
      >
        {/* Role selector */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Role
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("role", opt.value)}
                className="flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-smooth"
                style={
                  form.role === opt.value
                    ? opt.activeStyle
                    : {
                        borderColor: "oklch(var(--border))",
                        background: "oklch(var(--muted) / 0.2)",
                        color: "oklch(var(--muted-foreground))",
                      }
                }
                data-ocid={`staff-register.role.${opt.value.toLowerCase()}`}
              >
                {opt.icon}
                <span className="text-xs font-bold">{opt.label}</span>
                <span className="text-[10px] opacity-80 leading-tight">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="reg-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Full Name *
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="input-field"
              data-ocid="staff-register.name.input"
            />
            <FieldError
              msg={errors.name}
              ocid="staff-register.name.field_error"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="reg-email"
              className="text-xs font-medium text-muted-foreground"
            >
              Email ID *
            </label>
            <input
              id="reg-email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="input-field"
              data-ocid="staff-register.email.input"
              autoComplete="email"
            />
            <FieldError
              msg={errors.email}
              ocid="staff-register.email.field_error"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="reg-phone"
              className="text-xs font-medium text-muted-foreground"
            >
              Mobile Number *
            </label>
            <input
              id="reg-phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="input-field"
              data-ocid="staff-register.phone.input"
            />
            <FieldError
              msg={errors.phone}
              ocid="staff-register.phone.field_error"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="reg-password"
              className="text-xs font-medium text-muted-foreground"
            >
              Password *
            </label>
            <PasswordInput
              id="reg-password"
              value={form.password}
              onChange={(v) => set("password", v)}
              placeholder="Create a strong password"
              hasError={!!errors.password}
              ocid="staff-register.password.input"
              autoComplete="new-password"
            />
            <PasswordStrengthBar password={form.password} />
            <FieldError
              msg={errors.password}
              ocid="staff-register.password.field_error"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="reg-confirm"
              className="text-xs font-medium text-muted-foreground"
            >
              Confirm Password *
            </label>
            <PasswordInput
              id="reg-confirm"
              value={form.confirmPassword}
              onChange={(v) => set("confirmPassword", v)}
              placeholder="Re-enter password"
              hasError={!!errors.confirmPassword}
              ocid="staff-register.confirm_password.input"
              autoComplete="new-password"
            />
            <FieldError
              msg={errors.confirmPassword}
              ocid="staff-register.confirm_password.field_error"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="reg-address"
              className="text-xs font-medium text-muted-foreground"
            >
              Address *
            </label>
            <input
              id="reg-address"
              type="text"
              placeholder="Your current address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="input-field"
              data-ocid="staff-register.address.input"
            />
            <FieldError
              msg={errors.address}
              ocid="staff-register.address.field_error"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="reg-dept"
              className="text-xs font-medium text-muted-foreground"
            >
              Department / Role Description
              <span className="ml-1 text-[10px] opacity-60">(optional)</span>
            </label>
            <input
              id="reg-dept"
              type="text"
              placeholder="e.g. Photography, Video Editing…"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              className="input-field"
              data-ocid="staff-register.department.input"
            />
          </div>
        </div>

        <FieldError
          msg={errors.submit}
          ocid="staff-register.submit.field_error"
        />

        <Button
          type="submit"
          disabled={isSubmitting || !isActorReady}
          className="w-full h-11 font-semibold text-sm"
          style={{
            background:
              form.role === "Receptionist"
                ? "linear-gradient(135deg, oklch(var(--accent)), oklch(var(--accent) / 0.75))"
                : "var(--gradient-gold)",
            color:
              form.role === "Receptionist"
                ? "oklch(var(--accent-foreground))"
                : "oklch(var(--primary-foreground))",
          }}
          data-ocid="staff-register.submit_button"
        >
          {isSubmitting ? (
            <>
              <SpinnerIcon /> Submitting…
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4" /> Register as {form.role}
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-muted-foreground">
          Registration requires admin approval before you can sign in.
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF & RECEPTIONIST — SIGN IN TAB
// ─────────────────────────────────────────────────────────────────────────────
function StaffSignInTab() {
  const navigate = useNavigate();
  const { login, isActorReady } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingBanner, setPendingBanner] = useState(false);
  const [rejectedBanner, setRejectedBanner] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    submit?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!identifier.trim())
      e.identifier = "Email or mobile number is required.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setPendingBanner(false);
    setRejectedBanner(false);
    if (!validate()) return;
    if (!isActorReady) {
      toast.error("Backend not ready. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (result.success) {
        const sessionRaw = localStorage.getItem("rap_session");
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw) as { role: string };
          const redirects: Record<string, string> = {
            staff: "/dashboard/staff",
            receptionist: "/dashboard/receptionist",
            client: "/dashboard/client",
            student: "/dashboard/student",
          };
          const dest = redirects[session.role] ?? "/dashboard";
          toast.success("Welcome back!");
          void navigate({ to: dest as "/" });
        }
      } else if (result.isPendingApproval) {
        setPendingBanner(true);
      } else if (
        result.error?.toLowerCase().includes("suspended") ||
        result.error?.toLowerCase().includes("denied")
      ) {
        setRejectedBanner(true);
      } else {
        setErrors({
          submit: result.error ?? "Login failed. Please try again.",
        });
        toast.error(result.error ?? "Login failed.");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AnimatePresence>
        {pendingBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2.5 px-4 py-3.5 rounded-xl border"
            style={{
              borderColor: "oklch(0.72 0.18 85 / 0.5)",
              background: "oklch(0.72 0.18 85 / 0.1)",
            }}
            data-ocid="staff-signin.pending_state"
          >
            <AlertTriangle
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: "oklch(0.72 0.18 85)" }}
            />
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.72 0.18 85)" }}
              >
                Awaiting Admin Approval
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your account is pending approval. Contact admin at{" "}
                <a
                  href="mailto:ruchithabs550@gmail.com"
                  className="underline text-primary"
                >
                  ruchithabs550@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        )}
        {rejectedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2.5 px-4 py-3.5 rounded-xl border border-destructive/50 bg-destructive/10"
            data-ocid="staff-signin.error_state"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-bold text-destructive">
                Access Denied
              </p>
              <p className="text-xs text-destructive/80 mt-0.5">
                Your registration was rejected. Contact admin at{" "}
                <a href="mailto:ruchithabs550@gmail.com" className="underline">
                  ruchithabs550@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4"
        data-ocid="staff-signin.form"
        noValidate
      >
        <div className="space-y-1.5">
          <label
            htmlFor="staff-identifier"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email or Mobile Number
          </label>
          <input
            id="staff-identifier"
            type="text"
            placeholder="Email address or mobile number"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier)
                setErrors((p) => ({ ...p, identifier: undefined }));
            }}
            className="input-field"
            data-ocid="staff-signin.identifier.input"
            autoComplete="username"
          />
          <FieldError
            msg={submitted ? errors.identifier : undefined}
            ocid="staff-signin.identifier.field_error"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="staff-password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Password
          </label>
          <PasswordInput
            id="staff-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password)
                setErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="Your password"
            hasError={!!(submitted && errors.password)}
            ocid="staff-signin.password.input"
          />
          <FieldError
            msg={submitted ? errors.password : undefined}
            ocid="staff-signin.password.field_error"
          />
        </div>

        <FieldError
          msg={errors.submit}
          ocid="staff-signin.submit.field_error"
        />

        <Button
          type="submit"
          disabled={isLoading || !isActorReady}
          className="w-full h-11 font-semibold text-sm flex items-center justify-center gap-2"
          style={{
            background: "var(--gradient-gold)",
            color: "oklch(var(--primary-foreground))",
          }}
          data-ocid="staff-signin.submit_button"
        >
          {isLoading ? (
            <>
              <SpinnerIcon /> Signing in…
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4" /> Sign In
            </>
          )}
        </Button>

        <div className="flex flex-wrap gap-2 justify-center pt-1">
          <span
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-2.5 py-1 rounded-full border"
            style={{
              borderColor: "oklch(var(--border) / 0.5)",
              background: "oklch(var(--muted) / 0.2)",
            }}
          >
            <Building2 className="w-3 h-3 text-accent" />
            Receptionist
          </span>
          <span
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-2.5 py-1 rounded-full border"
            style={{
              borderColor: "oklch(var(--border) / 0.5)",
              background: "oklch(var(--muted) / 0.2)",
            }}
          >
            <Briefcase className="w-3 h-3 text-primary" />
            Staff
          </span>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF/RECEPTIONIST PORTAL SECTION
// ─────────────────────────────────────────────────────────────────────────────
function StaffPortalSection() {
  const [activeTab, setActiveTab] = useState<"register" | "signin">("signin");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg border flex items-center justify-center"
          style={{
            background: "oklch(var(--accent) / 0.15)",
            borderColor: "oklch(var(--accent) / 0.3)",
          }}
        >
          <Users className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-display font-bold text-foreground">
            Staff &amp; Receptionist Portal
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Registration requires admin approval
          </p>
        </div>
      </div>

      <div
        className="flex rounded-xl border p-1 mb-5 gap-1"
        style={{
          background: "oklch(var(--muted) / 0.2)",
          borderColor: "oklch(var(--border))",
        }}
        data-ocid="staff-portal.tab"
      >
        {(["signin", "register"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-smooth capitalize"
            style={
              activeTab === tab
                ? {
                    background: "oklch(var(--card))",
                    color: "oklch(var(--foreground))",
                    border: "1px solid oklch(var(--border) / 0.6)",
                  }
                : { color: "oklch(var(--muted-foreground))" }
            }
            data-ocid={`staff-portal.${tab}.tab`}
          >
            {tab === "signin" ? "Sign In" : "New Registration"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "signin" ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === "signin" ? 12 : -12 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        >
          {activeTab === "register" ? <StaffRegisterTab /> : <StaffSignInTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECT ADD USER SECTION
// ─────────────────────────────────────────────────────────────────────────────
type DirectRole = "client" | "student" | "receptionist" | "staff";

interface DirectAddForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: DirectRole;
  address: string;
}

function DirectAddUserSection() {
  const { actor } = useActor(createActor);
  const [form, setForm] = useState<DirectAddForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
    address: "",
  });
  const [errors, setErrors] = useState<
    Partial<DirectAddForm & { submit: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const set = (key: keyof DirectAddForm, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const ROLE_MAP: Record<DirectRole, UserRole> = {
    client: UserRole.Client,
    student: UserRole.Student,
    receptionist: UserRole.Receptionist,
    staff: UserRole.Staff,
  };

  const validate = (): boolean => {
    const e: Partial<DirectAddForm & { submit: string }> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
      e.phone = "10-digit mobile required";
    if (!form.password || form.password.length < 6)
      e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!actor) {
      toast.error("Backend not ready. Please try again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const pwdHash = await hashPassword(form.password);
      const phone = `+91${form.phone.replace(/\D/g, "").slice(-10)}`;
      const result = await actor.adminCreateUser(
        form.email.trim().toLowerCase(),
        form.name.trim(),
        phone,
        pwdHash,
        ROLE_MAP[form.role],
        form.address.trim() || null,
        null,
      );
      if (result.__kind__ === "err") {
        toast.error(String(result.err) || "Failed to create user.");
      } else {
        toast.success(
          `${form.role.charAt(0).toUpperCase() + form.role.slice(1)} account created successfully!`,
        );
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "client",
          address: "",
        });
        setErrors({});
        setIsOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create user.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const ROLE_OPTIONS: { value: DirectRole; label: string; color: string }[] = [
    { value: "client", label: "Client", color: "oklch(var(--primary))" },
    { value: "student", label: "Student", color: "oklch(var(--accent))" },
    {
      value: "receptionist",
      label: "Receptionist",
      color: "oklch(0.66 0.18 180)",
    },
    { value: "staff", label: "Staff", color: "oklch(0.65 0.18 250)" },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300"
        style={{
          background: isOpen
            ? "oklch(var(--primary) / 0.1)"
            : "oklch(var(--muted) / 0.3)",
          borderColor: isOpen
            ? "oklch(var(--primary) / 0.5)"
            : "oklch(var(--border) / 0.5)",
          color: isOpen
            ? "oklch(var(--primary))"
            : "oklch(var(--muted-foreground))",
        }}
        data-ocid="admin-direct-add.toggle"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <Users className="w-4 h-4" />
          Add User Directly
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
            style={{
              background: "oklch(var(--primary) / 0.2)",
              color: "oklch(var(--primary))",
            }}
          >
            Admin Only
          </span>
        </span>
        <ChevronRight
          className="w-4 h-4 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-xl p-4 border space-y-3"
              style={{
                background: "oklch(var(--card) / 0.6)",
                borderColor: "oklch(var(--primary) / 0.25)",
              }}
            >
              <p className="text-xs text-muted-foreground font-medium">
                Create an account directly — no registration flow, immediately
                active.
              </p>

              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-3"
                data-ocid="admin-direct-add.form"
                noValidate
              >
                {/* Role */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Role
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ROLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set("role", opt.value)}
                        className="py-1.5 px-2 rounded-lg border text-xs font-bold transition-all duration-200"
                        style={
                          form.role === opt.value
                            ? {
                                background: `${opt.color}20`,
                                borderColor: `${opt.color}60`,
                                color: opt.color,
                              }
                            : {
                                background: "oklch(var(--muted) / 0.3)",
                                borderColor: "oklch(var(--border) / 0.5)",
                                color: "oklch(var(--muted-foreground))",
                              }
                        }
                        data-ocid={`admin-direct-add.role.${opt.value}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="direct-add-name"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Full Name *
                  </label>
                  <input
                    id="direct-add-name"
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="input-field text-sm"
                    data-ocid="admin-direct-add.name.input"
                    style={{
                      borderColor: errors.name
                        ? "oklch(var(--destructive))"
                        : undefined,
                    }}
                  />
                  <FieldError
                    msg={errors.name}
                    ocid="admin-direct-add.name.field_error"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="direct-add-email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Email *
                  </label>
                  <input
                    id="direct-add-email"
                    type="email"
                    placeholder="user@email.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="input-field text-sm"
                    data-ocid="admin-direct-add.email.input"
                    style={{
                      borderColor: errors.email
                        ? "oklch(var(--destructive))"
                        : undefined,
                    }}
                    autoComplete="off"
                  />
                  <FieldError
                    msg={errors.email}
                    ocid="admin-direct-add.email.field_error"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label
                    htmlFor="direct-add-phone"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="direct-add-phone"
                    type="tel"
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) =>
                      set(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="input-field text-sm"
                    data-ocid="admin-direct-add.phone.input"
                    style={{
                      borderColor: errors.phone
                        ? "oklch(var(--destructive))"
                        : undefined,
                    }}
                  />
                  <FieldError
                    msg={errors.phone}
                    ocid="admin-direct-add.phone.field_error"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="direct-add-password"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Password *
                  </label>
                  <PasswordInput
                    id="direct-add-password"
                    value={form.password}
                    onChange={(v) => set("password", v)}
                    placeholder="Min 6 characters"
                    hasError={!!errors.password}
                    ocid="admin-direct-add.password.input"
                    autoComplete="new-password"
                  />
                  <FieldError
                    msg={errors.password}
                    ocid="admin-direct-add.password.field_error"
                  />
                </div>

                {/* Address (optional) */}
                <div className="space-y-1">
                  <label
                    htmlFor="direct-add-address"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Address <span className="opacity-50">(optional)</span>
                  </label>
                  <input
                    id="direct-add-address"
                    type="text"
                    placeholder="User's address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    className="input-field text-sm"
                    data-ocid="admin-direct-add.address.input"
                  />
                </div>

                <FieldError
                  msg={errors.submit}
                  ocid="admin-direct-add.submit.field_error"
                />

                <Button
                  type="submit"
                  disabled={isSubmitting || !actor}
                  className="w-full h-10 text-sm font-bold"
                  style={{
                    background: "var(--gradient-gold)",
                    color: "oklch(var(--primary-foreground))",
                  }}
                  data-ocid="admin-direct-add.submit_button"
                >
                  {isSubmitting ? (
                    <>
                      <SpinnerIcon /> Creating…
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Create Account Directly
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function AdminLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getAdminSession();
    if (session?.loggedIn) {
      void navigate({ to: "/admin" });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-8">
      {/* Bokeh orbs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="bokeh-orb bokeh-orb-1" style={{ opacity: 0.13 }} />
        <div className="bokeh-orb bokeh-orb-2" style={{ opacity: 0.1 }} />
        <div className="bokeh-orb bokeh-orb-3" style={{ opacity: 0.07 }} />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(oklch(var(--border)) 1px, transparent 1px), linear-gradient(90deg, oklch(var(--border)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="rounded-2xl glass-effect shadow-luxury luxury-border overflow-hidden">
          <div className="h-1 w-full gradient-gold" />
          <div className="px-7 pt-7 pb-7 space-y-0">
            <AdminSignInSection />
            <div className="py-5">
              <GoldDivider label="Staff &amp; Receptionist Portal" />
            </div>
            <StaffPortalSection />
            <div className="py-5">
              <GoldDivider label="Admin: Direct Add User" />
            </div>
            <DirectAddUserSection />
          </div>
        </div>

        {/* Back links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-5 flex items-center justify-center gap-4"
        >
          <a
            href="/login"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 flex items-center gap-1.5"
            data-ocid="admin-login.back_link"
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
            Return to main login
          </a>
          <span className="text-muted-foreground/30 text-xs">·</span>
          <a
            href="/"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3" />
            View website
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
