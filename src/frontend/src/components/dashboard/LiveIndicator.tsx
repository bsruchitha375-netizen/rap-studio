import { useEffect, useRef, useState } from "react";

export interface LiveIndicatorProps {
  /** Timestamp of last data fetch (from React Query dataUpdatedAt) */
  updatedAt?: number;
  /** @deprecated use updatedAt */
  dataUpdatedAt?: number;
  pollMs?: number;
  label?: string;
}

export function LiveIndicator({
  updatedAt,
  dataUpdatedAt,
  pollMs = 5000,
  label,
}: LiveIndicatorProps) {
  const ts = updatedAt ?? dataUpdatedAt ?? Date.now();
  const [secs, setSecs] = useState(0);
  const baseRef = useRef(ts);

  if (ts && ts !== baseRef.current) {
    baseRef.current = ts;
    setSecs(0);
  }

  useEffect(() => {
    const t = setInterval(() => {
      setSecs(Math.round((Date.now() - baseRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
      <span>
        {label ? `${label} · ` : ""}
        {secs > 0 ? `${secs}s ago` : "Just now"} · {Math.round(pollMs / 1000)}s
        refresh
      </span>
    </div>
  );
}
