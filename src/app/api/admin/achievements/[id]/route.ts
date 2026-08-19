import { NextResponse } from "next/server";
import { z } from "zod";
import { ContentAuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";

const bodySchema = z.object({
  isActive: z.boolean(),
});

/** Activate/retire an achievement — the one inline admin action this list needs day to day. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const existing = await prisma.achievement.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const updated = await prisma.achievement.update({ where: { id }, data: { isActive: parsed.data.isActive } });

  await prisma.contentAuditLog.create({
    data: {
      entityType: "achievement",
      entityId: id,
      action: ContentAuditAction.UPDATE,
      actorId: user!.id,
      before: { isActive: existing.isActive },
      after: { isActive: updated.isActive },
    },
  });

  return NextResponse.json({ achievement: updated });
}
