import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — wait until mounted to render icon
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`w-9 h-9 ${className}`}
        aria-label="Toggle theme"
        data-ocid="theme.toggle"
      >
        {/* Placeholder to prevent layout shift */}
        <span className="w-[17px] h-[17px] block" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-ocid="theme.toggle"
      className={`w-9 h-9 relative overflow-hidden transition-smooth hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-[17px] h-[17px] text-primary" />
          ) : (
            <Moon className="w-[17px] h-[17px] text-foreground" />
          )}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
