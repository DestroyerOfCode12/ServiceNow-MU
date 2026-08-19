"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

/**
 * Fills in from 0 on mount rather than rendering pre-filled — since this is
 * used server-side (readiness score, XP progress, domain accuracy) with no
 * prior client-side value to transition from, the only way to get a fill-in
 * animation at all is to render at 0% for one tick and then animate to the
 * real value. Reduced-motion users get the CSS transition-duration override
 * from globals.css, which collapses this to effectively instant.
 */
export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName = "bg-accent",
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplayPct(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <div
      className={clsx("h-2.5 w-full overflow-hidden rounded-full bg-surface-muted", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className={clsx("h-full rounded-full transition-all duration-700 ease-out", barClassName)} style={{ width: `${displayPct}%` }} />
    </div>
  );
}
