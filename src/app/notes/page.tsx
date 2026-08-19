import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { NotesList, type NoteRow } from "./notes-list";

export const metadata: Metadata = { title: "Notes · CSA Prep Platform" };

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/notes");

  const notes = await prisma.note.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });

  const topicIds = notes.filter((n) => n.entityType === "TOPIC").map((n) => n.entityId);
  const questionIds = notes.filter((n) => n.entityType === "QUESTION").map((n) => n.entityId);
  const flashcardIds = notes.filter((n) => n.entityType === "FLASHCARD").map((n) => n.entityId);

  const [topics, questions, flashcards] = await Promise.all([
    prisma.topic.findMany({ where: { id: { in: topicIds } } }),
    prisma.question.findMany({ where: { id: { in: questionIds } } }),
    prisma.flashcard.findMany({ where: { id: { in: flashcardIds } } }),
  ]);
  const topicMap = new Map(topics.map((t) => [t.id, t]));
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const flashcardMap = new Map(flashcards.map((f) => [f.id, f]));

  const rows: NoteRow[] = notes.map((n) => {
    let title = "Untitled";
    let href: string | null = null;
    if (n.entityType === "TOPIC") {
      const t = topicMap.get(n.entityId);
      title = t?.name ?? "Deleted topic";
      href = t ? `/study/topics/${t.slug}` : null;
    } else if (n.entityType === "QUESTION") {
      const q = questionMap.get(n.entityId);
      title = q?.questionText ?? "Deleted question";
    } else {
      const f = flashcardMap.get(n.entityId);
      title = f?.term ?? "Deleted flashcard";
    }
    return {
      id: n.id,
      entityType: n.entityType,
      entityId: n.entityId,
      content: n.content,
      title,
      href,
      updatedAt: n.updatedAt.toISOString(),
    };
  });

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-foreground">My Notes</h1>
      <p className="mt-1 text-foreground-muted">Private notes you&apos;ve added while studying — only you can see these.</p>
      <NotesList notes={rows} />
    </div>
  );
}
