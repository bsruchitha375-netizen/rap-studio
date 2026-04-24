import type { UserRole } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface RegistrationFormProps {
  onSubmit: () => void;
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
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};
const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  empty: "#d1d5db",
  weak: "#ef4444",
  fair: "#f59e0b",
  good: "#3b82f6",
  strong: "#22c55e",
};

const inputStyle: React.CSSProperties = {
  color: "#000000",
  backgroundColor: "#ffffff",
  border: "1px solid rgba(0,0,0,0.18)",
  borderRadius: "0.55rem",
  padding: "0.65rem 0.875rem 0.65rem 2.6rem",
  width: "100%",
  fontSize: "0.875rem",
  outline: "none",
  WebkitTextFillColor: "#000000",
  transition: "border 0.2s, box-shadow 0.2s",
};

const inputFocusStyle: React.CSSProperties = {
  border: "1.5px solid oklch(0.7 0.22 70)",
  boxShadow: "0 0 0 3px oklch(0.7 0.22 70 / 0.18)",
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
  phone?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
}

interface StoredUser {
  identifier: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
}

function saveUserToDb(user: StoredUser) {
  const raw = localStorage.getItem("rap_users_db");
  const users: StoredUser[] = raw ? (JSON.parse(raw) as StoredUser[]) : [];
  // Remove any existing entry with same phone/identifier
  const filtered = users.filter(
    (u) => u.phone.replace(/\D/g, "") !== user.phone.replace(/\D/g, ""),
  );
  filtered.push(user);
  localStorage.setItem("rap_users_db", JSON.stringify(filtered));
}

export function RegistrationForm({ onSubmit }: RegistrationFormProps) {
  const [selectedRole, setSelectedRole] = useState<"client" | "student">(
    "client",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [shakeForm, setShakeForm] = useState(false);

  // Student-specific
  const [courseType, setCourseType] = useState<"Online" | "Offline" | "Hybrid">(
    "Online",
  );
  const [sessionSlot, setSessionSlot] = useState<"Saturday" | "Sunday">(
    "Saturday",
  );
  const [learningMode, setLearningMode] = useState<
    "Self-paced" | "Instructor-led" | "Blended"
  >("Self-paced");

  // Track focus for styling
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const strength = getPasswordStrength(password);

  const getFieldStyle = (
    field: string,
    hasError?: string,
  ): React.CSSProperties => ({
    ...inputStyle,
    ...(focusedField === field ? inputFocusStyle : {}),
    ...(hasError ? { border: "1.5px solid #ef4444" } : {}),
  });

  const validate = useCallback((): FormErrors => {
    const e: FormErrors = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = "Enter your full name (min 2 chars)";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) e.phone = "Enter a valid 10-digit mobile number";
    if (!password || password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!address.trim() || address.trim().length < 5)
      e.address = "Enter your full address";
    return e;
  }, [name, phone, password, confirmPassword, address]);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 600);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const formattedPhone = `+91${phone.replace(/\D/g, "").slice(-10)}`;
    saveUserToDb({
      identifier: phone.replace(/\D/g, ""),
      password,
      name: name.trim(),
      phone: formattedPhone,
      role: selectedRole,
    });

    setIsSubmitting(false);
    onSubmit();
  };

  return (
    <motion.form
      onSubmit={(e) => void handleSubmit(e)}
      animate={shakeForm ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
      data-ocid="registration-form"
      noValidate
    >
      {/* Role selector (client / student) */}
      <div>
        <p className="text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
          Joining as
        </p>
        <div className="flex gap-2">
          {(["client", "student"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              data-ocid={`register.role.${r}`}
              className="flex-1 py-2 text-xs font-semibold rounded-xl border transition-all duration-200"
              style={
                selectedRole === r
                  ? {
                      background: "oklch(0.7 0.22 70 / 0.15)",
                      borderColor: "oklch(0.7 0.22 70 / 0.6)",
                      color: "oklch(0.7 0.22 70)",
                    }
                  : {
                      background: "oklch(0.18 0.02 280 / 0.4)",
                      borderColor: "oklch(0.35 0.02 280 / 0.5)",
                      color: "oklch(0.6 0.01 280)",
                    }
              }
            >
              {r === "client" ? "📸 Client" : "🎓 Student"}
            </button>
          ))}
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-1">
        <label
          htmlFor="reg-name"
          className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider"
        >
          Full Name
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
            id="reg-name"
            type="text"
            placeholder="e.g. Ruchitha B S"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            style={getFieldStyle("name", errors.name)}
            autoComplete="name"
            data-ocid="register.name.input"
          />
        </div>
        {errors.name && (
          <p
            className="text-xs"
            style={{ color: "#ef4444" }}
            role="alert"
            data-ocid="register.name.field_error"
          >
            ⚠ {errors.name}
          </p>
        )}
      </div>

      {/* Mobile Number */}
      <div className="space-y-1">
        <label
          htmlFor="reg-phone"
          className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider"
        >
          Mobile Number{" "}
          <span
            className="text-xs font-normal normal-case"
            style={{ color: "oklch(0.7 0.22 70)" }}
          >
            (used to sign in)
          </span>
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
              <title>Phone</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 15h3"
              />
            </svg>
          </span>
          <span
            className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-semibold select-none z-10 pointer-events-none"
            style={{ color: "#444" }}
          >
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
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField(null)}
            style={{
              ...getFieldStyle("phone", errors.phone),
              paddingLeft: "3.75rem",
            }}
            autoComplete="tel"
            data-ocid="register.phone.input"
          />
        </div>
        {errors.phone && (
          <p
            className="text-xs"
            style={{ color: "#ef4444" }}
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
          className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider"
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
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((p) => ({ ...p, password: undefined }));
            }}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            style={{
              ...getFieldStyle("password", errors.password),
              paddingRight: "2.75rem",
            }}
            autoComplete="new-password"
            data-ocid="register.password.input"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-opacity hover:opacity-80"
            style={{ color: "oklch(0.4 0.04 280)" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon show={showPassword} />
          </button>
        </div>
        {password && (
          <div>
            <div className="flex gap-1 mt-1">
              {(["weak", "fair", "good", "strong"] as const).map((level, i) => {
                const levels = ["weak", "fair", "good", "strong"];
                const currentIdx = levels.indexOf(strength);
                return (
                  <div
                    key={level}
                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      background:
                        i <= currentIdx ? STRENGTH_COLORS[strength] : "#e5e7eb",
                    }}
                  />
                );
              })}
            </div>
            <p
              className="text-xs mt-0.5 font-medium"
              style={{ color: STRENGTH_COLORS[strength] }}
            >
              {STRENGTH_LABELS[strength]}
            </p>
          </div>
        )}
        {errors.password && (
          <p
            className="text-xs"
            style={{ color: "#ef4444" }}
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
          className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider"
        >
          Confirm Password
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
              <title>Confirm</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
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
            onFocus={() => setFocusedField("confirm")}
            onBlur={() => setFocusedField(null)}
            style={{
              ...getFieldStyle("confirm", errors.confirmPassword),
              paddingRight: "2.75rem",
            }}
            autoComplete="new-password"
            data-ocid="register.confirm_password.input"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-opacity hover:opacity-80"
            style={{ color: "oklch(0.4 0.04 280)" }}
            aria-label={showConfirm ? "Hide" : "Show"}
          >
            <EyeIcon show={showConfirm} />
          </button>
          {confirmPassword && password && (
            <span className="absolute right-9 top-1/2 -translate-y-1/2 text-sm">
              {confirmPassword === password ? "✅" : "❌"}
            </span>
          )}
        </div>
        {errors.confirmPassword && (
          <p
            className="text-xs"
            style={{ color: "#ef4444" }}
            role="alert"
            data-ocid="register.confirm_password.field_error"
          >
            ⚠ {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1">
        <label
          htmlFor="reg-address"
          className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider"
        >
          Address
        </label>
        <div className="relative">
          <span
            className="absolute left-3 top-3.5 pointer-events-none z-10"
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
            onChange={(e) => {
              setAddress(e.target.value);
              if (errors.address)
                setErrors((p) => ({ ...p, address: undefined }));
            }}
            onFocus={() => setFocusedField("address")}
            onBlur={() => setFocusedField(null)}
            style={{
              ...getFieldStyle("address", errors.address),
              paddingTop: "0.6rem",
              paddingBottom: "0.6rem",
              resize: "none",
              minHeight: "3.5rem",
            }}
            data-ocid="register.address.textarea"
          />
        </div>
        {errors.address && (
          <p
            className="text-xs"
            style={{ color: "#ef4444" }}
            role="alert"
            data-ocid="register.address.field_error"
          >
            ⚠ {errors.address}
          </p>
        )}
      </div>

      {/* Profile Photo */}
      <div>
        <p className="text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
          Profile Photo{" "}
          <span className="text-muted-foreground font-normal normal-case">
            (optional)
          </span>
        </p>
        <button
          type="button"
          className="w-full relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-300"
          style={{
            borderColor: isDragging
              ? "oklch(0.7 0.22 70)"
              : "oklch(0.35 0.02 280 / 0.6)",
            background: isDragging
              ? "oklch(0.7 0.22 70 / 0.05)"
              : "oklch(0.18 0.02 280 / 0.4)",
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
                className="w-10 h-10 rounded-full object-cover border-2"
                style={{ borderColor: "oklch(0.7 0.22 70 / 0.5)" }}
              />
              <div className="text-left">
                <p className="text-xs font-medium text-foreground">
                  Photo selected
                </p>
                <p className="text-xs text-muted-foreground">Click to change</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xl mb-0.5">📸</div>
              <p className="text-xs text-muted-foreground">
                Drag & drop or{" "}
                <span style={{ color: "oklch(0.7 0.22 70)" }}>
                  click to browse
                </span>
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
            <div
              className="rounded-xl border p-3 space-y-3"
              style={{
                background: "oklch(0.18 0.022 280 / 0.5)",
                borderColor: "oklch(0.65 0.2 230 / 0.3)",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                style={{ color: "oklch(0.65 0.2 230)" }}
              >
                <span>🎓</span> Student Options
              </p>
              {/* Course Type */}
              <div>
                <p className="text-xs font-semibold text-foreground/70 mb-1.5">
                  Course Type
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
                              background: "oklch(0.65 0.2 230 / 0.2)",
                              borderColor: "oklch(0.65 0.2 230 / 0.6)",
                              color: "oklch(0.65 0.2 230)",
                            }
                          : {
                              background: "transparent",
                              borderColor: "oklch(0.35 0.02 280 / 0.5)",
                              color: "oklch(0.6 0.01 280)",
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
              {/* Session Slot */}
              <div>
                <p className="text-xs font-semibold text-foreground/70 mb-1.5">
                  Preferred Session
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
                              background: "oklch(0.65 0.2 230 / 0.2)",
                              borderColor: "oklch(0.65 0.2 230 / 0.6)",
                              color: "oklch(0.65 0.2 230)",
                            }
                          : {
                              background: "transparent",
                              borderColor: "oklch(0.35 0.02 280 / 0.5)",
                              color: "oklch(0.6 0.01 280)",
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
                  className="text-xs font-semibold text-foreground/70 mb-1 block"
                >
                  Learning Mode
                </label>
                <div className="relative">
                  <select
                    id="learning-mode"
                    value={learningMode}
                    onChange={(e) =>
                      setLearningMode(e.target.value as typeof learningMode)
                    }
                    style={{
                      ...inputStyle,
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
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs"
                    style={{ color: "oklch(0.5 0.04 280)" }}
                  >
                    ▼
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1"
        style={{
          background: isSubmitting
            ? "oklch(0.5 0.12 70 / 0.7)"
            : "var(--gradient-gold)",
          color: "oklch(0.1 0.02 280)",
          boxShadow: isSubmitting
            ? "none"
            : "0 4px 20px oklch(0.7 0.22 70 / 0.35)",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
        data-ocid="register.submit_button"
      >
        {isSubmitting ? (
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
            Creating Account…
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
            Create Account
          </>
        )}
      </motion.button>

      <p className="text-xs text-center text-muted-foreground pb-1">
        By registering you agree to our{" "}
        <button
          type="button"
          className="hover:underline"
          style={{ color: "oklch(0.7 0.22 70)" }}
        >
          Terms of Service
        </button>
      </p>
    </motion.form>
  );
}
