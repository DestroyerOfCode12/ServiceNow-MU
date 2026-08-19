"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the OS-level `prefers-reduced-motion` setting live (not just at
 * mount) so a component built with this hook reacts if the user flips the
 * setting in another window while the app is open. Every celebratory or
 * decorative animation in the gamification system (confetti, streak pops,
 * count-up reveals) should gate on this before playing — the CSS-level
 * `@media (prefers-reduced-motion: reduce)` block in globals.css is a
 * fallback net, not a substitute for skipping the animation's *logic*
 * (e.g. not even mounting a confetti burst) here.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    Promise.resolve().then(() => setReduced(query.matches));
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
