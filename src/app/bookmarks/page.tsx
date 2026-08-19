import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/bookmarks");

  const bookmarks = await prisma.bookmark.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  const topicIds = bookmarks.filter((b) => b.entityType === "TOPIC").map((b) => b.entityId);
  const questionIds = bookmarks.filter((b) => b.entityType === "QUESTION").map((b) => b.entityId);
  const flashcardIds = bookmarks.filter((b) => b.entityType === "FLASHCARD").map((b) => b.entityId);

  const [topics, questions, flashcards] = await Promise.all([
    prisma.topic.findMany({ where: { id: { in: topicIds } } }),
    prisma.question.findMany({ where: { id: { in: questionIds } }, include: { domain: true } }),
    prisma.flashcard.findMany({ where: { id: { in: flashcardIds } } }),
  ]);

  const topicMap = new Map(topics.map((t) => [t.id, t]));
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const flashcardMap = new Map(flashcards.map((f) => [f.id, f]));

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-foreground">My Study List</h1>
      <p className="mt-1 text-foreground-muted">Bookmarked questions, topics, and flashcards, all in one place.</p>

      {bookmarks.length === 0 ? (
        <p className="mt-6 text-sm text-foreground-muted">Nothing bookmarked yet. Look for the ☆ button while studying.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {bookmarks.map((b) => {
            if (b.entityType === "TOPIC") {
              const t = topicMap.get(b.entityId);
              if (!t) return null;
              return (
                <Card key={b.id}>
                  <CardBody className="flex items-center justify-between gap-3">
                    <div>
                      <Badge variant="info">Topic</Badge>
                      <p className="mt-1 font-medium text-foreground">{t.name}</p>
                    </div>
                    <Link href={`/study/topics/${t.slug}`} className="text-sm font-medium text-accent hover:underline">
                      Open →
                    </Link>
                  </CardBody>
                </Card>
              );
            }
            if (b.entityType === "QUESTION") {
              const q = questionMap.get(b.entityId);
              if (!q) return null;
              return (
                <Card key={b.id}>
                  <CardBody>
                    <Badge variant="info">Question</Badge>
                    <p className="mt-1 text-sm font-medium text-foreground">{q.questionText}</p>
                    <p className="mt-1 text-xs text-foreground-muted">{q.domain.name}</p>
                  </CardBody>
                </Card>
              );
            }
            const f = flashcardMap.get(b.entityId);
            if (!f) return null;
            return (
              <Card key={b.id}>
                <CardBody>
                  <Badge variant="info">Flashcard</Badge>
                  <p className="mt-1 font-medium text-foreground">{f.term}</p>
                  <p className="mt-1 text-sm text-foreground-muted">{f.definition}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
