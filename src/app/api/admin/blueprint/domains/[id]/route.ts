import { NextResponse } from "next/server";
import { z } from "zod";
import { ContentAuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";

const bodySchema = z.object({ weightPercent: z.number().min(0).max(100) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const existing = await prisma.examDomain.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const updated = await prisma.examDomain.update({ where: { id }, data: { weightPercent: parsed.data.weightPercent } });

  await prisma.contentAuditLog.create({
    data: {
      entityType: "blueprint_version",
      entityId: existing.blueprintVersionId,
      action: ContentAuditAction.UPDATE,
      actorId: user!.id,
      before: { domainId: id, weightPercent: existing.weightPercent },
      after: { domainId: id, weightPercent: updated.weightPercent },
      notes: `Domain weight for ${existing.code} updated.`,
    },
  });

  return NextResponse.json({ domain: updated });
}
