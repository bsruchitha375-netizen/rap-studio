import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { BookingStats } from "../../types";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  color: string;
  delay?: number;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  color,
  delay = 0,
}: StatCardProps) {
  const displayed = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="w-full rounded-xl border border-border/50 bg-card p-5 hover:border-primary/30 transition-smooth"
      data-ocid="admin-stat-card"
    >
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold font-display text-foreground">
        {prefix}
        {displayed.toLocaleString("en-IN")}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

interface AdminStatsProps {
  stats: BookingStats;
}

export function AdminStats({ stats }: AdminStatsProps) {
  const STAT_CARDS: Array<Omit<StatCardProps, "delay">> = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      label: "Total Bookings",
      value: stats.totalBookings,
      color: "bg-blue-500/15",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      label: "Confirmed Bookings",
      value: stats.confirmedBookings,
      color: "bg-emerald-500/15",
    },
    {
      icon: <Clock className="w-5 h-5 text-yellow-400" />,
      label: "Pending Bookings",
      value: stats.pendingBookings,
      color: "bg-yellow-500/15",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      label: "Total Revenue",
      value: stats.totalRevenue,
      prefix: "₹",
      color: "bg-primary/15",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
      label: "Course Enrollments",
      value: stats.totalCourseEnrollments,
      color: "bg-purple-500/15",
    },
    {
      icon: <Users className="w-5 h-5 text-accent" />,
      label: "Total Users",
      value: stats.totalStudents,
      color: "bg-accent/15",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Stats grid — full width, 2 cols on mobile, 3 on md, 4 on lg */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* Revenue bar */}
      {stats.totalRevenue > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Booking Status Distribution
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Completed",
                value: stats.completedBookings,
                max: stats.totalBookings,
                color: "bg-primary",
              },
              {
                label: "Confirmed",
                value: stats.confirmedBookings,
                max: stats.totalBookings,
                color: "bg-blue-500",
              },
              {
                label: "Pending",
                value: stats.pendingBookings,
                max: stats.totalBookings,
                color: "bg-yellow-500",
              },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{bar.label}</span>
                  <span className="text-foreground font-medium">
                    {bar.value}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${bar.max > 0 ? (bar.value / bar.max) * 100 : 0}%`,
                    }}
                    transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                    className={`h-full rounded-full ${bar.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">{a.description}</p>
                  <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                    {new Date(Number(a.timestamp) / 1_000_000).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <span className="text-muted-foreground/50 capitalize bg-muted/30 px-1.5 py-0.5 rounded flex-shrink-0">
                  {a.type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
