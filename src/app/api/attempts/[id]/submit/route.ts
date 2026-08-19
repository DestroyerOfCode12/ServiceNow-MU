import { NextResponse } from "next/server";
import { requireUser } from "@/lib/current-user";
import { scoreAttempt } from "@/lib/exam/scoring";
import { enforceDeadline } from "@/lib/exam/attempt-guard";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = await params;
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  await enforceDeadline(attemptId, user!.id); // auto-scores if already past deadline; scoreAttempt below is idempotent
  const attempt = await scoreAttempt(attemptId, user!.id);

  return NextResponse.json({ attemptId: attempt.id });
}
