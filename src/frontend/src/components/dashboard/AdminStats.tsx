import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../../backend";
import type { ActivityEvent, AnalyticsSummary } from "../../backend.d";
import {
  useAdminPendingUsers,
  useAdminRecentActivity,
} from "../../hooks/useBackend";
import { LiveIndicator } from "./LiveIndicator";

// ─── Count-up animation ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

// ─── Analytics hook with 5s auto-refresh ─────────────────────────────────────
function useAnalytics() {
  const { actor } = useActor(createActor);

  return useQuery<AnalyticsSummary | null>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAnalytics();
      } catch {
        return null;
      }
    },
    enabled: !!actor,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: 4,
    retryDelay: (attempt) => Math.min(2000 * (attempt + 1), 8000),
  });
}

// ─── Stat Card — premium cinematic with gradient icon ─────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  borderColor: string;
  delay?: number;
  urgent?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  gradientFrom,
  gradientTo,
  textColor,
  borderColor,
  delay = 0,
  urgent = false,
}: StatCardProps) {
  const displayed = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 120 }}
      className={`relative rounded-2xl bg-card border overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-default ${borderColor} ${urgent && value > 0 ? "ring-2 ring-yellow-500/40 shadow-[0_0_18px_oklch(0.75_0.18_83/0.2)]" : "shadow-subtle hover:shadow-luxury"}`}
      data-ocid="admin-stat-card"
    >
      {/* Top gradient bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {urgent && value > 0 && (
        <div className="absolute top-4 right-4">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping inline-block" />
        </div>
      )}

      <div className="p-5">
        {/* Icon with gradient background */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}33, ${gradientTo}22)`,
            border: `1px solid ${gradientFrom}30`,
          }}
        >
          {icon}
        </div>

        <p
          className={`text-3xl font-bold font-display ${textColor} mb-1 tracking-tight`}
        >
          {prefix}
          {displayed.toLocaleString("en-IN")}
        </p>
        <p className="text-xs font-semibold text-foreground/70 dark:text-muted-foreground font-body tracking-wide uppercase">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Activity helpers ─────────────────────────────────────────────────────────
const ACTIVITY_KIND_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Booking: {
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Payment: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Enrollment: {
    bg: "bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  Registration: {
    bg: "bg-primary/15",
    text: "text-primary",
    dot: "bg-primary",
  },
  Login: {
    bg: "bg-sky-500/15",
    text: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
};

function ActivityItem({
  activity,
  isNew,
}: {
  activity: ActivityEvent;
  isNew: boolean;
}) {
  const kindStr =
    typeof activity.kind === "string" ? activity.kind : String(activity.kind);
  const cfg = ACTIVITY_KIND_CONFIG[kindStr] ?? {
    bg: "bg-muted/30",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  function formatRelTs(ts: bigint) {
    const ms = Number(ts) / 1_000_000;
    const diff = Date.now() - ms;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  return (
    <motion.div
      initial={
        isNew ? { opacity: 0, y: -10, scale: 0.97 } : { opacity: 0, x: -6 }
      }
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 text-xs py-2.5 border-b border-border/25 last:border-0 ${isNew ? "bg-primary/5 rounded-lg px-2 -mx-2" : ""}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-foreground/90 leading-snug font-semibold truncate">
          {activity.title}
        </p>
        {activity.detail && (
          <p className="text-muted-foreground text-[11px] truncate">
            {activity.detail}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-muted-foreground/60">
            {formatRelTs(activity.timestamp)}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${cfg.bg} ${cfg.text}`}
          >
            {kindStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fallback analytics ───────────────────────────────────────────────────────
const FALLBACK: AnalyticsSummary = {
  pendingFeedbackCount: BigInt(0),
  pendingBookings: BigInt(0),
  totalEnrollments: BigInt(0),
  emailLogCount: BigInt(0),
  cancelledBookings: BigInt(0),
  totalBookings: BigInt(0),
  totalCourseRevenue: BigInt(0),
  totalMultiServiceBookings: BigInt(0),
  totalFeedback: BigInt(0),
  confirmedBookings: BigInt(0),
  completedBookings: BigInt(0),
  totalRevenue: BigInt(0),
  totalCmsEntries: BigInt(0),
  totalUsers: BigInt(0),
  revenueByService: [],
};

const EMPTY_ACTIVITY: ActivityEvent[] = [];

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminStats() {
  const { data: analytics, dataUpdatedAt } = useAnalytics();
  const { data: activityData = [] } = useAdminRecentActivity();
  const { data: pendingUsers = [] } = useAdminPendingUsers();
  const stats = analytics ?? FALLBACK;
  const activity = activityData.length > 0 ? activityData : EMPTY_ACTIVITY;

  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(dataUpdatedAt);
  }, [dataUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());
  const prevActivityRef = useRef<ActivityEvent[]>([]);

  useEffect(() => {
    if (activityData.length > 0) {
      const prevIds = new Set(prevActivityRef.current.map((a) => a.id));
      const fresh = activityData
        .filter((a) => !prevIds.has(a.id))
        .map((a) => a.id);
      if (fresh.length > 0) {
        setNewActivityIds(new Set(fresh));
        setTimeout(() => setNewActivityIds(new Set()), 2000);
      }
      prevActivityRef.current = activityData;
    }
  }, [activityData]);

  const n = (v: bigint | number | undefined) =>
    typeof v === "bigint" ? Number(v) : (v ?? 0);

  // Deep navy + rich gold + violet + teal + coral palette — WCAG AA contrast in both modes
  const STAT_CARDS: StatCardProps[] = [
    {
      icon: <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
      label: "Total Users",
      value: n(stats.totalUsers),
      gradientFrom: "oklch(0.6 0.2 240)",
      gradientTo: "oklch(0.5 0.18 260)",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      label: "Total Bookings",
      value: n(stats.totalBookings),
      gradientFrom: "oklch(0.73 0.148 83)",
      gradientTo: "oklch(0.65 0.13 75)",
      textColor: "text-primary",
      borderColor: "border-primary/20",
    },
    {
      icon: <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />,
      label: "Pending Bookings",
      value: n(stats.pendingBookings),
      gradientFrom: "oklch(0.75 0.18 85)",
      gradientTo: "oklch(0.65 0.15 80)",
      textColor: "text-yellow-600 dark:text-yellow-500",
      borderColor: "border-yellow-500/20",
      urgent: true,
    },
    {
      icon: (
        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      ),
      label: "Total Revenue",
      value: Math.round(n(stats.totalRevenue) / 100),
      prefix: "₹",
      gradientFrom: "oklch(0.68 0.2 150)",
      gradientTo: "oklch(0.58 0.18 155)",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      icon: (
        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      ),
      label: "Active Enrollments",
      value: n(stats.totalEnrollments),
      gradientFrom: "oklch(0.7 0.22 292)",
      gradientTo: "oklch(0.6 0.2 280)",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      icon: <Award className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      label: "Completed Bookings",
      value: n(stats.completedBookings),
      gradientFrom: "oklch(0.66 0.18 215)",
      gradientTo: "oklch(0.56 0.16 200)",
      textColor: "text-sky-600 dark:text-sky-400",
      borderColor: "border-sky-400/20",
    },
    {
      icon: (
        <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
      ),
      label: "Course Revenue",
      value: Math.round(n(stats.totalCourseRevenue) / 100),
      prefix: "₹",
      gradientFrom: "oklch(0.66 0.18 180)",
      gradientTo: "oklch(0.56 0.16 190)",
      textColor: "text-teal-600 dark:text-teal-400",
      borderColor: "border-teal-400/20",
    },
    {
      icon: (
        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      ),
      label: "Pending Approvals",
      value: pendingUsers.length,
      gradientFrom: "oklch(0.72 0.2 50)",
      gradientTo: "oklch(0.62 0.18 40)",
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-400/20",
      urgent: true,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">
            Live Overview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time studio metrics — auto-refreshes every 5 seconds
          </p>
        </div>
        <LiveIndicator dataUpdatedAt={lastUpdated} pollMs={5000} />
      </div>

      {/* Stat cards — premium grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.06} />
        ))}
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Booking distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl bg-card border border-border shadow-luxury p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold font-display text-foreground">
              Booking Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Completed",
                value: n(stats.completedBookings),
                color: "bg-primary",
                textColor: "text-primary",
              },
              {
                label: "Confirmed",
                value: n(stats.confirmedBookings),
                color: "bg-blue-500",
                textColor: "text-blue-500 dark:text-blue-400",
              },
              {
                label: "Pending",
                value: n(stats.pendingBookings),
                color: "bg-yellow-500",
                textColor: "text-yellow-600 dark:text-yellow-400",
              },
              {
                label: "Cancelled",
                value: n(stats.cancelledBookings),
                color: "bg-red-500",
                textColor: "text-red-600 dark:text-red-400",
              },
            ].map((bar) => {
              const total = n(stats.totalBookings) || 1;
              const pct = Math.round((bar.value / total) * 100);
              return (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground font-medium">
                      {bar.label}
                    </span>
                    <span className={`font-bold ${bar.textColor}`}>
                      {bar.value}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 1.2,
                        delay: 0.7,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${bar.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Live activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="rounded-2xl bg-card border border-border shadow-luxury p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-bold font-display text-foreground">
                Live Activity
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              5s refresh
            </div>
          </div>

          <div className="flex-1 max-h-56 overflow-y-auto pr-1 space-y-0">
            {activity.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2"
                data-ocid="activity-empty_state"
              >
                <Zap className="w-8 h-8 opacity-30" />
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-xs text-muted-foreground/60">
                  Activity will appear here as it happens
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {activity.map((a) => (
                  <ActivityItem
                    key={a.id}
                    activity={a}
                    isNew={newActivityIds.has(a.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
