import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PublicProfile } from "../../backend.d";
import {
  useAdminPendingUsers,
  useApproveUser,
  useRejectUser,
} from "../../hooks/useBackend";
import { LiveIndicator } from "./LiveIndicator";

// ── Role config (Student=blue, Receptionist=purple, Staff=orange) ─────────────
const ROLE_CONFIG: Record<
  string,
  { badge: string; avatar: string; label: string }
> = {
  Student: {
    badge: "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-300",
    avatar: "from-blue-500/40 to-blue-600/20 border-blue-500/30 text-blue-400",
    label: "Student",
  },
  student: {
    badge: "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-300",
    avatar: "from-blue-500/40 to-blue-600/20 border-blue-500/30 text-blue-400",
    label: "Student",
  },
  Receptionist: {
    badge:
      "bg-purple-500/15 text-purple-700 border-purple-500/40 dark:text-purple-300",
    avatar:
      "from-purple-500/40 to-purple-600/20 border-purple-500/30 text-purple-400",
    label: "Receptionist",
  },
  receptionist: {
    badge:
      "bg-purple-500/15 text-purple-700 border-purple-500/40 dark:text-purple-300",
    avatar:
      "from-purple-500/40 to-purple-600/20 border-purple-500/30 text-purple-400",
    label: "Receptionist",
  },
  Staff: {
    badge:
      "bg-orange-500/15 text-orange-700 border-orange-500/40 dark:text-orange-300",
    avatar:
      "from-orange-500/40 to-orange-600/20 border-orange-500/30 text-orange-400",
    label: "Staff",
  },
  staff: {
    badge:
      "bg-orange-500/15 text-orange-700 border-orange-500/40 dark:text-orange-300",
    avatar:
      "from-orange-500/40 to-orange-600/20 border-orange-500/30 text-orange-400",
    label: "Staff",
  },
  Client: {
    badge:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
    avatar:
      "from-emerald-500/40 to-emerald-600/20 border-emerald-500/30 text-emerald-400",
    label: "Client",
  },
  client: {
    badge:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
    avatar:
      "from-emerald-500/40 to-emerald-600/20 border-emerald-500/30 text-emerald-400",
    label: "Client",
  },
};

const FALLBACK_CONFIG = {
  badge: "bg-muted/40 text-foreground border-border/40",
  avatar: "from-primary/30 to-accent/20 border-primary/30 text-primary",
  label: "Unknown",
};

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] ?? FALLBACK_CONFIG;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── PendingUserRow ────────────────────────────────────────────────────────────
function PendingUserRow({
  user,
  index,
  onApprove,
  onReject,
  processingId,
}: {
  user: PublicProfile;
  index: number;
  onApprove: (user: PublicProfile) => void;
  onReject: (user: PublicProfile) => void;
  processingId: string | null;
}) {
  const roleStr = String(user.role);
  const config = getRoleConfig(roleStr);
  const isProcessing = processingId === user.id.toString();
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: 24,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="rounded-xl bg-card border border-primary/15 hover:border-primary/30 p-4 transition-smooth"
      data-ocid={`pending-approvals.item.${index + 1}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full bg-gradient-to-br ${config.avatar} border flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5`}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Name + badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground text-sm truncate min-w-0">
              {user.name}
            </p>
            <Badge
              className={`text-[10px] border capitalize font-bold flex-shrink-0 ${config.badge}`}
            >
              {config.label}
            </Badge>
            <Badge className="text-[10px] border font-semibold bg-yellow-500/12 text-yellow-700 border-yellow-500/40 dark:text-yellow-300 flex-shrink-0">
              Pending
            </Badge>
          </div>

          {/* Contact info */}
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          {user.phone && (
            <p className="text-xs text-muted-foreground/70">{user.phone}</p>
          )}

          {/* Registered date */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>
              Registered {formatDate(user.registeredAt)} at{" "}
              {formatTime(user.registeredAt)}
            </span>
          </div>

          {/* Student extra details */}
          {user.studentDetails && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <BookOpen className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-[11px] text-muted-foreground bg-blue-500/8 rounded px-1.5 py-0.5 border border-blue-500/20 capitalize">
                {user.studentDetails.courseType}
              </span>
              <span className="text-[11px] text-muted-foreground bg-blue-500/8 rounded px-1.5 py-0.5 border border-blue-500/20 capitalize">
                {user.studentDetails.learningMode}
              </span>
              <span className="text-[11px] text-muted-foreground bg-blue-500/8 rounded px-1.5 py-0.5 border border-blue-500/20 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {user.studentDetails.preferredSlot}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
          <Button
            type="button"
            size="sm"
            disabled={isProcessing}
            className="h-9 text-xs font-bold gap-1.5 disabled:opacity-60 flex-1 sm:flex-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.18 155), oklch(0.48 0.20 145))",
              color: "#fff",
              boxShadow: "0 2px 8px oklch(0.55 0.18 155 / 0.3)",
            }}
            onClick={() => onApprove(user)}
            data-ocid={`pending-approvals.approve_button.${index + 1}`}
          >
            {isProcessing ? (
              <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            Approve
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isProcessing}
            className="h-9 text-xs font-bold gap-1.5 disabled:opacity-60 flex-1 sm:flex-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 25), oklch(0.48 0.24 20))",
              color: "#fff",
              boxShadow: "0 2px 8px oklch(0.55 0.22 25 / 0.3)",
            }}
            onClick={() => onReject(user)}
            data-ocid={`pending-approvals.reject_button.${index + 1}`}
          >
            {isProcessing ? (
              <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <UserX className="w-3.5 h-3.5" />
            )}
            Reject
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────
export function PendingApprovalsPanel() {
  const {
    data: pendingUsers = [],
    isLoading,
    dataUpdatedAt,
  } = useAdminPendingUsers();

  const approveUserMutation = useApproveUser();
  const rejectUserMutation = useRejectUser();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const visibleUsers = pendingUsers.filter(
    (u) => !removedIds.has(u.id.toString()),
  );

  async function handleApprove(user: PublicProfile) {
    const uid = user.id.toString();
    setProcessingId(uid);
    try {
      const result = await approveUserMutation.mutateAsync(user.id);
      if (result.__kind__ === "ok") {
        setRemovedIds((prev) => new Set([...prev, uid]));
        toast.success(`✓ ${user.name} approved — they can now sign in`);
      } else {
        toast.error(`Failed to approve: ${result.err}`);
      }
    } catch {
      toast.error("Approval failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(user: PublicProfile) {
    const uid = user.id.toString();
    setProcessingId(uid);
    try {
      const result = await rejectUserMutation.mutateAsync(user.id);
      if (result.__kind__ === "ok") {
        setRemovedIds((prev) => new Set([...prev, uid]));
        toast.error(`${user.name}'s registration has been rejected`);
      } else {
        toast.error(`Failed to reject: ${result.err}`);
      }
    } catch {
      toast.error("Rejection failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-primary" />
            </div>
            Pending Approvals
            {visibleUsers.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-xs font-bold border border-yellow-500/40">
                {visibleUsers.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 ml-10">
            Students, Staff, and Receptionists require your approval before they
            can sign in
          </p>
        </div>
        <LiveIndicator dataUpdatedAt={dataUpdatedAt} pollMs={5000} />
      </div>

      {/* Alert banner */}
      <AnimatePresence>
        {visibleUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500/40 bg-yellow-500/8"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
              {visibleUsers.length} registration
              {visibleUsers.length > 1 ? "s" : ""} waiting for your approval
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role legend pills */}
      <div className="flex flex-wrap gap-2" aria-label="Role colour legend">
        {[
          {
            role: "Student",
            color:
              "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
          },
          {
            role: "Receptionist",
            color:
              "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
          },
          {
            role: "Staff",
            color:
              "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
          },
        ].map(({ role, color }) => (
          <span
            key={role}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${color}`}
          >
            {role}
          </span>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="pending-approvals.loading_state">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : visibleUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 rounded-xl border border-border bg-card/60 text-center"
          data-ocid="pending-approvals.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="font-display font-bold text-foreground text-lg mb-1">
            All caught up!
          </p>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            No pending registrations. New student, staff, and receptionist
            sign-ups will appear here for your approval.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/8 border border-emerald-500/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Checking for new requests every 5 seconds
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleUsers.map((user, i) => (
              <PendingUserRow
                key={user.id.toString()}
                user={user}
                index={i}
                onApprove={handleApprove}
                onReject={handleReject}
                processingId={processingId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>Clients register freely without approval</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Approve to grant login access</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UserX className="w-3.5 h-3.5 text-destructive" />
          <span>Reject removes the registration</span>
        </div>
      </div>
    </div>
  );
}
