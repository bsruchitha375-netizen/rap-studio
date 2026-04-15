import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { ServiceCategory, SubService } from "../../types";

// Multi-select variant
interface MultiSubServiceSelectorProps {
  service: ServiceCategory;
  selectedSubServices: SubService[];
  onToggle: (sub: SubService) => void;
}

export function MultiSubServiceSelector({
  service,
  selectedSubServices,
  onToggle,
}: MultiSubServiceSelectorProps) {
  const selectedIds = new Set(selectedSubServices.map((s) => s.id));

  return (
    <div className="mt-2 pl-2 border-l-2 border-primary/30 space-y-1.5">
      {service.subServices.map((sub, i) => {
        const isSelected = selectedIds.has(sub.id);
        return (
          <motion.button
            key={sub.id}
            type="button"
            onClick={() => onToggle(sub)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left rounded-lg px-3 py-2.5 border transition-all duration-200 flex items-center gap-3"
            style={{
              background: isSelected
                ? "oklch(0.7 0.22 70 / 0.12)"
                : "oklch(0.14 0.015 280)",
              borderColor: isSelected
                ? "oklch(0.7 0.22 70 / 0.55)"
                : "oklch(0.28 0.018 280)",
            }}
            aria-pressed={isSelected}
            data-ocid={`sub-service-${sub.id}`}
          >
            <div
              className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: isSelected
                  ? "oklch(0.7 0.22 70)"
                  : "oklch(0.4 0.02 280)",
                background: isSelected ? "oklch(0.7 0.22 70)" : "transparent",
              }}
            >
              {isSelected && <Check className="w-3 h-3 text-black" />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold leading-tight"
                style={{
                  color: isSelected
                    ? "oklch(0.88 0.18 70)"
                    : "oklch(0.9 0.01 280)",
                }}
              >
                {sub.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {sub.description} · {sub.duration}
              </p>
            </div>
            <span
              className="text-xs font-bold shrink-0"
              style={{
                color: isSelected
                  ? "oklch(0.88 0.18 70)"
                  : "oklch(0.6 0.015 280)",
              }}
            >
              ₹{sub.price}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Single-select variant (retained for BookingModal)
interface SubServiceSelectorProps {
  service: ServiceCategory;
  selectedSubService: SubService | null;
  onSelect: (sub: SubService) => void;
}

export function SubServiceSelector({
  service,
  selectedSubService,
  onSelect,
}: SubServiceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full bg-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Choose a Sub-Service
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Select what type of {service.name.toLowerCase()} you need
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {service.subServices.map((sub, i) => {
          const isSelected = selectedSubService?.id === sub.id;
          return (
            <motion.button
              key={sub.id}
              onClick={() => onSelect(sub)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer"
              style={{
                background: isSelected
                  ? "oklch(0.7 0.22 70 / 0.12)"
                  : "oklch(0.165 0.018 280)",
                borderColor: isSelected
                  ? "oklch(0.7 0.22 70 / 0.6)"
                  : "oklch(0.3 0.02 280)",
                boxShadow: isSelected
                  ? "0 0 16px oklch(0.7 0.22 70 / 0.2)"
                  : "none",
              }}
              data-ocid={`sub-service-${sub.id}`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className="font-semibold text-sm"
                  style={{
                    color: isSelected
                      ? "oklch(0.85 0.18 70)"
                      : "oklch(0.93 0.01 280)",
                  }}
                >
                  {sub.name}
                </p>
                {isSelected && (
                  <span className="text-primary text-xs font-bold shrink-0">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {sub.description}
              </p>
              <p className="text-xs mt-2 font-semibold text-primary">
                ⏱ {sub.duration}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
