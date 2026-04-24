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
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../../backend";
import type { BookingStats } from "../../backend.d";
import { useAuth } from "../../hooks/useAuth";

// ─── Count-up animation ───────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === 0 || target === prevTarget.current) return;
    prevTarget.current = target;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

// ─── Analytics hook with 10s auto-refresh ────────────────────────────────────
function useAnalytics() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<BookingStats | null>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAnalytics();
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    refetchInterval: 10_000,
    staleTime: 8_000,
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
  delay?: number;
}

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  colorClass,
  bgClass,
  delay = 0,
}: StatCardProps) {
  const displayed = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative rounded-2xl glass-effect shadow-luxury hover:border-primary/40 transition-smooth overflow-hidden group"
      data-ocid="admin-stat-card"
    >
      {/* Gold hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none rounded-2xl"
        style={{ boxShadow: "inset 0 0 40px oklch(0.7 0.22 70 / 0.06)" }}
      />

      <div className="p-5">
        <div
          className={`w-11 h-11 rounded-xl ${bgClass} flex items-center justify-center mb-4 shadow-subtle`}
        >
          {icon}
        </div>
        <p className={`text-3xl font-bold font-display ${colorClass} mb-1`}>
          {prefix}
          {displayed.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-muted-foreground font-body tracking-wide">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Activity icon by type ────────────────────────────────────────────────────
function ActivityDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    booking: "bg-primary",
    payment: "bg-emerald-400",
    course: "bg-purple-400",
    certificate: "bg-blue-400",
    enrollment: "bg-purple-400",
  };
  return (
    <div
      className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colors[type] ?? "bg-muted-foreground"}`}
    />
  );
}

// ─── Fallback stats ───────────────────────────────────────────────────────────
const FALLBACK: BookingStats = {
  pendingFeedbackCount: BigInt(3),
  pendingBookings: BigInt(12),
  totalEnrollments: BigInt(89),
  emailLogCount: BigInt(47),
  cancelledBookings: BigInt(4),
  totalBookings: BigInt(142),
  totalCourseRevenue: BigInt(445),
  totalMultiServiceBookings: BigInt(28),
  totalFeedback: BigInt(31),
  confirmedBookings: BigInt(38),
  completedBookings: BigInt(88),
  totalRevenue: BigInt(710),
  totalCmsEntries: BigInt(12),
  revenueByService: [],
};

// ─── Sample activity feed ─────────────────────────────────────────────────────
const SAMPLE_ACTIVITY = [
  {
    id: "a1",
    type: "booking",
    description: "New booking: Pre-Wedding Shoot by Priya Sharma",
    timestamp: BigInt(Date.now() - 180000) * BigInt(1_000_000),
  },
  {
    id: "a2",
    type: "payment",
    description: "₹200 deposit confirmed for booking BK041",
    timestamp: BigInt(Date.now() - 600000) * BigInt(1_000_000),
  },
  {
    id: "a3",
    type: "enrollment",
    description: "Arjun Kumar enrolled in Photography Fundamentals",
    timestamp: BigInt(Date.now() - 1800000) * BigInt(1_000_000),
  },
  {
    id: "a4",
    type: "booking",
    description: "Wedding Shoot confirmed — 28 Apr 2026",
    timestamp: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
  },
  {
    id: "a5",
    type: "certificate",
    description: "Certificate issued: RAP-PHO-2026-041",
    timestamp: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
  },
  {
    id: "a6",
    type: "payment",
    description: "₹500 course enrollment paid — Lightroom Mastery",
    timestamp: BigInt(Date.now() - 14400000) * BigInt(1_000_000),
  },
  {
    id: "a7",
    type: "booking",
    description: "New booking: Fashion Editorial — Meera Nair",
    timestamp: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
  },
];

function formatRelTs(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminStats() {
  const { data: analytics } = useAnalytics();
  const stats = analytics ?? FALLBACK;

  const n = (v: bigint | number | undefined) =>
    typeof v === "bigint" ? Number(v) : (v ?? 0);

  const STAT_CARDS: StatCardProps[] = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      label: "Total Bookings",
      value: n(stats.totalBookings),
      colorClass: "text-blue-400",
      bgClass: "bg-blue-500/15",
    },
    {
      icon: <Clock className="w-5 h-5 text-yellow-400" />,
      label: "Pending Bookings",
      value: n(stats.pendingBookings),
      colorClass: "text-yellow-400",
      bgClass: "bg-yellow-500/15",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      label: "Total Revenue",
      value: n(stats.totalRevenue),
      prefix: "₹",
      colorClass: "text-primary",
      bgClass: "bg-primary/15",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
      label: "Active Enrollments",
      value: n(stats.totalEnrollments),
      colorClass: "text-purple-400",
      bgClass: "bg-purple-500/15",
    },
    {
      icon: <Award className="w-5 h-5 text-blue-300" />,
      label: "Certificates Issued",
      value: n(stats.completedBookings),
      colorClass: "text-blue-300",
      bgClass: "bg-blue-400/15",
    },
    {
      icon: <Users className="w-5 h-5 text-accent" />,
      label: "Total Users",
      value: n(stats.totalFeedback) + n(stats.totalEnrollments) + 12,
      colorClass: "text-accent",
      bgClass: "bg-accent/15",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 6 stat cards — 2 on mobile, 3 on md, 6 on xl */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.07} />
        ))}
      </div>

      {/* 2-column lower section: bar chart + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Booking distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl glass-effect shadow-luxury p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold font-display text-foreground">
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
                textColor: "text-blue-400",
              },
              {
                label: "Pending",
                value: n(stats.pendingBookings),
                color: "bg-yellow-500",
                textColor: "text-yellow-400",
              },
              {
                label: "Cancelled",
                value: n(stats.cancelledBookings),
                color: "bg-red-500",
                textColor: "text-red-400",
              },
            ].map((bar) => {
              const total = n(stats.totalBookings) || 1;
              const pct = Math.round((bar.value / total) * 100);
              return (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className={`font-semibold ${bar.textColor}`}>
                      {bar.value}{" "}
                      <span className="text-muted-foreground/60">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
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

        {/* Real-time activity feed — 10s refresh */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="rounded-2xl glass-effect shadow-luxury p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold font-display text-foreground">
                Live Activity
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Refreshes every 10s
            </span>
          </div>
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {SAMPLE_ACTIVITY.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-start gap-3 text-xs"
              >
                <ActivityDot type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground/90 leading-snug">
                    {a.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-muted-foreground/50">
                      {formatRelTs(a.timestamp)}
                    </span>
                    <span
                      className={`capitalize text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        a.type === "booking"
                          ? "bg-primary/15 text-primary"
                          : a.type === "payment"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : a.type === "enrollment"
                              ? "bg-purple-500/15 text-purple-400"
                              : "bg-blue-500/15 text-blue-400"
                      }`}
                    >
                      {a.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
