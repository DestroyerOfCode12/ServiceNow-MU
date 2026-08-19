import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";

const bodySchema = z.object({ known: z.boolean() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: flashcardId } = await params;
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const now = new Date();
  // Simple spaced-repetition-ish scheduling: known cards come back further out.
  const nextDueAt = new Date(now.getTime() + (parsed.data.known ? 4 : 1) * 24 * 60 * 60 * 1000);

  const review = await prisma.flashcardReview.upsert({
    where: { userId_flashcardId: { userId: user!.id, flashcardId } },
    update: {
      timesReviewed: { increment: 1 },
      timesKnown: { increment: parsed.data.known ? 1 : 0 },
      lastReviewedAt: now,
      nextDueAt,
    },
    create: {
      userId: user!.id,
      flashcardId,
      timesReviewed: 1,
      timesKnown: parsed.data.known ? 1 : 0,
      lastReviewedAt: now,
      nextDueAt,
    },
  });

  return NextResponse.json({ review });
}
