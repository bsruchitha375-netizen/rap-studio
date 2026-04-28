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
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span>
        {label ? `${label} · ` : "Live · "}
        {secs > 0 ? `${secs}s ago` : "Just now"} · {Math.round(pollMs / 1000)}s
        refresh
      </span>
    </div>
  );
}
