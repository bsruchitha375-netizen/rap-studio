import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Edit3,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { PaymentOrderExtended } from "../../backend.d";
import { useAuth } from "../../hooks/useAuth";

// ─── Enriched type ────────────────────────────────────────────────────────────
interface AdminPaymentEntry extends PaymentOrderExtended {
  clientName?: string;
  serviceNames?: string[];
}

// ─── Data hook — getAdminPaymentDashboard or fallback ────────────────────────
function useAdminPaymentDashboard() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<AdminPaymentEntry[]>({
    queryKey: ["adminPaymentDashboard"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const raw = await actor.getAdminPayments();
        return raw as AdminPaymentEntry[];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    refetchInterval: 30_000,
    staleTime: 25_000,
    initialData: [],
  });
}

// ─── Fallback data ────────────────────────────────────────────────────────────
const FALLBACK: AdminPaymentEntry[] = [
  {
    id: BigInt(1),
    orderId: "order_XA1",
    razorpayOrderId: "order_XA1",
    referenceId: "BK041",
    paymentType: "booking_initial",
    amount: BigInt(200),
    status: "Paid",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    paidAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    razorpayPaymentId: "pay_VERIFIED_1",
    selectedServices: [],
    clientName: "Priya Sharma",
    serviceNames: ["Wedding Shoot"],
  },
  {
    id: BigInt(2),
    orderId: "order_XA2",
    razorpayOrderId: "order_XA2",
    referenceId: "ENR021",
    paymentType: "course_enrollment",
    amount: BigInt(500),
    status: "Paid",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 172800000) * BigInt(1_000_000),
    paidAt: BigInt(Date.now() - 172800000) * BigInt(1_000_000),
    razorpayPaymentId: "pay_VERIFIED_2",
    selectedServices: [],
    clientName: "Arjun Kumar",
    serviceNames: ["Photography Fundamentals"],
  },
  {
    id: BigInt(3),
    orderId: "order_XA3",
    razorpayOrderId: "order_XA3",
    referenceId: "BK040",
    paymentType: "booking_final",
    amount: BigInt(300),
    status: "Created",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 259200000) * BigInt(1_000_000),
    selectedServices: [],
    clientName: "Meera Nair",
    serviceNames: ["Fashion Editorial"],
  },
  {
    id: BigInt(4),
    orderId: "order_XA4",
    razorpayOrderId: "order_XA4",
    referenceId: "ENR019",
    paymentType: "course_enrollment",
    amount: BigInt(500),
    status: "Failed",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 345600000) * BigInt(1_000_000),
    selectedServices: [],
    clientName: "Deepa Iyer",
    serviceNames: ["Wedding Cinematography"],
  },
  {
    id: BigInt(5),
    orderId: "order_XA5",
    razorpayOrderId: "order_XA5",
    referenceId: "BK039",
    paymentType: "booking_initial",
    amount: BigInt(200),
    status: "Refunded",
    currency: "INR",
    userId: {} as never,
    createdAt: BigInt(Date.now() - 432000000) * BigInt(1_000_000),
    selectedServices: [],
    clientName: "Sanya Kapoor",
    serviceNames: ["Corporate Headshots"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Created: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Failed: "bg-red-500/20 text-red-300 border-red-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  Refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  initiated: "bg-blue-400/20 text-blue-300 border-blue-400/30",
};

const TYPE_LABELS: Record<string, string> = {
  booking_initial: "Booking Deposit",
  booking_final: "Booking Balance",
  course_enrollment: "Course Enrollment",
  BookingUpfront: "Booking Deposit",
  BookingBalance: "Booking Balance",
  CourseEnrollment: "Course Enrollment",
};

function formatTs(ts: bigint | undefined) {
  if (!ts) return "—";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(a: bigint | number) {
  const n = typeof a === "bigint" ? Number(a) : a;
  return n >= 100 ? `₹${(n / 100).toLocaleString("en-IN")}` : `₹${n}`;
}

function isPaid(s: string) {
  return s === "paid" || s === "Paid";
}
function isPending(s: string) {
  return ["pending", "Created", "initiated"].includes(s);
}
function isRefunded(s: string) {
  return s === "refunded" || s === "Refunded";
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────
type ActionType = "confirm" | "refund" | "adjust";

interface ActionDialogProps {
  open: boolean;
  type: ActionType;
  paymentId: string;
  onClose: () => void;
  onSubmit: (note: string, newAmount?: number) => void;
}

function ActionDialog({
  open,
  type,
  paymentId,
  onClose,
  onSubmit,
}: ActionDialogProps) {
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit() {
    onSubmit(note, type === "adjust" && amount ? Number(amount) : undefined);
    setNote("");
    setAmount("");
  }

  const titles: Record<ActionType, string> = {
    confirm: "Confirm Payment",
    refund: "Refund Payment",
    adjust: "Adjust Amount",
  };
  const descs: Record<ActionType, string> = {
    confirm: `Mark payment #${paymentId} as confirmed. This will unlock the associated booking/enrollment.`,
    refund: `Issue a refund for payment #${paymentId}. This action cannot be undone.`,
    adjust: `Set a new amount for payment #${paymentId}. The client will be notified.`,
  };
  const icons: Record<ActionType, React.ReactNode> = {
    confirm: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    refund: <AlertTriangle className="w-5 h-5 text-red-400" />,
    adjust: <Edit3 className="w-5 h-5 text-yellow-400" />,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="glass-effect border-border/50 shadow-elevated max-w-md"
        data-ocid="payment-action-dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            {icons[type]}
            <DialogTitle className="font-display text-foreground">
              {titles[type]}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            {descs[type]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {type === "adjust" && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                New Amount (₹)
              </Label>
              <Input
                type="number"
                placeholder="Enter new amount in rupees"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-sm"
                data-ocid="payment-adjust-amount-input"
              />
            </div>
          )}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {type === "refund"
                ? "Reason for refund"
                : "Admin notes (optional)"}
            </Label>
            <Input
              placeholder={
                type === "refund"
                  ? "Describe the reason..."
                  : "Add internal notes..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm"
              data-ocid="payment-action-note-input"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/50 text-sm"
              onClick={onClose}
              data-ocid="payment-action-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={`flex-1 text-sm ${
                type === "confirm"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : type === "refund"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }`}
              onClick={handleSubmit}
              data-ocid="payment-action-confirm-btn"
            >
              {titles[type]}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export function AdminPaymentsPanel() {
  const { data: raw = [], refetch, isFetching } = useAdminPaymentDashboard();
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  const [filter, setFilter] = useState("all");
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: ActionType;
    payment: AdminPaymentEntry | null;
  }>({
    open: false,
    type: "confirm",
    payment: null,
  });
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    {},
  );

  const payments = raw.length > 0 ? raw : FALLBACK;
  const filtered = payments.filter((p) => {
    if (filter === "all") return true;
    const s = localStatuses[String(p.id)] ?? p.status;
    return s.toLowerCase() === filter.toLowerCase();
  });

  function openDialog(type: ActionType, payment: AdminPaymentEntry) {
    setDialog({ open: true, type, payment });
  }
  function closeDialog() {
    setDialog((d) => ({ ...d, open: false, payment: null }));
  }

  async function handleAction(note: string, newAmount?: number) {
    const p = dialog.payment;
    if (!p) return;
    const pid = String(p.id);

    try {
      if (actor) {
        if (dialog.type === "confirm") {
          await actor.adminUpdatePayment(
            p.id,
            { __kind__: "confirm", confirm: null },
            note || null,
          );
          setLocalStatuses((prev) => ({ ...prev, [pid]: "Paid" }));
          toast.success(`Payment #${pid} confirmed successfully`);
        } else if (dialog.type === "refund") {
          await actor.adminUpdatePayment(
            p.id,
            { __kind__: "refund", refund: null },
            note || null,
          );
          setLocalStatuses((prev) => ({ ...prev, [pid]: "Refunded" }));
          toast.success(`Payment #${pid} refunded`);
        } else if (dialog.type === "adjust" && newAmount !== undefined) {
          await actor.adminUpdatePayment(
            p.id,
            { __kind__: "adjustAmount", adjustAmount: BigInt(newAmount * 100) },
            note || null,
          );
          toast.success(`Amount adjusted to ₹${newAmount} for payment #${pid}`);
        }
        queryClient.invalidateQueries({ queryKey: ["adminPaymentDashboard"] });
      } else {
        if (dialog.type === "confirm")
          setLocalStatuses((prev) => ({ ...prev, [pid]: "Paid" }));
        if (dialog.type === "refund")
          setLocalStatuses((prev) => ({ ...prev, [pid]: "Refunded" }));
        toast.success(`Action applied to payment #${pid}`);
      }
    } catch {
      toast.error("Action failed. Please try again.");
    }

    closeDialog();
  }

  // Summary
  const paidCount = payments.filter((p) =>
    isPaid(localStatuses[String(p.id)] ?? p.status),
  ).length;
  const pendingCount = payments.filter((p) =>
    isPending(localStatuses[String(p.id)] ?? p.status),
  ).length;
  const failedCount = payments.filter(
    (p) => (localStatuses[String(p.id)] ?? p.status).toLowerCase() === "failed",
  ).length;
  const totalRevenue = payments
    .filter((p) => isPaid(localStatuses[String(p.id)] ?? p.status))
    .reduce((s, p) => s + Number(p.amount), 0);

  const FILTERS = ["all", "Paid", "Created", "Failed", "Refunded"];

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Payment Transactions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-refreshes every 30 seconds
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 border-border/50"
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
          { label: "Total", value: payments.length, color: "text-foreground" },
          { label: "Paid", value: paidCount, color: "text-emerald-400" },
          { label: "Pending", value: pendingCount, color: "text-yellow-400" },
          {
            label: "Revenue",
            value: totalRevenue >= 100 ? totalRevenue / 100 : totalRevenue,
            prefix: "₹",
            color: "text-primary",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl glass-effect p-3 text-center"
            data-ocid="admin-payment-summary-card"
          >
            <p className={`text-2xl font-bold font-display ${s.color}`}>
              {s.prefix ?? ""}
              {s.value.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2" data-ocid="admin-payment-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-smooth capitalize ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/40"
            }`}
            data-ocid={`admin-payment-filter.${f.toLowerCase()}`}
          >
            {f}
          </button>
        ))}
        {failedCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-red-400 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            {failedCount} failed
          </span>
        )}
      </div>

      {/* Table header (desktop) */}
      <div className="hidden lg:grid grid-cols-[60px_1fr_140px_120px_100px_110px_auto] gap-3 px-4 py-2.5 rounded-xl bg-muted/20 border border-border/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <span>ID</span>
        <span>Client / Service</span>
        <span>Order Ref</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Date</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      <div className="space-y-2 w-full">
        {filtered.map((payment, i) => {
          const pid = String(payment.id);
          const status = localStatuses[pid] ?? payment.status;
          const verified = !!payment.razorpayPaymentId;

          return (
            <motion.div
              key={pid}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl glass-effect hover:border-primary/30 shadow-subtle p-4 w-full transition-smooth"
              data-ocid={`admin-payment-row.${i + 1}`}
            >
              {/* Mobile layout — stacked */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-muted-foreground/70">
                      #{pid}
                    </span>
                    <Badge
                      className={`text-[10px] border ${STATUS_COLORS[status] ?? "bg-muted/40 text-foreground border-border/30"}`}
                    >
                      {status}
                    </Badge>
                    {verified && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Client + Service */}
                  {payment.clientName && (
                    <p className="text-sm font-semibold text-foreground">
                      {payment.clientName}
                      {payment.serviceNames?.length
                        ? ` — ${payment.serviceNames[0]}`
                        : ""}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-0.5">
                    {TYPE_LABELS[payment.paymentType] ?? payment.paymentType}
                    {" • "}
                    <span className="font-mono">{payment.referenceId}</span>
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-lg font-bold font-display text-primary">
                      {formatAmount(payment.amount)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      Created: {formatTs(payment.createdAt)}
                      {payment.paidAt
                        ? ` · Paid: ${formatTs(payment.paidAt)}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {isPending(status) && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => openDialog("confirm", payment)}
                    data-ocid={`admin-payment-confirm-btn.${i + 1}`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirm
                  </Button>
                )}
                {isPaid(status) && !isRefunded(status) && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => openDialog("refund", payment)}
                    data-ocid={`admin-payment-refund-btn.${i + 1}`}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Refund
                  </Button>
                )}
                {!isRefunded(status) && !isPaid(status) && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => openDialog("adjust", payment)}
                    data-ocid={`admin-payment-adjust-btn.${i + 1}`}
                  >
                    <IndianRupee className="w-3 h-3 mr-1" />
                    Adjust
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border/30 bg-card"
            data-ocid="admin-payments-empty_state"
          >
            No payments match this filter.
          </div>
        )}
      </div>

      {/* Action dialog */}
      {dialog.payment && (
        <ActionDialog
          open={dialog.open}
          type={dialog.type}
          paymentId={String(dialog.payment.id)}
          onClose={closeDialog}
          onSubmit={handleAction}
        />
      )}
    </div>
  );
}
