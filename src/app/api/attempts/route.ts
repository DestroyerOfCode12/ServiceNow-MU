import { NextResponse } from "next/server";
import { z } from "zod";
import { AttemptMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { generateAttempt, buildFullExamPlan, type AttemptPlanItem } from "@/lib/exam/generator";
import { buildAdaptivePracticePlan } from "@/lib/exam/weakness";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

const bodySchema = z.object({
  mode: z.nativeEnum(AttemptMode),
  topicId: z.string().cuid().optional(),
  domainId: z.string().cuid().optional(),
  count: z.number().int().min(1).max(120).optional(),
  durationSeconds: z.number().int().min(60).max(4 * 60 * 60).optional(),
});

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const { allowed } = rateLimit(clientKeyFromRequest(req, `attempts:${user!.id}`), { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) return NextResponse.json({ error: "Too many attempts started. Slow down and try again shortly." }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const body = parsed.data;

  let plan: AttemptPlanItem[] = [];
  let durationSeconds = 0;
  let examEligibleOnly = false;
  let blueprintVersionId: string | undefined;

  switch (body.mode) {
    case AttemptMode.FULL_EXAM: {
      const blueprint = await prisma.blueprintVersion.findFirst({ where: { status: "ACTIVE" } });
      if (!blueprint) return NextResponse.json({ error: "No active CSA blueprint is configured." }, { status: 500 });
      plan = await buildFullExamPlan(blueprint.id, blueprint.questionCount);
      durationSeconds = blueprint.examDurationMinutes * 60;
      examEligibleOnly = true;
      blueprintVersionId = blueprint.id;
      break;
    }
    case AttemptMode.TIMED_PRACTICE: {
      const count = body.count ?? 20;
      durationSeconds = body.durationSeconds ?? count * 90; // ~90s/question default
      plan = [{ domainId: body.domainId, topicId: body.topicId, count }];
      break;
    }
    case AttemptMode.QUICK_PRACTICE: {
      plan = [{ count: 10 }];
      break;
    }
    case AttemptMode.TOPIC_PRACTICE: {
      if (!body.topicId) return NextResponse.json({ error: "topicId is required for topic practice." }, { status: 400 });
      plan = [{ topicId: body.topicId, count: body.count ?? 15 }];
      break;
    }
    case AttemptMode.DOMAIN_PRACTICE: {
      if (!body.domainId) return NextResponse.json({ error: "domainId is required for domain practice." }, { status: 400 });
      plan = [{ domainId: body.domainId, count: body.count ?? 20 }];
      break;
    }
    case AttemptMode.WEAK_AREA_PRACTICE: {
      const built = await buildAdaptivePracticePlan(user!.id, body.count ?? 20);
      plan = built.plan;
      break;
    }
    case AttemptMode.RANDOM_PRACTICE: {
      plan = [{ count: body.count ?? 20 }];
      break;
    }
  }

  const totalRequested = plan.reduce((s, p) => s + p.count, 0);
  if (totalRequested === 0) {
    return NextResponse.json({ error: "No eligible questions are available for this selection yet." }, { status: 422 });
  }

  const attempt = await generateAttempt({
    userId: user!.id,
    mode: body.mode,
    durationSeconds,
    plan,
    examEligibleOnly,
    blueprintVersionId,
    generationParams: { topicId: body.topicId, domainId: body.domainId, requestedCount: body.count },
  });

  if (attempt.totalQuestions === 0) {
    return NextResponse.json({ error: "No eligible questions matched this selection." }, { status: 422 });
  }

  return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
}
