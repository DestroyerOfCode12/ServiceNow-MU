import { AttemptStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { scoreAttempt } from "./scoring";

/**
 * Server-side timer enforcement (spec section 13): if a timed attempt's
 * deadline has passed, auto-submit/score it right now, regardless of what
 * the client claims. Every mutating attempt route calls this first, so the
 * timer can never be bypassed by pausing or manipulating the client clock.
 */
export async function enforceDeadline(attemptId: string, userId: string) {
  const attempt = await prisma.examAttempt.findUniqueOrThrow({ where: { id: attemptId } });
  if (attempt.userId !== userId) throw new Error("Not your attempt.");

  if (attempt.status === AttemptStatus.IN_PROGRESS && attempt.serverDeadlineAt && attempt.serverDeadlineAt.getTime() <= Date.now()) {
    await scoreAttempt(attemptId, userId);
    return { expired: true };
  }

  return { expired: false, attempt };
}
