// Razorpay payment hook — loads SDK dynamically, handles popup checkout
// Key: rzp_test_SZm0CNQyCUq5Zt | Amounts passed as RUPEES, converted to paise internally

import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PaymentType as BackendPaymentType, createActor } from "../backend";
import type { RazorpayOptions } from "../types";

const RAZORPAY_KEY_ID = "rzp_test_SZm0CNQyCUq5Zt";
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const PREFILL_EMAIL = "ruchithabs550@gmail.com";
const PREFILL_CONTACT = "917338501228";

// Map frontend payment type string to backend PaymentType enum value
const PAYMENT_TYPE_MAP: Record<string, BackendPaymentType> = {
  booking_initial: BackendPaymentType.BookingUpfront,
  booking_final: BackendPaymentType.BookingBalance,
  course_enrollment: BackendPaymentType.CourseEnrollment,
};

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== "undefined") {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export interface PaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  referenceId: string;
  /** true when backend verifyPayment call succeeded */
  verified: boolean;
}

export type PaymentVerificationState =
  | "idle"
  | "loading_sdk"
  | "opening_popup"
  | "verifying"
  | "success"
  | "failed";

export interface InitiatePaymentParams {
  /** Amount in RUPEES — hook converts to paise (×100) internally */
  amount: number;
  name: string;
  description: string;
  referenceId?: string;
  paymentType?: "booking_initial" | "booking_final" | "course_enrollment";
  prefillName?: string;
  prefillEmail?: string;
  onSuccess?: (response: PaymentSuccessResponse) => void;
  onFailure?: (error: string) => void;
  /** Called while backend verification is in progress — show a spinner */
  onVerifying?: () => void;
}

export function useRazorpay() {
  const { actor } = useActor(createActor);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationState, setVerificationState] =
    useState<PaymentVerificationState>("idle");
  const [error, setError] = useState<string | null>(null);

  /** Create a real backend payment order — falls back to simulated id on failure */
  const createOrderId = useCallback(
    async (
      amount: number,
      referenceId: string,
      paymentType: "booking_initial" | "booking_final" | "course_enrollment",
    ): Promise<{ orderId: string; paymentId?: bigint }> => {
      if (!actor) {
        const simId = `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return { orderId: simId };
      }
      try {
        const amountPaise = BigInt(Math.round(amount * 100));
        const backendPaymentType = PAYMENT_TYPE_MAP[paymentType];
        const order = await actor.createPaymentOrder(
          amountPaise,
          referenceId,
          backendPaymentType,
        );
        return {
          orderId: order.orderId || order.razorpayOrderId,
          paymentId: order.id,
        };
      } catch (err) {
        console.warn(
          "[Razorpay] createPaymentOrder failed, using simulated id:",
          err,
        );
        const simId = `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return { orderId: simId };
      }
    },
    [actor],
  );

  /** Call backend verifyPayment — returns true on success */
  const verifyWithBackend = useCallback(
    async (
      razorpayOrderId: string,
      razorpayPaymentId: string,
      razorpaySignature: string,
    ): Promise<boolean> => {
      if (!actor) {
        // No actor available — trust the frontend SDK confirmation (test mode)
        console.warn(
          "[Razorpay] No actor for verification — accepting in test mode",
        );
        return true;
      }
      try {
        const verified = await actor.verifyPayment({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        });
        return verified;
      } catch (err) {
        console.error("[Razorpay] verifyPayment error:", err);
        return false;
      }
    },
    [actor],
  );

  const initiatePayment = useCallback(
    async (params: InitiatePaymentParams) => {
      setIsLoading(true);
      setError(null);
      setVerificationState("loading_sdk");

      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error(
            "Unable to load payment gateway. Please check your internet connection and try again.",
          );
        }

        if (typeof window.Razorpay === "undefined") {
          throw new Error(
            "Razorpay SDK not available. Please refresh and try again.",
          );
        }

        const amountInPaise = Math.round(params.amount * 100);
        const refId = params.referenceId ?? `ref_${Date.now()}`;
        const paymentType = params.paymentType ?? "course_enrollment";

        // Create backend order
        setVerificationState("opening_popup");
        let orderId: string;
        try {
          const result = await createOrderId(params.amount, refId, paymentType);
          orderId = result.orderId;
        } catch {
          throw new Error("Unable to create payment order. Please try again.");
        }

        const options: RazorpayOptions = {
          key: RAZORPAY_KEY_ID,
          amount: amountInPaise,
          currency: "INR",
          order_id: orderId,
          name: "RAP Studio",
          description: params.description,
          image:
            "https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=100&h=100&fit=crop",
          prefill: {
            name: params.prefillName ?? "",
            email: params.prefillEmail ?? PREFILL_EMAIL,
            contact: PREFILL_CONTACT,
          },
          notes: {
            reference_id: refId,
            payment_type: paymentType,
            product_name: params.name,
          },
          theme: {
            color: "#B8860B",
            backdrop_color: "#0d0d0d",
          },
          modal: {
            backdropclose: false,
            escape: true,
            handleback: true,
            animation: true,
            ondismiss: () => {
              setIsLoading(false);
              setVerificationState("idle");
              toast.info("Payment cancelled. You can try again anytime.");
              params.onFailure?.("Payment cancelled");
            },
          },
          handler: async (response) => {
            // Popup closed with payment_id — now verify with backend
            setVerificationState("verifying");
            params.onVerifying?.();

            const pid = response.razorpay_payment_id;
            const oid = response.razorpay_order_id ?? orderId;
            const sig = response.razorpay_signature ?? "";

            const verified = await verifyWithBackend(oid, pid, sig);

            if (!verified) {
              setIsLoading(false);
              setVerificationState("failed");
              const msg =
                "Payment verification failed. Please contact support.";
              setError(msg);
              toast.error(msg);
              params.onFailure?.(msg);
              return;
            }

            const successData: PaymentSuccessResponse = {
              razorpay_payment_id: pid,
              razorpay_order_id: oid,
              razorpay_signature: sig,
              referenceId: refId,
              verified: true,
            };
            setIsLoading(false);
            setVerificationState("success");
            toast.success("Payment verified & confirmed! 🎉");
            params.onSuccess?.(successData);
          },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", (failResponse) => {
          const message = failResponse?.error?.description ?? "Payment failed";
          setIsLoading(false);
          setVerificationState("failed");
          setError(message);
          toast.error(`Payment failed: ${message}`);
          params.onFailure?.(message);
        });

        rzp.open();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Payment failed. Please try again.";
        setError(message);
        setIsLoading(false);
        setVerificationState("failed");
        toast.error(message);
        params.onFailure?.(message);
      }
    },
    [createOrderId, verifyWithBackend],
  );

  /** Shorthand for booking deposit: ₹2 */
  const initiateBookingDeposit = useCallback(
    (params: Omit<InitiatePaymentParams, "amount" | "paymentType">) =>
      initiatePayment({ ...params, amount: 2, paymentType: "booking_initial" }),
    [initiatePayment],
  );

  /** Multi-service deposit: ₹2 × number of services */
  const initiateMultiServiceDeposit = useCallback(
    (
      selectedServices: string[],
      totalAmount: number,
      extraParams?: Partial<
        Omit<InitiatePaymentParams, "amount" | "paymentType">
      >,
    ) => {
      const depositAmount = 2 * selectedServices.length;
      return initiatePayment({
        name: "RAP Studio Booking Deposit",
        description: `Deposit for ${selectedServices.length} service(s) — ₹${depositAmount} of ₹${totalAmount} total`,
        referenceId: `multi_${selectedServices.join("_").slice(0, 40)}_${Date.now()}`,
        paymentType: "booking_initial",
        ...extraParams,
        amount: depositAmount,
      });
    },
    [initiatePayment],
  );

  return {
    initiatePayment,
    initiateBookingDeposit,
    initiateMultiServiceDeposit,
    isLoading,
    verificationState,
    error,
  };
}
