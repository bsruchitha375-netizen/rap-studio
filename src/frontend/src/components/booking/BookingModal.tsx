import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { ServiceCategory, SubService } from "../../types";
import { BookingForm } from "./BookingForm";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceCategory;
  selectedSubService?: SubService | null;
}

export function BookingModal({
  isOpen,
  onClose,
  service,
  selectedSubService,
}: BookingModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: "oklch(0 0 0 / 0.75)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-ocid="booking-modal-backdrop"
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full md:max-w-2xl bg-card border border-border rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              data-ocid="booking-modal"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.7 0.22 70 / 0.08), oklch(0.68 0.2 290 / 0.05))",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.emoji}</span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Book {service.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      You can also add more services to this booking
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/booking"
                    className="hidden sm:flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    onClick={onClose}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Full booking
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full"
                    aria-label="Close booking modal"
                    data-ocid="booking-modal-close"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <BookingForm
                  initialService={service}
                  initialSubService={selectedSubService}
                  onSuccess={onClose}
                />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
