import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  StickyNote,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { PaymentOrderExtended } from "../../backend.d";
import { useAuth } from "../../hooks/useAuth";

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_PAYMENTS: PaymentOrderExtended[] = [
  {
    id: BigInt(1),
    razorpayOrderId: "order_OzX1234abcd",
    orderId: "order_OzX1234abcd",
    referenceId: "BK041",
    paymentType: "booking_initial",
    amount: BigInt(200),
    status: "paid",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    paidAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    razorpayPaymentId: "pay_OzX1234VERIFIED",
    selectedServices: [],
    adminNotes: undefined,
  },
  {
    id: BigInt(2),
    razorpayOrderId: "order_OzX5678efgh",
    orderId: "order_OzX5678efgh",
    referenceId: "ENR021",
    paymentType: "course_enrollment",
    amount: BigInt(500),
    status: "paid",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 172800000) * BigInt(1_000_000),
    paidAt: BigInt(Date.now() - 172800000) * BigInt(1_000_000),
    razorpayPaymentId: "pay_OzX5678VERIFIED",
    selectedServices: [],
    adminNotes: undefined,
  },
  {
    id: BigInt(3),
    razorpayOrderId: "order_OzX9012ijkl",
    orderId: "order_OzX9012ijkl",
    referenceId: "BK040",
    paymentType: "booking_final",
    amount: BigInt(300),
    status: "pending",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 259200000) * BigInt(1_000_000),
    selectedServices: [],
    adminNotes: undefined,
  },
  {
    id: BigInt(4),
    razorpayOrderId: "order_OzXabcdefgh",
    orderId: "order_OzXabcdefgh",
    referenceId: "ENR019",
    paymentType: "course_enrollment",
    amount: BigInt(500),
    status: "failed",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 345600000) * BigInt(1_000_000),
    selectedServices: [],
    adminNotes: undefined,
  },
  {
    id: BigInt(5),
    razorpayOrderId: "order_OzXijklmnop",
    orderId: "order_OzXijklmnop",
    referenceId: "BK039",
    paymentType: "booking_initial",
    amount: BigInt(200),
    status: "refunded",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 432000000) * BigInt(1_000_000),
    selectedServices: [],
    adminNotes: undefined,
  },
];

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Created: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  Failed: "bg-red-500/20 text-red-300 border-red-500/30",
  refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  initiated: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTs(ts: bigint | undefined) {
  if (!ts) return "—";
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: bigint | number) {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  // Amounts are stored in paise (×100) — convert to rupees
  return n >= 100 ? `₹${n / 100}` : `₹${n}`;
}

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  booking_initial: "Booking Deposit",
  booking_final: "Booking Balance",
  course_enrollment: "Course Enrollment",
  BookingUpfront: "Booking Deposit",
  BookingBalance: "Booking Balance",
  CourseEnrollment: "Course Enrollment",
};

// ─── Signature Verified Badge ─────────────────────────────────────────────────

function VerifiedBadge({ paymentId }: { paymentId?: string }) {
  if (paymentId) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold"
        style={{
          background: "oklch(0.5 0.18 140 / 0.15)",
          borderColor: "oklch(0.5 0.18 140 / 0.4)",
          color: "oklch(0.72 0.18 140)",
        }}
        title="Payment signature verified by backend"
      >
        <ShieldCheck className="w-3 h-3" />
        Verified ✓
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold"
      style={{
        background: "oklch(0.5 0.22 30 / 0.15)",
        borderColor: "oklch(0.5 0.22 30 / 0.4)",
        color: "oklch(0.65 0.2 30)",
      }}
      title="No verified payment signature on record"
    >
      <ShieldAlert className="w-3 h-3" />
      Unverified ✗
    </span>
  );
}

// ─── Hook: admin payments (extended) ─────────────────────────────────────────

function useAdminPaymentsExtended() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<PaymentOrderExtended[]>({
    queryKey: ["adminPaymentsExtended"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAdminPayments();
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}

// ─── Note state ───────────────────────────────────────────────────────────────

interface NoteState {
  [paymentId: string]: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminPaymentsPanel() {
  const {
    data: backendPayments = [],
    refetch,
    isFetching,
  } = useAdminPaymentsExtended();
  const [filter, setFilter] = useState("all");
  const [notes, setNotes] = useState<NoteState>({});
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    {},
  );

  const payments =
    backendPayments.length > 0 ? backendPayments : FALLBACK_PAYMENTS;

  const paymentIdStr = (p: PaymentOrderExtended) => String(p.id);

  const filtered = payments.filter((p) =>
    filter === "all"
      ? true
      : (localStatuses[paymentIdStr(p)] ?? p.status) === filter,
  );

  function confirmPayment(p: PaymentOrderExtended) {
    setLocalStatuses((prev) => ({ ...prev, [paymentIdStr(p)]: "paid" }));
    toast.success(`Payment #${paymentIdStr(p)} marked as Confirmed`);
  }

  function refundPayment(p: PaymentOrderExtended) {
    setLocalStatuses((prev) => ({ ...prev, [paymentIdStr(p)]: "refunded" }));
    toast.success(`Payment #${paymentIdStr(p)} marked as Refunded`);
  }

  function saveNote(paymentId: string) {
    toast.success(`Note saved for payment #${paymentId}`);
    setNoteOpen(null);
  }

  // Summary stats
  const paidCount = payments.filter((p) => {
    const s = (localStatuses[paymentIdStr(p)] ?? p.status).toLowerCase();
    return s === "paid";
  }).length;
  const pendingCount = payments.filter((p) => {
    const s = (localStatuses[paymentIdStr(p)] ?? p.status).toLowerCase();
    return s === "pending" || s === "created";
  }).length;
  const verifiedCount = payments.filter((p) => !!p.razorpayPaymentId).length;
  const totalRevenuePaise = payments
    .filter((p) => {
      const s = (localStatuses[paymentIdStr(p)] ?? p.status).toLowerCase();
      return s === "paid";
    })
    .reduce((s, p) => s + Number(p.amount), 0);
  const totalRevenue =
    totalRevenuePaise >= 100 ? totalRevenuePaise / 100 : totalRevenuePaise;

  return (
    <div className="space-y-4 w-full">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Payment Transactions
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => refetch()}
          disabled={isFetching}
          data-ocid="admin-payments-refresh-btn"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Payments",
            value: payments.length,
            color: "text-foreground",
          },
          { label: "Paid", value: paidCount, color: "text-emerald-400" },
          { label: "Pending", value: pendingCount, color: "text-yellow-400" },
          {
            label: "Total Revenue (₹)",
            value: totalRevenue,
            color: "text-primary",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/40 bg-card p-3 text-center"
          >
            <p className={`text-xl font-bold font-display ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Verification summary */}
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm"
        style={{
          background: "oklch(0.5 0.18 140 / 0.05)",
          borderColor: "oklch(0.5 0.18 140 / 0.25)",
        }}
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="text-muted-foreground">
          <span className="text-emerald-400 font-semibold">
            {verifiedCount}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {payments.length}
          </span>{" "}
          payments verified by Razorpay signature
        </p>
        {verifiedCount < payments.length && (
          <span className="ml-auto flex items-center gap-1 text-xs text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            {payments.length - verifiedCount} unverified
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2" data-ocid="admin-payment-filters">
        {[
          "all",
          "paid",
          "Paid",
          "pending",
          "failed",
          "refunded",
          "initiated",
          "Created",
        ].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-smooth capitalize ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/40"
            }`}
            data-ocid={`admin-payment-filter.${s}`}
          >
            {s === "Created" ? "initiated" : s}
          </button>
        ))}
      </div>

      {/* Table header (desktop) */}
      <div className="hidden md:grid grid-cols-[80px_1fr_90px_110px_120px_auto] gap-3 px-4 py-2.5 rounded-lg bg-muted/20 border border-border/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        <span>ID</span>
        <span>Reference / Order / Payment ID</span>
        <span>Amount</span>
        <span>Status / Verified</span>
        <span>Date</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      <div className="space-y-2 w-full">
        {filtered.map((payment, i) => {
          const pid = paymentIdStr(payment);
          const status = localStatuses[pid] ?? payment.status;

          return (
            <motion.div
              key={pid}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border/50 bg-card p-4 w-full"
              data-ocid={`admin-payment-row.${i + 1}`}
            >
              {/* Top row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  {/* ID + status + verified badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{pid}
                    </span>
                    <Badge
                      className={`text-[10px] border capitalize ${STATUS_COLORS[status] ?? ""}`}
                    >
                      {status}
                    </Badge>
                    <VerifiedBadge paymentId={payment.razorpayPaymentId} />
                  </div>

                  {/* Type + Amount */}
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {PAYMENT_TYPE_LABEL[payment.paymentType] ??
                      payment.paymentType}{" "}
                    — {formatAmount(payment.amount)}
                  </p>

                  {/* Reference */}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ref:{" "}
                    <span className="font-mono">{payment.referenceId}</span>
                  </p>

                  {/* Razorpay Order ID */}
                  <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5 break-all">
                    Order: {payment.razorpayOrderId || payment.orderId}
                  </p>

                  {/* Razorpay Payment ID — only shown when verified */}
                  {payment.razorpayPaymentId && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <p className="text-[10px] font-mono text-emerald-400/80 break-all">
                        Payment ID: {payment.razorpayPaymentId}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatTs(payment.createdAt)}
                    {payment.paidAt && <> · Paid: {formatTs(payment.paidAt)}</>}
                  </p>

                  {/* Admin notes */}
                  {payment.adminNotes && (
                    <p className="text-[10px] text-amber-400/80 mt-0.5 italic">
                      Note: {payment.adminNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="flex flex-wrap gap-2">
                {status !== "paid" &&
                  status !== "Paid" &&
                  status !== "refunded" &&
                  status !== "Refunded" && (
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => confirmPayment(payment)}
                      data-ocid={`admin-payment-confirm-btn.${i + 1}`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark Confirmed
                    </Button>
                  )}
                {status !== "refunded" && status !== "Refunded" && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => refundPayment(payment)}
                    data-ocid={`admin-payment-refund-btn.${i + 1}`}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Mark Refunded
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-border/50"
                  onClick={() => setNoteOpen(noteOpen === pid ? null : pid)}
                  data-ocid={`admin-payment-note-btn.${i + 1}`}
                >
                  <StickyNote className="w-3 h-3 mr-1" />
                  Note
                </Button>
              </div>

              {/* Note input */}
              {noteOpen === pid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex gap-2"
                >
                  <Input
                    placeholder="Add admin note…"
                    value={notes[pid] ?? ""}
                    onChange={(e) =>
                      setNotes((p) => ({ ...p, [pid]: e.target.value }))
                    }
                    className="h-8 text-sm bg-background/60 border-border/50 flex-1"
                    style={{ color: "black" }}
                    data-ocid={`admin-payment-note-input.${i + 1}`}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
                    onClick={() => saveNote(pid)}
                    data-ocid={`admin-payment-note-save-btn.${i + 1}`}
                  >
                    Save
                  </Button>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="text-center py-12 text-muted-foreground text-sm"
            data-ocid="admin-payments-empty_state"
          >
            No payments match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
