import { NextResponse } from "next/server";
import { z } from "zod";
import { AchievementCriteriaType, ContentAuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";

const bodySchema = z.object({
  code: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Code must be lowercase letters, numbers, and hyphens only."),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1).max(8),
  criteriaType: z.nativeEnum(AchievementCriteriaType),
  criteriaThreshold: z.number().int().positive().optional(),
  xpReward: z.number().int().min(0).default(0),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const existing = await prisma.achievement.findUnique({ where: { code: parsed.data.code } });
  if (existing) return NextResponse.json({ error: `An achievement with code "${parsed.data.code}" already exists.` }, { status: 409 });

  const achievement = await prisma.achievement.create({
    data: {
      code: parsed.data.code,
      name: parsed.data.name,
      description: parsed.data.description,
      icon: parsed.data.icon,
      criteriaType: parsed.data.criteriaType,
      criteriaThreshold: parsed.data.criteriaThreshold,
      xpReward: parsed.data.xpReward,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await prisma.contentAuditLog.create({
    data: { entityType: "achievement", entityId: achievement.id, action: ContentAuditAction.CREATE, actorId: user!.id, after: achievement },
  });

  return NextResponse.json({ achievement }, { status: 201 });
}
