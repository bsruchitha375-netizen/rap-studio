import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../../backend";
import type { ActivityEvent, AnalyticsSummary } from "../../backend.d";
import { useAdminRecentActivity } from "../../hooks/useBackend";
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
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  delay?: number;
}

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  colorClass,
  bgClass,
  borderClass,
  delay = 0,
}: StatCardProps) {
  const displayed = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative rounded-2xl bg-card border ${borderClass} shadow-subtle hover:shadow-luxury transition-smooth overflow-hidden group`}
      data-ocid="admin-stat-card"
    >
      <div className="p-5">
        <div
          className={`w-11 h-11 rounded-xl ${bgClass} flex items-center justify-center mb-4`}
        >
          {icon}
        </div>
        <p className={`text-3xl font-bold font-display ${colorClass} mb-1`}>
          {prefix}
          {displayed.toLocaleString("en-IN")}
        </p>
        <p className="text-xs font-semibold text-muted-foreground font-body tracking-wide">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Activity helpers ─────────────────────────────────────────────────────────
function ActivityDot({ kind }: { kind: string }) {
  const colors: Record<string, string> = {
    Booking: "bg-primary",
    Payment: "bg-emerald-500",
    Enrollment: "bg-purple-500",
    Registration: "bg-blue-500",
  };
  return (
    <div
      className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colors[kind] ?? "bg-muted-foreground"}`}
    />
  );
}

function ActivityKindBadge({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    Booking: "bg-primary/15 text-primary dark:text-primary font-semibold",
    Payment:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold",
    Enrollment:
      "bg-purple-500/15 text-purple-700 dark:text-purple-400 font-semibold",
    Registration:
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold",
  };
  return (
    <span
      className={`capitalize text-[10px] px-1.5 py-0.5 rounded ${map[kind] ?? "bg-muted/30 text-muted-foreground"}`}
    >
      {kind}
    </span>
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

// ─── Fallback activity — empty for real app ───────────────────────────────────
const EMPTY_ACTIVITY: ActivityEvent[] = [];

function formatRelTs(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminStats() {
  const { data: analytics, dataUpdatedAt } = useAnalytics();
  const { data: activityData = [] } = useAdminRecentActivity();
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

  const STAT_CARDS: StatCardProps[] = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      label: "Total Bookings",
      value: n(stats.totalBookings),
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-500/15",
      borderClass: "border-blue-500/20",
    },
    {
      icon: <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
      label: "Pending Bookings",
      value: n(stats.pendingBookings),
      colorClass: "text-yellow-600 dark:text-yellow-400",
      bgClass: "bg-yellow-500/15",
      borderClass: "border-yellow-500/20",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      label: "Total Revenue",
      value: Math.round(n(stats.totalRevenue) / 100),
      prefix: "₹",
      colorClass: "text-primary",
      bgClass: "bg-primary/15",
      borderClass: "border-primary/20",
    },
    {
      icon: (
        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      ),
      label: "Active Enrollments",
      value: n(stats.totalEnrollments),
      colorClass: "text-purple-600 dark:text-purple-400",
      bgClass: "bg-purple-500/15",
      borderClass: "border-purple-500/20",
    },
    {
      icon: <Award className="w-5 h-5 text-sky-600 dark:text-sky-300" />,
      label: "Completed Bookings",
      value: n(stats.completedBookings),
      colorClass: "text-sky-600 dark:text-sky-300",
      bgClass: "bg-sky-400/15",
      borderClass: "border-sky-400/20",
    },
    {
      icon: <Users className="w-5 h-5 text-accent" />,
      label: "Total Users",
      value: n(stats.totalUsers),
      colorClass: "text-accent",
      bgClass: "bg-accent/15",
      borderClass: "border-accent/20",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-foreground">
          Live Overview
        </h2>
        <LiveIndicator dataUpdatedAt={lastUpdated} pollMs={5000} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.07} />
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
            <CheckCircle className="w-4 h-4 text-primary" />
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
                textColor: "text-blue-600 dark:text-blue-400",
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
          className="rounded-2xl bg-card border border-border shadow-luxury p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold font-display text-foreground">
                Live Activity
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              5s refresh
            </span>
          </div>
          <div className="max-h-56 overflow-y-auto pr-1">
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
                {activity.map((a, i) => {
                  const isNew = newActivityIds.has(a.id);
                  const kindStr =
                    typeof a.kind === "string" ? a.kind : String(a.kind);
                  return (
                    <motion.div
                      key={a.id}
                      initial={
                        isNew
                          ? { opacity: 0, y: -12, scale: 0.97 }
                          : { opacity: 0, x: -8 }
                      }
                      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                      transition={{
                        delay: isNew ? 0 : 0.7 + i * 0.05,
                        duration: 0.3,
                      }}
                      className={`flex items-start gap-3 text-xs py-2.5 border-b border-border/30 last:border-0 ${isNew ? "bg-primary/5 rounded-lg px-2" : ""}`}
                    >
                      <ActivityDot kind={kindStr} />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground/90 leading-snug font-semibold">
                          {a.title}
                        </p>
                        <p className="text-muted-foreground text-[11px] truncate">
                          {a.detail}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-muted-foreground/60">
                            {formatRelTs(a.timestamp)}
                          </span>
                          <ActivityKindBadge kind={kindStr} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
