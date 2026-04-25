import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Check,
  CreditCard,
  GraduationCap,
  Info,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../../backend";
import type { NotificationRecord } from "../../backend.d";
import { getAdminSession, useAuth } from "../../hooks/useAuth";

// ─── Hook — 5s polling ────────────────────────────────────────────────────────
function useAdminNotifications() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();
  const adminSession = getAdminSession();
  const isAdmin = !!adminSession || isAuthenticated;

  return useQuery<NotificationRecord[]>({
    queryKey: ["adminNotifications"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyNotifications();
      } catch {
        return [];
      }
    },
    enabled: isAdmin && !!actor && !isFetching,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    staleTime: 4_000,
    initialData: [],
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRelTs(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function notifTypeConfig(type: string): {
  icon: React.ReactNode;
  color: string;
} {
  switch (type) {
    case "BookingConfirmed":
    case "BookingCompleted":
    case "BookingReminder":
    case "WorkDelivered":
      return {
        icon: <BookOpen className="w-3.5 h-3.5" />,
        color:
          "text-primary bg-primary/15 dark:text-primary dark:bg-primary/15",
      };
    case "PaymentReceipt":
      return {
        icon: <CreditCard className="w-3.5 h-3.5" />,
        color:
          "text-emerald-600 bg-emerald-500/15 dark:text-emerald-400 dark:bg-emerald-500/15",
      };
    case "CourseEnrolled":
    case "CourseCompleted":
      return {
        icon: <GraduationCap className="w-3.5 h-3.5" />,
        color:
          "text-purple-600 bg-purple-500/15 dark:text-purple-400 dark:bg-purple-500/15",
      };
    default:
      return {
        icon: <Info className="w-3.5 h-3.5" />,
        color: "text-foreground/70 bg-muted/50",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data: backendNotifs = [], isLoading } = useAdminNotifications();
  const { actor } = useActor(createActor);

  const notifications = backendNotifs;
  const unread = notifications.filter(
    (n) => !n.read && !readIds.has(String(n.id)),
  ).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkAllRead() {
    const ids = new Set(notifications.map((n) => String(n.id)));
    setReadIds(ids);
    if (actor) {
      for (const n of notifications) {
        if (!n.read) {
          try {
            await actor.markNotificationRead(n.id);
          } catch {
            /* noop */
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative hover:bg-primary/10 transition-smooth"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        data-ocid="notification-bell"
      >
        <Bell className="w-5 h-5 text-foreground" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 rounded-2xl bg-card border border-border shadow-elevated z-50 overflow-hidden"
            style={{ width: "22rem" }}
            data-ocid="notification-dropdown"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold font-display text-sm text-foreground">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 dark:text-primary">
                    {unread} new
                  </Badge>
                )}
                <span className="text-[9px] text-muted-foreground/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  5s
                </span>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"
                  data-ocid="notifications-empty_state"
                >
                  <Bell className="w-8 h-8 opacity-40" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60">
                    New activity will appear here
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n, i) => {
                    const isRead = n.read || readIds.has(String(n.id));
                    const { icon, color } = notifTypeConfig(
                      String(n.notificationType),
                    );
                    return (
                      <motion.div
                        key={String(n.id)}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`px-4 py-3 border-b border-border/40 last:border-b-0 hover:bg-muted/20 transition-colors ${!isRead ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}
                          >
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {(n.message ?? "").slice(0, 50)}
                              </p>
                              {!isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {n.message ?? ""}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {formatRelTs(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border bg-muted/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={handleMarkAllRead}
                  data-ocid="mark-all-read-btn"
                >
                  <Check className="w-3 h-3 mr-1.5" />
                  Mark all as read
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
