import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Hash } from "lucide-react";
import { motion } from "motion/react";
import type { PaymentOrder, PaymentStatus, PaymentType } from "../../types";

interface PaymentCardProps {
  payment: PaymentOrder;
  index?: number;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  initiated: {
    label: "Initiated",
    className: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaymentCard({ payment, index = 0 }: PaymentCardProps) {
  const statusCfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
  const typeLabel = TYPE_LABELS[payment.paymentType] ?? payment.paymentType;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4 hover:border-primary/30 transition-smooth"
      data-ocid="payment-card"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
        <CreditCard className="w-5 h-5 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-foreground">
            {typeLabel}
          </span>
          <Badge className={`text-xs border ${statusCfg.className}`}>
            {statusCfg.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(payment.createdAt)}
          </span>
          {payment.razorpayOrderId && (
            <span className="flex items-center gap-1 font-mono">
              <Hash className="w-3 h-3" />
              <span className="truncate max-w-32">
                {payment.razorpayOrderId}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-bold text-primary">₹{payment.amount}</p>
        {payment.paidAt && (
          <p className="text-[10px] text-emerald-400">
            Paid {formatDate(payment.paidAt)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
