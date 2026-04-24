// Legacy compatibility shim — Razorpay replaced by Stripe
// Re-exports everything from useStripe so existing imports don't break
export {
  calcDepositPerService,
  depositRateLabel,
  useStripe as useRazorpay,
} from "./useStripe";

export type { InitiateStripePaymentParams as InitiatePaymentParams } from "./useStripe";

// Legacy state types re-exported for any components still referencing them
export type PaymentVerificationState =
  | "idle"
  | "loading_sdk"
  | "opening_popup"
  | "verifying"
  | "success"
  | "failed"
  | "sdk_unavailable";
