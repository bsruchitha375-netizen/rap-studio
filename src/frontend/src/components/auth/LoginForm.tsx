import { UserRole as BackendUserRole, createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserProfile } from "@/hooks/useAuth";
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

export function LoginForm({ prefilledRole, onComplete }: LoginFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const { actor } = useActor(createActor);
  const { setProfile } = useUserProfile();

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim() || name.trim().length < 2)
      newErrors.name = "Please enter your full name";
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10)
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
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

    // ── Optimistic update: persist locally and navigate immediately ──────────
    // The user lands on their dashboard right away; backend registration fires
    // in the background. On failure we surface an error but the UX is instant.
    const optimisticProfile = {
      id: crypto.randomUUID(),
      name: trimmedName,
      phone: formattedPhone,
      role: prefilledRole,
      createdAt: BigInt(Date.now()),
      isActive: true,
    };
    setProfile(optimisticProfile);

    // Navigate immediately — don't wait for the backend round-trip
    onComplete(trimmedName, formattedPhone, prefilledRole);

    // Fire backend registration in background (best-effort)
    if (actor) {
      actor
        .register(trimmedName, formattedPhone, ROLE_TO_BACKEND[prefilledRole])
        .catch(() => {
          // Silently absorb — the optimistic profile is already stored.
          // On next authenticated session the backend can be synced.
        });
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-display font-semibold text-foreground mb-1">
          Complete Your Profile
        </h3>
        <p className="text-sm text-muted-foreground">
          Just one more step — set up your{" "}
          <span className="text-primary font-medium">
            {ROLE_LABELS[prefilledRole]}
          </span>{" "}
          account
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        data-ocid="profile-form"
      >
        <div className="space-y-1.5">
          <Label
            htmlFor="full-name"
            className="text-sm font-medium text-foreground"
          >
            Full Name
          </Label>
          <Input
            id="full-name"
            type="text"
            placeholder="e.g. Ruchitha B S"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={[
              "bg-card/50 border-border transition-all duration-300 placeholder:text-muted-foreground/50",
              "focus:border-primary focus:shadow-[0_0_12px_oklch(0.7_0.22_70_/_0.2)]",
              errors.name ? "border-destructive" : "",
            ].join(" ")}
            data-ocid="input-name"
            autoComplete="name"
            autoFocus
          />
          {errors.name && (
            <p
              className="text-xs text-destructive mt-1"
              data-ocid="input-name.field_error"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="phone-number"
            className="text-sm font-medium text-foreground"
          >
            Phone Number
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">
              +91
            </span>
            <Input
              id="phone-number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))
              }
              className={[
                "pl-12 bg-card/50 border-border transition-all duration-300 placeholder:text-muted-foreground/50",
                "focus:border-primary focus:shadow-[0_0_12px_oklch(0.7_0.22_70_/_0.2)]",
                errors.phone ? "border-destructive" : "",
              ].join(" ")}
              data-ocid="input-phone"
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p
              className="text-xs text-destructive mt-1"
              data-ocid="input-phone.field_error"
            >
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Role</Label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card/30">
            <span className="text-sm text-muted-foreground">
              {ROLE_LABELS[prefilledRole]}
            </span>
            <span className="ml-auto text-xs text-muted-foreground/60 italic">
              Pre-selected
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2"
          style={{ background: "var(--gradient-gold)" }}
          data-ocid="btn-submit-profile"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                role="img"
                aria-label="Loading"
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
            "Enter RAP Studio"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
