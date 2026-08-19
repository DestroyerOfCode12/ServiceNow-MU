"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";

export interface FlashcardDatum {
  id: string;
  term: string;
  definition: string;
  contrastTerm: string | null;
  contrastDefinition: string | null;
  topicName: string | null;
}

export function FlashcardDeck({ cards }: { cards: FlashcardDatum[] }) {
  const { status } = useSession();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, learning: 0 });

  const card = cards[index];
  const progress = useMemo(() => `${Math.min(index + 1, cards.length)} / ${cards.length}`, [index, cards.length]);

  if (cards.length === 0) return <p className="text-sm text-foreground-muted">No flashcards available yet.</p>;

  async function mark(known: boolean) {
    setStats((s) => ({ known: s.known + (known ? 1 : 0), learning: s.learning + (known ? 0 : 1) }));
    if (status === "authenticated") {
      await fetch(`/api/flashcards/${card.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ known }),
      });
    }
    next();
  }

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-foreground-muted">
        <span>{progress}</span>
        <span>
          ✓ {stats.known} · learning {stats.learning}
        </span>
      </div>

      {/* Real 3D flip via CSS transform, not a content swap — both faces stay
          in the DOM at all times so the rotation has something to show on
          each side. Under prefers-reduced-motion the global transition-
          duration override (globals.css) collapses this to an instant swap. */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="relative min-h-64 w-full [perspective:1200px]"
        aria-label="Flip flashcard"
      >
        <div
          className={clsx(
            "relative min-h-64 w-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 text-center shadow-sm [backface-visibility:hidden] hover:bg-surface-muted">
            {card.topicName && <p className="mb-3 text-xs uppercase tracking-wide text-foreground-muted">{card.topicName}</p>}
            <p className="text-2xl font-semibold text-foreground">{card.term}</p>
            {card.contrastTerm && (
              <p className="mt-2 text-base text-foreground-muted">
                vs. <span className="font-medium text-foreground">{card.contrastTerm}</span>
              </p>
            )}
            <p className="mt-4 text-xs text-foreground-muted">Click to reveal</p>
          </div>

          {/* Back — pre-rotated 180deg so it reads right-side-up once the parent flips */}
          <div className="absolute inset-0 flex flex-col justify-center overflow-y-auto rounded-xl border border-border bg-surface p-8 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="w-full space-y-4 text-left">
              <div>
                <p className="text-sm font-semibold text-foreground">{card.term}</p>
                <p className="mt-1 text-sm text-foreground-muted">{card.definition}</p>
              </div>
              {card.contrastTerm && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground">{card.contrastTerm}</p>
                  <p className="mt-1 text-sm text-foreground-muted">{card.contrastDefinition}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={prev}>
            ← Previous
          </Button>
          <Button variant="secondary" size="sm" onClick={next}>
            Skip →
          </Button>
        </div>
        <div className={clsx("flex gap-2", !flipped && "opacity-40")}>
          <Button variant="danger" size="sm" onClick={() => mark(false)} disabled={!flipped}>
            Still learning
          </Button>
          <Button variant="accent" size="sm" onClick={() => mark(true)} disabled={!flipped}>
            I knew this
          </Button>
        </div>
      </div>
    </div>
  );
}
