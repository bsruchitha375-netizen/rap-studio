import { useAuth } from "@/hooks/useAuth";
import type { RegisterInput } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// Only Client and Student can self-register on /login
type RegisterRole = "client" | "student";

interface RegistrationFormProps {
  /** Called on successful client registration (switches to sign-in tab) */
  onClientSuccess: (email: string) => void;
}

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

function getPasswordStrength(pwd: string): StrengthLevel {
  if (!pwd) return "empty";
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score === 3) return "good";
  return "strong";
}

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  empty: "",
  weak: "Weak — add uppercase & numbers",
  fair: "Fair — add symbols for stronger",
  good: "Good — almost there",
  strong: "Strong password ✓",
};

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  empty: "oklch(var(--muted-foreground) / 0.3)",
  weak: "oklch(0.58 0.22 25)",
  fair: "oklch(0.72 0.18 85)",
  good: "oklch(0.65 0.18 250)",
  strong: "oklch(0.65 0.18 150)",
};

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
  );

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const INPUT_CLASS = "input-field w-full";
const INPUT_WITH_ICON: React.CSSProperties = { paddingLeft: "2.6rem" };

// Only two public registration roles
const ROLE_OPTIONS: {
  role: RegisterRole;
  label: string;
  icon: string;
  colorVar: "primary" | "accent";
  desc: string;
}[] = [
  {
    role: "client",
    label: "Client",
    icon: "📸",
    colorVar: "primary",
    desc: "Book photography & film sessions",
  },
  {
    role: "student",
    label: "Student",
    icon: "🎓",
    colorVar: "accent",
    desc: "Enrol in courses & earn certificates",
  },
];

export function RegistrationForm({ onClientSuccess }: RegistrationFormProps) {
  const { register, loading: authLoading, isActorReady } = useAuth();

  const [selectedRole, setSelectedRole] = useState<RegisterRole>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [photoBytes, setPhotoBytes] = useState<Uint8Array | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [shakeForm, setShakeForm] = useState(false);
  const [pendingBanner, setPendingBanner] = useState<string | null>(null);

  const [courseType, setCourseType] = useState<"Online" | "Offline" | "Hybrid">(
    "Online",
  );
  const [sessionSlot, setSessionSlot] = useState<"Saturday" | "Sunday">(
    "Saturday",
  );
  const [learningMode, setLearningMode] = useState<
    "Self-paced" | "Instructor-led" | "Blended"
  >("Self-paced");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const strength = getPasswordStrength(password);
  const strengthLevels: StrengthLevel[] = ["weak", "fair", "good", "strong"];

  const getErrorBorder = (hasError: boolean): React.CSSProperties =>
    hasError ? { border: "1.5px solid oklch(var(--destructive))" } : {};

  const validate = useCallback((): FormErrors => {
    const e: FormErrors = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = "Enter your full name (at least 2 characters)";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Enter a valid email address — this will be your login ID";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) e.phone = "Enter a valid 10-digit mobile number";
    if (!password || password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  }, [name, email, phone, password, confirmPassword]);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    const arrayReader = new FileReader();
    arrayReader.onload = (ev) => {
      if (ev.target?.result instanceof ArrayBuffer)
        setPhotoBytes(new Uint8Array(ev.target.result));
    };
    arrayReader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setAddress("");
    setPhotoBytes(null);
    setPhotoPreview(null);
    setCourseType("Online");
    setSessionSlot("Saturday");
    setLearningMode("Self-paced");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingBanner(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 600);
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const formattedPhone = `+91${phone.replace(/\D/g, "").slice(-10)}`;
    const input: RegisterInput = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: formattedPhone,
      password,
      role: selectedRole,
      address: address.trim() || undefined,
      profilePhotoBytes: photoBytes,
      studentDetails:
        selectedRole === "student"
          ? { courseType, preferredSlot: sessionSlot, learningMode }
          : null,
    };

    const result = await register(input);
    setIsSubmitting(false);

    if (result.success) {
      if (result.isPending) {
        // Student / Staff / Receptionist → show correct post-registration pending message
        resetForm();
        setPendingBanner(
          "Account created! Your account is awaiting admin approval. You will be notified once your account is reviewed and approved.",
        );
      } else {
        // Client → instant access, switch to sign-in
        toast.success("Welcome! Your account is ready. You can now sign in.");
        onClientSuccess(email.trim().toLowerCase());
      }
    } else {
      const errMsg = result.error || "Registration failed. Please try again.";
      if (
        errMsg.toLowerCase().includes("already") ||
        errMsg.toLowerCase().includes("exists")
      ) {
        toast.error(
          "An account with this email already exists. Please sign in instead.",
        );
      } else {
        toast.error(errMsg);
      }
    }
  };

  const isDisabled = isSubmitting || authLoading;

  return (
    <motion.form
      onSubmit={(e) => void handleSubmit(e)}
      animate={shakeForm ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
      data-ocid="registration-form"
      noValidate
    >
      {/* Pending approval banner */}
      <AnimatePresence>
        {pendingBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-xl p-4 flex items-start gap-3 border"
            style={{
              background: "oklch(var(--accent) / 0.08)",
              borderColor: "oklch(var(--accent) / 0.45)",
            }}
            aria-live="polite"
            data-ocid="register.pending_banner"
          >
            <span className="text-xl shrink-0 mt-0.5">✅</span>
            <div>
              <p
                className="font-bold text-sm mb-1"
                style={{ color: "oklch(var(--accent))" }}
              >
                Account Created — Awaiting Approval
              </p>
              <p className="text-xs leading-relaxed text-foreground/80">
                {pendingBanner}
              </p>
              <p className="text-xs mt-2 font-medium text-muted-foreground">
                Once approved, you can sign in using the{" "}
                <strong className="text-foreground">Already Registered</strong>{" "}
                panel.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Selector — Client and Student ONLY */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          I am registering as a
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {ROLE_OPTIONS.map((opt) => {
            const isSelected = selectedRole === opt.role;
            return (
              <button
                key={opt.role}
                type="button"
                onClick={() => {
                  setSelectedRole(opt.role);
                  setPendingBanner(null);
                }}
                data-ocid={`register.role.${opt.role}`}
                aria-pressed={isSelected}
                className="flex flex-col items-center gap-2 px-3 py-4 text-sm font-semibold rounded-xl border transition-all duration-200 text-center"
                style={
                  isSelected
                    ? {
                        background: `oklch(var(--${opt.colorVar}) / 0.15)`,
                        borderColor: `oklch(var(--${opt.colorVar}) / 0.7)`,
                        color: `oklch(var(--${opt.colorVar}))`,
                        boxShadow: `0 0 20px oklch(var(--${opt.colorVar}) / 0.18)`,
                      }
                    : {
                        background: "oklch(var(--muted) / 0.4)",
                        borderColor: "oklch(var(--border) / 0.5)",
                        color: "oklch(var(--muted-foreground))",
                      }
                }
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="block font-bold text-sm leading-tight">
                  {opt.label}
                </span>
                <span className="block text-[11px] font-normal opacity-70 leading-tight">
                  {opt.desc}
                </span>
                {isSelected && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: `oklch(var(--${opt.colorVar}))` }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-2.5 h-2.5"
                      aria-hidden="true"
                    >
                      <title>Selected</title>
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Student info note — brief info only, NOT the approval message */}
        <AnimatePresence>
          {selectedRole === "student" && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[11px] mt-2 rounded-lg px-3 py-2 flex items-center gap-1.5"
              style={{
                background: "oklch(var(--accent) / 0.06)",
                color: "oklch(var(--accent))",
                border: "1px solid oklch(var(--accent) / 0.2)",
              }}
            >
              <span>🎓</span>
              <span>
                <strong>Student</strong> — enrol in courses, earn certificates
                &amp; track your progress.
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Full Name */}
      <div className="space-y-1">
        <label
          htmlFor="reg-name"
          className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Full Name <span className="text-destructive">*</span>
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
              <title>User</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </span>
          <input
            id="reg-name"
            type="text"
            placeholder="e.g. Ruchitha B S"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            className={INPUT_CLASS}
            style={{ ...INPUT_WITH_ICON, ...getErrorBorder(!!errors.name) }}
            autoComplete="name"
            data-ocid="register.name.input"
          />
        </div>
        {errors.name && (
          <p
            className="text-xs flex items-center gap-1 text-destructive"
            role="alert"
            data-ocid="register.name.field_error"
          >
            ⚠ {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label
          htmlFor="reg-email"
          className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Email Address <span className="text-destructive">*</span>{" "}
          <span className="text-xs font-normal normal-case text-primary">
            (your login ID)
          </span>
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
              <title>Email</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </span>
          <input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            className={INPUT_CLASS}
            style={{ ...INPUT_WITH_ICON, ...getErrorBorder(!!errors.email) }}
            autoComplete="email"
            data-ocid="register.email.input"
          />
        </div>
        {errors.email && (
          <p
            className="text-xs flex items-center gap-1 text-destructive"
            role="alert"
            data-ocid="register.email.field_error"
          >
            ⚠ {errors.email}
          </p>
        )}
      </div>

      {/* Mobile */}
      <div className="space-y-1">
        <label
          htmlFor="reg-phone"
          className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Mobile Number <span className="text-destructive">*</span>
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
              <title>Phone</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 15h3"
              />
            </svg>
          </span>
          <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-semibold select-none z-10 pointer-events-none text-muted-foreground">
            +91
          </span>
          <input
            id="reg-phone"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
              if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
            }}
            className={INPUT_CLASS}
            style={{
              paddingLeft: "3.75rem",
              ...getErrorBorder(!!errors.phone),
            }}
            autoComplete="tel"
            data-ocid="register.phone.input"
          />
        </div>
        {errors.phone && (
          <p
            className="text-xs flex items-center gap-1 text-destructive"
            role="alert"
            data-ocid="register.phone.field_error"
          >
            ⚠ {errors.phone}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label
          htmlFor="reg-password"
          className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Password <span className="text-destructive">*</span>
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
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((p) => ({ ...p, password: undefined }));
            }}
            className={INPUT_CLASS}
            style={{
              ...INPUT_WITH_ICON,
              paddingRight: "2.75rem",
              ...getErrorBorder(!!errors.password),
            }}
            autoComplete="new-password"
            data-ocid="register.password.input"
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
        {password && (
          <div>
            <div className="flex gap-1 mt-1">
              {strengthLevels.map((level, i) => {
                const currentIdx = strengthLevels.indexOf(
                  strength as (typeof strengthLevels)[number],
                );
                return (
                  <div
                    key={level}
                    className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      background:
                        i <= currentIdx
                          ? STRENGTH_COLORS[strength]
                          : "oklch(var(--muted))",
                    }}
                  />
                );
              })}
            </div>
            <p
              className="text-xs mt-1 font-medium"
              style={{ color: STRENGTH_COLORS[strength] }}
            >
              {STRENGTH_LABELS[strength]}
            </p>
          </div>
        )}
        {errors.password && (
          <p
            className="text-xs flex items-center gap-1 text-destructive"
            role="alert"
            data-ocid="register.password.field_error"
          >
            ⚠ {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label
          htmlFor="reg-confirm"
          className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Confirm Password <span className="text-destructive">*</span>
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
              <title>Confirm</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </span>
          <input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            className={INPUT_CLASS}
            style={{
              ...INPUT_WITH_ICON,
              paddingRight: "4.5rem",
              ...getErrorBorder(!!errors.confirmPassword),
            }}
            autoComplete="new-password"
            data-ocid="register.confirm_password.input"
          />
          {confirmPassword && password && (
            <span
              className="absolute right-9 top-1/2 -translate-y-1/2 text-sm"
              aria-hidden="true"
            >
              {confirmPassword === password ? "✅" : "❌"}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-opacity hover:opacity-80 text-muted-foreground"
            aria-label={showConfirm ? "Hide" : "Show"}
          >
            <EyeIcon show={showConfirm} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            className="text-xs flex items-center gap-1 text-destructive"
            role="alert"
            data-ocid="register.confirm_password.field_error"
          >
            ⚠ {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Address (optional) */}
      <div className="space-y-1">
        <label
          htmlFor="reg-address"
          className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Address{" "}
          <span className="font-normal normal-case text-muted-foreground/60">
            (optional)
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3.5 pointer-events-none z-10 text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4"
              aria-hidden="true"
            >
              <title>Address</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          </span>
          <textarea
            id="reg-address"
            placeholder="Your full address"
            value={address}
            rows={2}
            onChange={(e) => setAddress(e.target.value)}
            className={INPUT_CLASS}
            style={{
              paddingLeft: "2.6rem",
              paddingTop: "0.6rem",
              paddingBottom: "0.6rem",
              resize: "none",
              minHeight: "3.5rem",
            }}
            data-ocid="register.address.textarea"
          />
        </div>
      </div>

      {/* Profile Photo */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Profile Photo{" "}
          <span className="font-normal normal-case">(optional)</span>
        </p>
        <button
          type="button"
          className="w-full relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-300"
          style={{
            borderColor: isDragging
              ? "oklch(var(--primary))"
              : "oklch(var(--border))",
            background: isDragging
              ? "oklch(var(--primary) / 0.05)"
              : "oklch(var(--muted) / 0.4)",
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          data-ocid="register.photo.dropzone"
          aria-label="Upload profile photo"
        >
          {photoPreview ? (
            <div className="flex items-center justify-center gap-3">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/50"
              />
              <div className="text-left">
                <p className="text-xs font-medium text-foreground">
                  Photo selected ✓
                </p>
                <p className="text-xs text-muted-foreground">Click to change</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xl mb-0.5">📸</div>
              <p className="text-xs text-muted-foreground">
                Drag & drop or{" "}
                <span className="text-primary">click to browse</span>
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePhotoFile(f);
            }}
            data-ocid="register.photo.upload_button"
          />
        </button>
      </div>

      {/* Student-specific fields */}
      <AnimatePresence>
        {selectedRole === "student" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-accent/30 bg-muted/30 p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-accent">
                <span>🎓</span> Student Course Options
              </p>
              {/* Course Type */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  Course Type <span className="text-destructive">*</span>
                </p>
                <div className="flex gap-2">
                  {(["Online", "Offline", "Hybrid"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCourseType(type)}
                      data-ocid={`register.course_type.${type.toLowerCase()}`}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200"
                      style={
                        courseType === type
                          ? {
                              background: "oklch(var(--accent) / 0.2)",
                              borderColor: "oklch(var(--accent) / 0.6)",
                              color: "oklch(var(--accent-foreground))",
                            }
                          : {
                              background: "transparent",
                              borderColor: "oklch(var(--border) / 0.5)",
                              color: "oklch(var(--muted-foreground))",
                            }
                      }
                    >
                      {type === "Online"
                        ? "💻"
                        : type === "Offline"
                          ? "🏫"
                          : "🔀"}{" "}
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {/* Preferred Session */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  Preferred Practical Session{" "}
                  <span className="text-destructive">*</span>
                </p>
                <div className="flex gap-2">
                  {(["Saturday", "Sunday"] as const).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSessionSlot(day)}
                      data-ocid={`register.session_slot.${day.toLowerCase()}`}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200"
                      style={
                        sessionSlot === day
                          ? {
                              background: "oklch(var(--accent) / 0.2)",
                              borderColor: "oklch(var(--accent) / 0.6)",
                              color: "oklch(var(--accent-foreground))",
                            }
                          : {
                              background: "transparent",
                              borderColor: "oklch(var(--border) / 0.5)",
                              color: "oklch(var(--muted-foreground))",
                            }
                      }
                    >
                      📅 {day}
                    </button>
                  ))}
                </div>
              </div>
              {/* Learning Mode */}
              <div>
                <label
                  htmlFor="learning-mode"
                  className="text-xs font-semibold text-muted-foreground mb-1 block"
                >
                  Learning Mode <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    id="learning-mode"
                    value={learningMode}
                    onChange={(e) =>
                      setLearningMode(e.target.value as typeof learningMode)
                    }
                    className={INPUT_CLASS}
                    style={{
                      paddingLeft: "0.75rem",
                      appearance: "none",
                      cursor: "pointer",
                    }}
                    data-ocid="register.learning_mode.select"
                  >
                    <option value="Self-paced">Self-paced</option>
                    <option value="Instructor-led">Instructor-led</option>
                    <option value="Blended">Blended</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-muted-foreground">
                    ▼
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backend warmup */}
      {!isActorReady && (
        <p className="text-xs text-center flex items-center justify-center gap-1.5 text-primary/70">
          <svg
            className="animate-spin w-3 h-3 shrink-0"
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
          Warming up connection…
        </p>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isDisabled}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1 transition-all duration-300"
        style={{
          background: isDisabled
            ? "oklch(var(--muted))"
            : "var(--gradient-gold)",
          color: isDisabled
            ? "oklch(var(--muted-foreground))"
            : "oklch(var(--primary-foreground))",
          boxShadow: isDisabled
            ? "none"
            : "0 4px 20px oklch(var(--primary) / 0.35)",
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}
        data-ocid="register.submit_button"
      >
        {isDisabled ? (
          <>
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
            {authLoading ? "Creating Account…" : "Connecting…"}
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
              <title>Register</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
            Create My Account
          </>
        )}
      </motion.button>

      <p className="text-xs text-center text-muted-foreground pb-1">
        By registering you agree to our{" "}
        <button type="button" className="text-primary hover:underline">
          Terms of Service
        </button>
      </p>
    </motion.form>
  );
}
