import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  type InitiatePaymentParams,
  useRazorpay,
} from "../../hooks/useRazorpay";

interface RazorpayButtonProps {
  /** Amount in RUPEES */
  amount: number;
  label: string;
  referenceId: string;
  paymentType: "booking_initial" | "booking_final" | "course_enrollment";
  description?: string;
  prefillName?: string;
  onSuccess?: InitiatePaymentParams["onSuccess"];
  onFailure?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RazorpayButton({
  amount,
  label,
  referenceId,
  paymentType,
  description,
  prefillName,
  onSuccess,
  onFailure,
  disabled = false,
  className,
}: RazorpayButtonProps) {
  const { initiatePayment, isLoading } = useRazorpay();
  const [attempted, setAttempted] = useState(false);

  const handleClick = async () => {
    setAttempted(true);
    await initiatePayment({
      amount, // Rupees — hook converts to paise internally
      name: label,
      referenceId,
      paymentType,
      description: description ?? label,
      prefillName,
      onSuccess,
      onFailure,
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className ?? "btn-primary-luxury"}
      data-ocid={`razorpay-btn-${paymentType}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {label} — ₹{amount.toFixed(2)}
        </>
      )}
      {attempted && !isLoading && null}
    </Button>
  );
}
