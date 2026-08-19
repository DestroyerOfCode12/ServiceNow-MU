import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";

// The nav only ever surfaces the search icon to authenticated users, and
// every other way to reach question content (practice, exams, individual
// attempts) requires login — this route had no auth check at all, so it
// was a backend gap that let anyone enumerate the question bank's text
// directly via the API without ever signing in.
export async function GET(req: Request) {
  const { error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ topics: [], questions: [], flashcards: [] });

  const [topics, questions, flashcards] = await Promise.all([
    prisma.topic.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { overview: { contains: q, mode: "insensitive" } }] },
      take: 8,
      select: { id: true, slug: true, name: true, validationStatus: true },
    }),
    prisma.question.findMany({
      where: { questionText: { contains: q, mode: "insensitive" } },
      take: 8,
      select: { id: true, questionText: true, topic: { select: { slug: true, name: true } } },
    }),
    prisma.flashcard.findMany({
      where: { OR: [{ term: { contains: q, mode: "insensitive" } }, { definition: { contains: q, mode: "insensitive" } }] },
      take: 8,
      select: { id: true, term: true, definition: true },
    }),
  ]);

  return NextResponse.json({ topics, questions, flashcards });
}
