import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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
