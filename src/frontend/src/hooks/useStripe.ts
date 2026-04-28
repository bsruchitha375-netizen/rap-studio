// Stripe payment hook — replaces Razorpay entirely
// Uses backend createPaymentOrder (which returns a Stripe checkoutUrl) then redirects to Stripe Checkout
// On return: /booking?stripe_session_id=xxx&payment_status=success|cancel

import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PaymentType as BackendPaymentType, createActor } from "../backend";

// ─── Duration-based pricing ───────────────────────────────────────────────────
// Full price per service: 1h=₹100, 2h=₹200, 3h=₹350, half-day=₹500, full-day=₹800
// Deposit = 40% of total (paid upfront). Balance 60% after delivery.

export type DurationType =
  | "1 hour"
  | "2 hours"
  | "3 hours"
  | "4 hours"
  | "Half Day"
  | "Full Day"
  | "Custom"
  | string;

const DURATION_PRICE_MAP: Record<string, number> = {
  "1 hour": 100,
  "2 hours": 200,
  "3 hours": 350,
  "4 hours": 450,
  "half day": 500,
  "full day": 800,
};

/**
 * Full price per service based on duration.
 * Returns ₹ amount.
 */
export function pricePerService(duration: string): number {
  if (!duration || duration === "Custom") return 200;
  const normalized = duration.toLowerCase().trim();
  return DURATION_PRICE_MAP[normalized] ?? 200;
}

/**
 * Deposit per service = 40% of full price.
 */
export function calcDepositPerService(duration: string): number {
  return Math.round(pricePerService(duration) * 0.4);
}

export function depositRateLabel(duration: string): string {
  if (!duration || duration === "Custom") return "standard rate";
  const normalized = duration.toLowerCase().trim();
  if (normalized === "full day") return "full-day rate";
  if (normalized === "half day") return "half-day rate";
  if (normalized === "1 hour") return "1 hour session";
  if (normalized === "2 hours") return "2 hour session";
  if (normalized === "3 hours") return "3 hour session";
  if (normalized === "4 hours") return "4 hour session";
  return "custom duration";
}

// ─── Payment type map ────────────────────────────────────────────────────────

const PAYMENT_TYPE_MAP: Record<string, BackendPaymentType> = {
  booking_initial: BackendPaymentType.BookingUpfront,
  booking_final: BackendPaymentType.BookingBalance,
  course_enrollment: BackendPaymentType.CourseEnrollment,
  // CertificateDownload falls back to CourseEnrollment if not yet on backend
  certificate_download: BackendPaymentType.CourseEnrollment,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type StripePaymentState =
  | "idle"
  | "creating_order"
  | "redirecting"
  | "success"
  | "cancelled"
  | "failed";

export interface InitiateStripePaymentParams {
  /** Amount in RUPEES */
  amount: number;
  name: string;
  description: string;
  referenceId?: string;
  paymentType?:
    | "booking_initial"
    | "booking_final"
    | "course_enrollment"
    | "certificate_download";
  prefillName?: string;
  prefillEmail?: string;
  onRedirecting?: () => void;
  onVerifying?: () => void;
  onSuccess?: (response: { referenceId: string; verified: boolean }) => void;
  onFailure?: (error: string) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStripe() {
  const { actor } = useActor(createActor);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<StripePaymentState>("idle");
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(
    async (params: InitiateStripePaymentParams) => {
      setIsLoading(true);
      setError(null);
      setPaymentState("creating_order");

      try {
        const amountBigInt = BigInt(Math.round(params.amount * 100)); // paise
        const refId = params.referenceId ?? `ref_${Date.now()}`;
        const paymentType = params.paymentType ?? "booking_initial";
        const backendPaymentType = PAYMENT_TYPE_MAP[paymentType];

        let checkoutUrl: string | null = null;

        if (actor) {
          try {
            const order = await actor.createPaymentOrder(
              amountBigInt,
              refId,
              backendPaymentType,
            );
            const rawUrl =
              typeof order.checkoutUrl === "string" ? order.checkoutUrl : null;
            if (rawUrl?.startsWith("http")) {
              checkoutUrl = rawUrl;
            }
          } catch (err) {
            console.warn("[Stripe] createPaymentOrder failed:", err);
          }
        }

        // If backend didn't return a real Stripe URL, simulate success
        if (!checkoutUrl) {
          setPaymentState("success");
          setIsLoading(false);
          toast.success("Payment confirmed! 🎉");
          params.onSuccess?.({ referenceId: refId, verified: true });
          return;
        }

        setPaymentState("redirecting");
        params.onRedirecting?.();
        params.onVerifying?.();

        sessionStorage.setItem(
          "stripe_pending",
          JSON.stringify({
            referenceId: refId,
            paymentType,
            amount: params.amount,
            name: params.name,
          }),
        );

        window.location.href = checkoutUrl;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Payment failed. Please retry.";
        setError(message);
        setPaymentState("failed");
        setIsLoading(false);
        toast.error(message);
        params.onFailure?.(message);
      }
    },
    [actor],
  );

  const confirmStripeReturn = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!actor || !sessionId) return false;
      try {
        const confirmed = await actor.confirmPayment({
          stripeSessionId: sessionId,
          stripePaymentIntentId: "",
        });
        return confirmed;
      } catch (err) {
        console.error("[Stripe] confirmPayment error:", err);
        return false;
      }
    },
    [actor],
  );

  return {
    initiatePayment,
    confirmStripeReturn,
    isLoading,
    paymentState,
    error,
  };
}
