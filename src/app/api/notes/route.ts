import { NextResponse } from "next/server";
import { z } from "zod";
import { BookmarkEntityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";

const upsertSchema = z.object({
  entityType: z.nativeEnum(BookmarkEntityType),
  entityId: z.string().min(1),
  content: z.string().max(5000),
});

const deleteSchema = z.object({ id: z.string().cuid() });

export async function GET(req: Request) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const url = new URL(req.url);
  const entityType = url.searchParams.get("entityType");
  const entityId = url.searchParams.get("entityId");

  const notes = await prisma.note.findMany({
    where: {
      userId: user!.id,
      entityType: entityType ? (entityType as BookmarkEntityType) : undefined,
      entityId: entityId ?? undefined,
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = upsertSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const existing = await prisma.note.findFirst({
    where: { userId: user!.id, entityType: parsed.data.entityType, entityId: parsed.data.entityId },
  });

  const note = existing
    ? await prisma.note.update({ where: { id: existing.id }, data: { content: parsed.data.content } })
    : await prisma.note.create({ data: { userId: user!.id, ...parsed.data } });

  return NextResponse.json({ note }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = deleteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const note = await prisma.note.findUnique({ where: { id: parsed.data.id } });
  if (!note || note.userId !== user!.id) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.note.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}
