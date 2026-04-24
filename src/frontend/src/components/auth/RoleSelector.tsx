import type { UserRole } from "@/types";
import { motion } from "motion/react";

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  isAdmin?: boolean;
  accentColor: string;
}

const ClientIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-5 h-5"
    aria-hidden="true"
  >
    <title>Client</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
    />
  </svg>
);

const StudentIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-5 h-5"
    aria-hidden="true"
  >
    <title>Student</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
    />
  </svg>
);

const ReceptionistIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-5 h-5"
    aria-hidden="true"
  >
    <title>Receptionist</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
    />
  </svg>
);

const StaffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-5 h-5"
    aria-hidden="true"
  >
    <title>Staff</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const AdminIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-5 h-5"
    aria-hidden="true"
  >
    <title>Admin Owner</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
    />
  </svg>
);

const ALL_ROLES: RoleOption[] = [
  {
    role: "client",
    label: "Client",
    description: "Book shoots & sessions",
    icon: <ClientIcon />,
    accentColor: "oklch(0.7 0.22 70)",
  },
  {
    role: "student",
    label: "Student",
    description: "Courses & certificates",
    icon: <StudentIcon />,
    accentColor: "oklch(0.65 0.2 230)",
  },
  {
    role: "receptionist",
    label: "Receptionist",
    description: "Manage bookings",
    icon: <ReceptionistIcon />,
    accentColor: "oklch(0.65 0.16 160)",
  },
  {
    role: "staff",
    label: "Staff",
    description: "Upload & manage work",
    icon: <StaffIcon />,
    accentColor: "oklch(0.65 0.18 190)",
  },
  {
    role: "admin",
    label: "Admin (Owner)",
    description: "→ Redirects to secure portal",
    icon: <AdminIcon />,
    isAdmin: true,
    accentColor: "oklch(0.78 0.2 85)",
  },
];

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  availableRoles?: UserRole[];
  /** When true, clicking just selects (no redirect for admin). Used in registration panel. */
  registrationMode?: boolean;
  "data-ocid"?: string;
}

export function RoleSelector({
  selectedRole,
  onRoleSelect,
  availableRoles,
  registrationMode = false,
}: RoleSelectorProps) {
  const roles = availableRoles
    ? ALL_ROLES.filter((r) => availableRoles.includes(r.role))
    : ALL_ROLES;

  return (
    <div className="grid grid-cols-2 gap-2">
      {roles.map((option, i) => {
        const isSelected = selectedRole === option.role;
        const { accentColor, isAdmin } = option;

        return (
          <motion.button
            key={option.role}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRoleSelect(option.role)}
            data-ocid={`role-card-${option.role}`}
            type="button"
            aria-pressed={isSelected}
            className="relative flex flex-col items-start gap-1.5 p-3 rounded-xl text-left transition-all duration-300 border overflow-hidden"
            style={{
              background: isSelected
                ? accentColor.replace(")", " / 0.12)")
                : "oklch(0.18 0.02 280 / 0.5)",
              borderColor: isSelected
                ? accentColor.replace(")", " / 0.7)")
                : "oklch(0.32 0.02 280 / 0.6)",
              boxShadow: isSelected
                ? `0 0 18px ${accentColor.replace(")", " / 0.25)")}`
                : "none",
            }}
          >
            {/* Admin shimmer */}
            {isAdmin && !registrationMode && (
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 25%, oklch(0.85 0.18 85 / 0.12) 50%, transparent 75%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  repeatDelay: 2,
                }}
                aria-hidden="true"
              />
            )}

            {/* Selected highlight */}
            {isSelected && (
              <motion.div
                layoutId="role-highlight"
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: accentColor.replace(")", " / 0.05)") }}
              />
            )}

            {/* Icon */}
            <span
              className="relative z-10 transition-colors duration-300"
              style={{
                color: isSelected ? accentColor : "oklch(0.55 0.01 280)",
              }}
            >
              {option.icon}
            </span>

            <div className="relative z-10 min-w-0 w-full">
              <div
                className="font-semibold text-xs leading-tight transition-colors duration-300"
                style={{
                  color: isSelected ? accentColor : "oklch(0.82 0.008 280)",
                }}
              >
                {option.label}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {option.description}
              </div>
            </div>

            {/* Checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center z-10"
                style={{ background: accentColor }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-2.5 h-2.5 text-black"
                  aria-hidden="true"
                >
                  <title>Selected</title>
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            {/* Admin OWNER badge */}
            {isAdmin && !isSelected && !registrationMode && (
              <span
                className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1 py-0.5 rounded leading-none"
                style={{
                  background: "oklch(0.78 0.2 85 / 0.1)",
                  border: "1px solid oklch(0.78 0.2 85 / 0.35)",
                  color: "oklch(0.78 0.2 85 / 0.8)",
                }}
              >
                OWNER
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
