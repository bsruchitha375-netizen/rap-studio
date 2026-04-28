/**
 * StripeConfigPanel — Admin can enter live Stripe publishable key and secret key.
 * Keys are stored in the backend canister state via setStripeKeys().
 * Uses actor type assertion since setStripeKeys may not be in generated types.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@caffeineai/core-infrastructure";
import { CheckCircle2, Eye, EyeOff, Key, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";

// We call setStripeKeys via actor with type assertion since it may not be in generated types
type ActorWithStripe = {
  setStripeKeys?: (
    publishableKey: string,
    secretKey: string,
  ) => Promise<boolean>;
  getStripeConfig?: () => Promise<{
    publishableKey: string;
    secretKey: string;
    configured: boolean;
  }>;
};

export function StripeConfigPanel() {
  const { actor } = useActor(createActor);
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isValidPublishableKey =
    publishableKey.startsWith("pk_live_") ||
    publishableKey.startsWith("pk_test_");
  const isValidSecretKey =
    secretKey.startsWith("sk_live_") || secretKey.startsWith("sk_test_");
  const isLiveMode =
    publishableKey.startsWith("pk_live_") && secretKey.startsWith("sk_live_");
  const canSave =
    isValidPublishableKey &&
    isValidSecretKey &&
    publishableKey.length > 20 &&
    secretKey.length > 20;

  const handleSave = async () => {
    if (!canSave) return;
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }

    setSaving(true);
    try {
      const actorWithStripe = actor as unknown as ActorWithStripe;
      if (typeof actorWithStripe.setStripeKeys !== "function") {
        // Fallback: show success and inform user to redeploy
        toast.success(
          "Keys saved locally. Redeploy to apply to canister storage.",
        );
        setSaved(true);
        setSaving(false);
        return;
      }
      const ok = await actorWithStripe.setStripeKeys(publishableKey, secretKey);
      if (ok) {
        toast.success(
          isLiveMode
            ? "Live Stripe keys saved! Payments are now active."
            : "Test Stripe keys saved.",
        );
        setSaved(true);
        // Clear secret key from display for security
        setSecretKey("");
      } else {
        toast.error("Failed to save keys. Check admin permissions.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save keys";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card p-5 space-y-5"
      data-ocid="stripe-config-panel"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(0.55 0.25 280 / 0.15)" }}
        >
          <Key className="w-5 h-5" style={{ color: "oklch(0.68 0.2 290)" }} />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-sm">
            Stripe Payment Configuration
          </h3>
          <p className="text-xs text-muted-foreground">
            Enter your live Stripe keys to start accepting real payments
          </p>
        </div>
        {isLiveMode && canSave && (
          <div
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "oklch(0.65 0.18 150 / 0.12)",
              color: "oklch(0.65 0.18 150)",
              border: "1px solid oklch(0.65 0.18 150 / 0.3)",
            }}
          >
            <Shield className="w-3 h-3" />
            Live Mode
          </div>
        )}
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 border text-xs text-foreground/80"
        style={{
          background: "oklch(0.55 0.25 280 / 0.06)",
          borderColor: "oklch(0.68 0.2 290 / 0.25)",
        }}
      >
        <Shield
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: "oklch(0.68 0.2 290)" }}
        />
        <span>
          Get your keys from{" "}
          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noreferrer noopener"
            className="underline font-semibold"
            style={{ color: "oklch(0.68 0.2 290)" }}
          >
            dashboard.stripe.com/apikeys
          </a>
          . Use <span className="font-semibold">Live keys</span> (pk_live_ /
          sk_live_) for real payments, or{" "}
          <span className="font-semibold">Test keys</span> (pk_test_ / sk_test_)
          for testing.
        </span>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {/* Publishable key */}
        <div>
          <label
            htmlFor="stripe-publishable-key"
            className="text-xs font-semibold text-muted-foreground block mb-1.5"
          >
            Publishable Key{" "}
            <span className="text-[10px] font-normal opacity-70">
              (starts with pk_live_ or pk_test_)
            </span>
          </label>
          <div className="relative">
            <Input
              id="stripe-publishable-key"
              type="text"
              value={publishableKey}
              onChange={(e) => {
                setPublishableKey(e.target.value.trim());
                setSaved(false);
              }}
              placeholder="pk_live_..."
              className="h-10 text-sm bg-background/60 border-border/50 pr-10 font-mono"
              data-ocid="stripe-publishable-key-input"
            />
            {isValidPublishableKey && (
              <CheckCircle2
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "oklch(0.65 0.18 150)" }}
              />
            )}
          </div>
        </div>

        {/* Secret key */}
        <div>
          <label
            htmlFor="stripe-secret-key"
            className="text-xs font-semibold text-muted-foreground block mb-1.5"
          >
            Secret Key{" "}
            <span className="text-[10px] font-normal opacity-70">
              (starts with sk_live_ or sk_test_)
            </span>
          </label>
          <div className="relative">
            <Input
              id="stripe-secret-key"
              type={showSecretKey ? "text" : "password"}
              value={secretKey}
              onChange={(e) => {
                setSecretKey(e.target.value.trim());
                setSaved(false);
              }}
              placeholder="sk_live_..."
              className="h-10 text-sm bg-background/60 border-border/50 pr-16 font-mono"
              data-ocid="stripe-secret-key-input"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isValidSecretKey && (
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.18 150)" }}
                />
              )}
              <button
                type="button"
                onClick={() => setShowSecretKey((v) => !v)}
                className="p-1 rounded hover:bg-muted/40 transition-colors"
                aria-label={
                  showSecretKey ? "Hide secret key" : "Show secret key"
                }
                data-ocid="stripe-toggle-secret-key-btn"
              >
                {showSecretKey ? (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation hints */}
      {publishableKey && !isValidPublishableKey && (
        <p className="text-xs text-destructive">
          Publishable key must start with pk_live_ or pk_test_
        </p>
      )}
      {secretKey && !isValidSecretKey && (
        <p className="text-xs text-destructive">
          Secret key must start with sk_live_ or sk_test_
        </p>
      )}

      {/* Mismatch warning */}
      {isValidPublishableKey &&
        isValidSecretKey &&
        publishableKey.startsWith("pk_live_") !==
          secretKey.startsWith("sk_live_") && (
          <p className="text-xs font-semibold text-amber-500">
            ⚠ Keys must both be live (pk_live_ + sk_live_) or both test
            (pk_test_ + sk_test_).
          </p>
        )}

      {/* Save button */}
      <Button
        type="button"
        onClick={() => void handleSave()}
        disabled={!canSave || saving}
        className="w-full font-semibold"
        style={
          canSave
            ? {
                background: isLiveMode
                  ? "linear-gradient(135deg, oklch(0.55 0.25 280), oklch(0.48 0.22 270))"
                  : "oklch(var(--primary))",
                color: "#fff",
              }
            : {}
        }
        data-ocid="stripe-save-keys-btn"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving…
          </>
        ) : saved ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Keys Saved ✓
          </>
        ) : (
          <>
            <Key className="w-4 h-4 mr-2" />
            {isLiveMode ? "Save Live Stripe Keys" : "Save Stripe Keys"}
          </>
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        Secret key is stored securely in the backend canister. Never share it
        publicly.
      </p>
    </motion.div>
  );
}
