"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const COLORS = ["var(--accent)", "var(--success)", "var(--warning)", "var(--primary)"];
const PIECE_COUNT = 24;
const DURATION_MS = 900;

interface Piece {
  id: number;
  left: number; // %
  drift: number; // px, final horizontal offset
  spin: number; // deg
  delay: number; // ms
  size: number; // px
  color: string;
}

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, id) => ({
    id,
    left: Math.random() * 100,
    drift: (Math.random() - 0.5) * 160,
    spin: 180 + Math.random() * 540,
    delay: Math.random() * 150,
    size: 6 + Math.random() * 6,
    color: COLORS[id % COLORS.length],
  }));
}

/**
 * A brief, self-cleaning confetti burst. Reserved for genuinely celebratory
 * moments (a level-up, a strong exam result) — see the gamification plan's
 * note on confetti-fatigue. Purely decorative: gate it behind
 * useReducedMotion so it never becomes the only signal of a real event
 * (the score/badge underneath already communicates that).
 *
 * Usage: wrap the celebratory element in `className="relative"` and render
 * `<ConfettiBurst active={won} />` inside it — the burst absolutely
 * positions itself to fill that ancestor.
 */
export function ConfettiBurst({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion();
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    if (!active || reducedMotion) return;
    Promise.resolve().then(() => setPieces(makePieces()));
    const timer = setTimeout(() => setPieces(null), DURATION_MS + 150);
    return () => clearTimeout(timer);
  }, [active, reducedMotion]);

  const style = useMemo(() => ({ "--confetti-duration": `${DURATION_MS}ms` }) as React.CSSProperties, []);

  if (!pieces) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={style} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.4,
              background: p.color,
              animation: `confetti-fall ${DURATION_MS}ms ease-in ${p.delay}ms both`,
              "--confetti-x-end": `${p.drift}px`,
              "--confetti-spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
