import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Layout } from "../components/layout/Layout";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        {/* Aperture SVG + 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
          className="mb-8 relative flex items-center justify-center"
          data-ocid="not-found-graphic"
        >
          <span
            className="font-display font-bold text-foreground/10 select-none leading-none"
            style={{ fontSize: "clamp(100px, 20vw, 180px)" }}
          >
            404
          </span>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="110"
                cy="110"
                r="100"
                stroke="oklch(0.7 0.22 70 / 0.25)"
                strokeWidth="3"
                strokeDasharray="14 8"
              />
              <circle
                cx="110"
                cy="110"
                r="55"
                stroke="oklch(0.7 0.22 70 / 0.2)"
                strokeWidth="2"
              />
              {[0, 60, 120, 180, 240, 300].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = 110 + 60 * Math.cos(rad);
                const y1 = 110 + 60 * Math.sin(rad);
                const x2 = 110 + 97 * Math.cos(rad);
                const y2 = 110 + 97 * Math.sin(rad);
                return (
                  <line
                    key={`blade-${angle}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="oklch(0.7 0.22 70 / 0.3)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 max-w-md"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Frame Not Found
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            This scene doesn't exist in our story. The page you're looking for
            may have moved, been deleted, or never existed.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <Button
            type="button"
            className="gradient-gold text-background border-0 hover:opacity-90 px-8 py-3 text-base font-semibold"
            onClick={() => navigate({ to: "/" })}
            data-ocid="not-found-home-btn"
          >
            Return to Homepage
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-border/40 px-8 py-3 text-base"
            onClick={() => window.history.back()}
            data-ocid="not-found-back-btn"
          >
            Go Back
          </Button>
        </motion.div>

        {/* Film strip decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-16 flex gap-3 pointer-events-none"
          aria-hidden="true"
        >
          {["fs1", "fs2", "fs3", "fs4", "fs5", "fs6", "fs7", "fs8"].map(
            (id) => (
              <div
                key={id}
                className="w-10 h-14 rounded border-2 border-primary flex flex-col justify-between p-1"
              >
                <div className="w-full h-2 bg-primary rounded-sm" />
                <div className="w-full h-6 bg-primary/30 rounded-sm" />
                <div className="w-full h-2 bg-primary rounded-sm" />
              </div>
            ),
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
