import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetStripeConfig,
  useSetStripeKeys,
  useTestStripeConnection,
} from "../../hooks/useBackend";

export function StripeSettings() {
  const { data: config, isLoading } = useGetStripeConfig();
  const setKeysMutation = useSetStripeKeys();
  const testConnectionMutation = useTestStripeConnection();

  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPk, setShowPk] = useState(false);
  const [showSk, setShowSk] = useState(false);
  const [testing, setTesting] = useState(false);

  async function handleSave() {
    if (!publishableKey.trim() || !secretKey.trim()) {
      toast.error("Both Publishable Key and Secret Key are required");
      return;
    }
    if (!publishableKey.startsWith("pk_")) {
      toast.error("Publishable key must start with pk_live_ or pk_test_");
      return;
    }
    if (!secretKey.startsWith("sk_")) {
      toast.error("Secret key must start with sk_live_ or sk_test_");
      return;
    }
    try {
      await setKeysMutation.mutateAsync({
        publishableKey: publishableKey.trim(),
        secretKey: secretKey.trim(),
      });
      toast.success("Stripe keys saved successfully");
      setPublishableKey("");
      setSecretKey("");
    } catch {
      toast.error("Failed to save Stripe keys");
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const result = await testConnectionMutation.mutateAsync();
      if (result.success) {
        toast.success(`Stripe connection successful: ${result.message}`);
      } else {
        toast.error(`Stripe connection failed: ${result.message}`);
      }
    } catch {
      toast.error("Failed to test Stripe connection");
    } finally {
      setTesting(false);
    }
  }

  const isConfigured = config?.configured ?? false;

  return (
    <div className="space-y-4 w-full max-w-2xl">
      {/* Status card */}
      <div
        className="rounded-2xl border border-border/60 bg-card p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.025 290 / 0.9), oklch(0.12 0.014 275))",
        }}
        data-ocid="stripe-config-card"
      >
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-16 translate-x-16" />

        <div className="flex items-start justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-base">
                Stripe Payment Gateway
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure live or test Stripe API keys for payment processing
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="w-24 h-6 rounded-full bg-muted/50 animate-pulse" />
          ) : (
            <Badge
              className={`text-xs border font-bold flex-shrink-0 ${isConfigured ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40" : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40"}`}
              data-ocid="stripe-status-badge"
            >
              {isConfigured ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Keys configured
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Not configured
                </>
              )}
            </Badge>
          )}
        </div>

        {/* Current masked keys */}
        {isConfigured && config && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Publishable Key
              </p>
              <p className="font-mono text-xs text-foreground/80 truncate">
                {config.publishableKey || "pk_•••••••••••••••••••"}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Secret Key
              </p>
              <p className="font-mono text-xs text-foreground/80 truncate">
                {config.secretKey
                  ? `${config.secretKey.slice(0, 8)}••••••••••••••••••••`
                  : "sk_•••••••••••••••••••"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Update keys form */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
        <h4 className="font-display font-bold text-foreground text-sm">
          {isConfigured ? "Update Stripe Keys" : "Configure Stripe Keys"}
        </h4>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="stripe-pk"
              className="text-xs font-semibold text-muted-foreground block mb-1.5"
            >
              Publishable Key
            </label>
            <div className="relative">
              <input
                id="stripe-pk"
                type={showPk ? "text" : "password"}
                placeholder="pk_live_... or pk_test_..."
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground font-mono text-xs px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 placeholder:text-muted-foreground/50"
                autoComplete="off"
                spellCheck={false}
                data-ocid="stripe-publishable-key.input"
              />
              <button
                type="button"
                onClick={() => setShowPk((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPk ? "Hide key" : "Show key"}
              >
                {showPk ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="stripe-sk"
              className="text-xs font-semibold text-muted-foreground block mb-1.5"
            >
              Secret Key
              <span className="ml-1.5 text-[10px] text-yellow-600 dark:text-yellow-400 font-normal">
                — never share this publicly
              </span>
            </label>
            <div className="relative">
              <input
                id="stripe-sk"
                type={showSk ? "text" : "password"}
                placeholder="sk_live_... or sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground font-mono text-xs px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 placeholder:text-muted-foreground/50"
                autoComplete="off"
                spellCheck={false}
                data-ocid="stripe-secret-key.input"
              />
              <button
                type="button"
                onClick={() => setShowSk((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showSk ? "Hide key" : "Show key"}
              >
                {showSk ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            type="button"
            disabled={
              setKeysMutation.isPending || !publishableKey || !secretKey
            }
            onClick={() => void handleSave()}
            className="font-semibold text-sm"
            style={{
              background: "var(--gradient-gold)",
              color: "oklch(var(--primary-foreground))",
            }}
            data-ocid="stripe-save-keys.save_button"
          >
            {setKeysMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Keys
          </Button>

          {isConfigured && (
            <Button
              type="button"
              variant="outline"
              disabled={testing}
              onClick={() => void handleTest()}
              className="border-border text-foreground hover:bg-muted/40 font-semibold text-sm"
              data-ocid="stripe-test-connection.button"
            >
              {testing ? (
                <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-muted/40 bg-muted/20 px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground/80">Live keys</strong> (
            <code className="font-mono text-[10px]">pk_live_</code> /{" "}
            <code className="font-mono text-[10px]">sk_live_</code>) process
            real payments.{" "}
            <strong className="text-foreground/80">Test keys</strong> (
            <code className="font-mono text-[10px]">pk_test_</code> /{" "}
            <code className="font-mono text-[10px]">sk_test_</code>) are safe
            for development. Keys are stored securely in the canister and never
            exposed to clients.
          </p>
        </div>
      </div>
    </div>
  );
}
