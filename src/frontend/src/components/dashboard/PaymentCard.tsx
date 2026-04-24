import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, CreditCard, Hash, XCircle } from "lucide-react";
import { motion } from "motion/react";
import type { PaymentOrder, PaymentStatus, PaymentType } from "../../types";

interface PaymentCardProps {
  payment: PaymentOrder;
  index?: number;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    icon: <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />,
  },
  initiated: {
    label: "Initiated",
    className: "bg-blue-400/20 text-blue-300 border-blue-400/30",
    icon: <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
    icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: <span className="w-2 h-2 rounded-full bg-purple-400" />,
  },
};

const TYPE_LABELS: Record<PaymentType, string> = {
  booking_initial: "Booking Deposit",
  booking_final: "Booking Balance",
  course_enrollment: "Course Enrollment",
};

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(a: number): string {
  // amounts may be stored in paise
  const val = a >= 100 ? a / 100 : a;
  return `₹${val.toLocaleString("en-IN")}`;
}

export function PaymentCard({ payment, index = 0 }: PaymentCardProps) {
  const statusCfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
  const typeLabel = TYPE_LABELS[payment.paymentType] ?? payment.paymentType;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4 hover:border-primary/30 transition-smooth shadow-subtle"
      data-ocid={`payment-card.${index + 1}`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          payment.status === "paid"
            ? "bg-emerald-500/15 border border-emerald-500/25"
            : payment.status === "failed"
              ? "bg-red-500/15 border border-red-500/25"
              : "bg-primary/10 border border-primary/20"
        }`}
      >
        <CreditCard
          className={`w-5 h-5 ${
            payment.status === "paid"
              ? "text-emerald-400"
              : payment.status === "failed"
                ? "text-red-400"
                : "text-primary"
          }`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-foreground">
            {typeLabel}
          </span>
          <Badge className={`text-[10px] border ${statusCfg.className}`}>
            <span className="flex items-center gap-1">
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(payment.createdAt)}
          </span>
          {(payment.razorpayOrderId ?? payment.stripeSessionId) && (
            <span className="flex items-center gap-1 font-mono">
              <Hash className="w-3 h-3" />
              <span className="truncate max-w-28">
                {payment.razorpayOrderId ?? payment.stripeSessionId}
              </span>
            </span>
          )}
          <span className="font-mono text-[10px] text-muted-foreground/50">
            Ref: {payment.referenceId}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p
          className={`text-lg font-bold font-display ${
            payment.status === "paid"
              ? "text-emerald-400"
              : payment.status === "failed"
                ? "text-red-400"
                : "text-primary"
          }`}
        >
          {formatAmount(payment.amount)}
        </p>
        {payment.paidAt && (
          <p className="text-[10px] text-emerald-400/70 mt-0.5">
            Paid {formatDate(payment.paidAt)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
