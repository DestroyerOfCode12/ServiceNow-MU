import { NextResponse } from "next/server";
import { BlueprintStatus, ContentAuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";

/** Activates one blueprint version and retires whichever was previously active (section 62). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const target = await prisma.blueprintVersion.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.blueprintVersion.updateMany({ where: { status: BlueprintStatus.ACTIVE }, data: { status: BlueprintStatus.RETIRED } }),
    prisma.blueprintVersion.update({ where: { id }, data: { status: BlueprintStatus.ACTIVE } }),
  ]);

  await prisma.contentAuditLog.create({
    data: {
      entityType: "blueprint_version",
      entityId: id,
      action: ContentAuditAction.UPDATE,
      actorId: user!.id,
      after: { status: "ACTIVE" },
      notes: `Blueprint ${target.version} activated; previous active version retired.`,
    },
  });

  return NextResponse.json({ ok: true });
}
