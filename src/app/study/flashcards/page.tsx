import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { STUDY_TABS } from "@/components/nav/nav-links";
import { FlashcardDeck } from "./flashcard-deck";

export default async function FlashcardsPage() {
  const cards = await prisma.flashcard.findMany({
    include: { topic: true },
    orderBy: { createdAt: "asc" },
  });

  // Shuffle deterministically per request (server-rendered, so this is per page load).
  const shuffled = [...cards].sort(() => Math.random() - 0.5);

  return (
    <div>
      <SubTabs tabs={STUDY_TABS} />
      <div className="container-page max-w-2xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Flashcards</h1>
        <p className="mt-1 text-foreground-muted">
          The A-vs-B distinctions that come up again and again on the CSA exam. Click a card to reveal the answer.
        </p>
        <div className="mt-6">
          <FlashcardDeck
            cards={shuffled.map((c) => ({
              id: c.id,
              term: c.term,
              definition: c.definition,
              contrastTerm: c.contrastTerm,
              contrastDefinition: c.contrastDefinition,
              topicName: c.topic?.name ?? null,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
