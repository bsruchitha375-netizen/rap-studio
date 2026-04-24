import { UserRole as BackendUserRole, createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { saveUserSession, useUserProfile } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { motion } from "motion/react";
import { useState } from "react";

const ROLE_TO_BACKEND: Record<UserRole, BackendUserRole> = {
  admin: BackendUserRole.Admin,
  staff: BackendUserRole.Staff,
  receptionist: BackendUserRole.Receptionist,
  client: BackendUserRole.Client,
  student: BackendUserRole.Student,
};

interface LoginFormProps {
  prefilledRole: UserRole;
  onComplete: (name: string, phone: string, role: UserRole) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  staff: "Staff",
  receptionist: "Receptionist",
  client: "Client",
  student: "Student",
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full studio control",
  staff: "Upload & manage work",
  receptionist: "Manage bookings",
  client: "Book studio sessions",
  student: "Access courses",
};

const inputStyle: React.CSSProperties = {
  color: "#000",
  backgroundColor: "#fff",
  border: "1px solid rgba(0,0,0,0.18)",
  borderRadius: "0.55rem",
  padding: "0.65rem 0.875rem 0.65rem 2.6rem",
  width: "100%",
  fontSize: "0.875rem",
  outline: "none",
  WebkitTextFillColor: "#000",
  transition: "border 0.2s, box-shadow 0.2s",
};

export function LoginForm({ prefilledRole, onComplete }: LoginFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const { actor } = useActor(createActor);
  const { setProfile } = useUserProfile();

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim() || name.trim().length < 2)
      newErrors.name = "Please enter your full name";
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10)
      newErrors.phone = "Enter a valid 10-digit mobile number";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const trimmedName = name.trim();
    const formattedPhone = phone.startsWith("+91")
      ? phone
      : `+91${phone.replace(/\D/g, "").slice(-10)}`;

    const optimisticProfile = {
      id: crypto.randomUUID(),
      name: trimmedName,
      phone: formattedPhone,
      role: prefilledRole,
      createdAt: BigInt(Date.now()),
      isActive: true,
    };
    setProfile(optimisticProfile);
    saveUserSession(trimmedName, formattedPhone, prefilledRole, true);
    onComplete(trimmedName, formattedPhone, prefilledRole);

    if (actor) {
      actor
        .register(trimmedName, formattedPhone, ROLE_TO_BACKEND[prefilledRole])
        .catch(() => {});
    }
    setIsSubmitting(false);
  };

  const nameFocusStyle = nameFocused
    ? {
        border: "1.5px solid oklch(0.7 0.22 70)",
        boxShadow: "0 0 0 3px oklch(0.7 0.22 70 / 0.18)",
      }
    : {};
  const phoneFocusStyle = phoneFocused
    ? {
        border: "1.5px solid oklch(0.7 0.22 70)",
        boxShadow: "0 0 0 3px oklch(0.7 0.22 70 / 0.18)",
      }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-base shrink-0"
            style={{
              background: "var(--gradient-gold)",
              color: "oklch(0.12 0.02 280)",
              boxShadow: "0 0 20px oklch(0.7 0.22 70 / 0.4)",
            }}
          >
            RAP
          </div>
          <div>
            <h3 className="text-xl font-display font-semibold text-foreground leading-tight">
              Complete Your Profile
            </h3>
            <p className="text-sm text-muted-foreground">
              Just one more step to enter as a{" "}
              <span className="text-primary font-medium">
                {ROLE_LABELS[prefilledRole]}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-6"
        style={{
          background: "oklch(0.22 0.025 280 / 0.5)",
          borderColor: "oklch(0.7 0.22 70 / 0.3)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: "oklch(0.7 0.22 70 / 0.15)",
            color: "oklch(0.7 0.22 70)",
          }}
        >
          ✦
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            {ROLE_LABELS[prefilledRole]}
          </div>
          <div className="text-xs text-muted-foreground">
            {ROLE_DESCRIPTIONS[prefilledRole]}
          </div>
        </div>
        <span className="ml-auto text-xs text-muted-foreground/60 italic shrink-0">
          Pre-selected
        </span>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-5"
        data-ocid="profile-form"
      >
        {/* Name field */}
        <div className="space-y-1.5">
          <label
            htmlFor="full-name"
            className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider"
          >
            Full Name
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ color: "oklch(0.5 0.05 280)" }}
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
              id="full-name"
              type="text"
              placeholder="e.g. Ruchitha B S"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              style={{
                ...inputStyle,
                ...(errors.name
                  ? { border: "1.5px solid #ef4444" }
                  : nameFocusStyle),
              }}
              data-ocid="input-name"
              autoComplete="name"
            />
          </div>
          {errors.name && (
            <p
              className="text-xs text-destructive"
              data-ocid="input-name.field_error"
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone field */}
        <div className="space-y-1.5">
          <label
            htmlFor="phone-number"
            className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider"
          >
            Phone Number
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ color: "oklch(0.5 0.05 280)" }}
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
              className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-medium select-none z-10"
              style={{ color: "#555" }}
            >
              +91
            </span>
            <input
              id="phone-number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))
              }
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              style={{
                ...inputStyle,
                paddingLeft: "3.75rem",
                ...(errors.phone
                  ? { border: "1.5px solid #ef4444" }
                  : phoneFocusStyle),
              }}
              data-ocid="input-phone"
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p
              className="text-xs text-destructive"
              data-ocid="input-phone.field_error"
            >
              {errors.phone}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-sm font-semibold mt-2"
          style={{
            background: "var(--gradient-gold)",
            color: "oklch(0.12 0.02 280)",
            boxShadow: "0 4px 20px oklch(0.7 0.22 70 / 0.3)",
          }}
          data-ocid="btn-submit-profile"
        >
          {isSubmitting ? (
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
              Entering Studio…
            </span>
          ) : (
            "Enter RAP Studio →"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
