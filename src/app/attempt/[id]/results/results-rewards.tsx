"use client";

import { useEffect, useRef } from "react";
import { ConfettiBurst } from "@/components/ui/confetti";
import { useToast } from "@/components/ui/toast";

export interface UnlockedAchievementView {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  xpReward: number;
}

/**
 * Fires once per results-page load: a toast per reward, plus a confetti
 * burst reserved for moments that actually earn it (an achievement, a
 * level-up, or a genuinely strong score) — see the gamification plan's
 * note on confetti-fatigue. The visible reward summary itself (the card
 * this renders inside of) is not gated the same way; it's just information.
 */
export function ResultsRewards({
  xpEarned,
  unlockedAchievements,
  leveledUp,
  newLevel,
  scorePercent,
}: {
  xpEarned: number;
  unlockedAchievements: UnlockedAchievementView[];
  leveledUp: boolean;
  newLevel: number;
  scorePercent: number;
}) {
  const { show } = useToast();
  const firedRef = useRef(false);
  const confettiWorthy = leveledUp || unlockedAchievements.length > 0 || scorePercent >= 90;

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (xpEarned > 0) show({ message: `+${xpEarned} XP earned`, variant: "xp" });
    if (leveledUp) show({ message: `Level up! You're now level ${newLevel}.`, variant: "success", durationMs: 4500 });
    for (const a of unlockedAchievements) {
      show({ message: `${a.icon ?? "🏅"} Achievement unlocked: ${a.name}`, variant: "success", durationMs: 4500 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire-once-on-mount is intentional
  }, []);

  if (xpEarned === 0 && unlockedAchievements.length === 0) return null;

  return (
    <div className="relative">
      <ConfettiBurst active={confettiWorthy} />
      <div className="motion-fade-in-up flex flex-wrap items-center justify-center gap-2 text-sm">
        {xpEarned > 0 && (
          <span className="rounded-full border border-accent bg-surface px-3 py-1 font-medium text-accent">+{xpEarned} XP</span>
        )}
        {leveledUp && (
          <span className="motion-pop-in rounded-full border border-success bg-success-bg px-3 py-1 font-medium text-success">
            Level {newLevel}!
          </span>
        )}
        {unlockedAchievements.map((a) => (
          <span
            key={a.id}
            className="motion-pop-in rounded-full border border-warning bg-warning-bg px-3 py-1 font-medium text-warning"
            title={a.description}
          >
            {a.icon ?? "🏅"} {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}
