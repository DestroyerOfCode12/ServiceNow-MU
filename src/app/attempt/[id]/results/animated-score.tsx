"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * Counts up from 0 to the final score/percent on mount rather than jump-
 * cutting straight to the number — the one place on the results screen
 * worth a beat of motion, since it's the first thing a candidate reads.
 * Reduced-motion users get the final numbers immediately, no animation.
 */
export function AnimatedScore({ score, total, percent }: { score: number; total: number; percent: number }) {
  const reducedMotion = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(reducedMotion ? score : 0);
  const [displayPercent, setDisplayPercent] = useState(reducedMotion ? percent : 0);

  useEffect(() => {
    if (reducedMotion) {
      Promise.resolve().then(() => {
        setDisplayScore(score);
        setDisplayPercent(percent);
      });
      return;
    }

    const durationMs = 800;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplayScore(Math.round(score * eased));
      setDisplayPercent(percent * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, percent, reducedMotion]);

  return (
    <>
      <p className="text-5xl font-bold tabular-nums text-foreground">
        {displayScore} <span className="text-2xl font-medium text-foreground-muted">/ {total}</span>
      </p>
      <p className="text-xl font-semibold tabular-nums text-accent">{displayPercent.toFixed(1)}%</p>
    </>
  );
}
