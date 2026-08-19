import { NextResponse } from "next/server";
import { z } from "zod";
import { BookmarkEntityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";

const bodySchema = z.object({
  entityType: z.nativeEnum(BookmarkEntityType),
  entityId: z.string().min(1),
});

export async function GET(req: Request) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const entityType = new URL(req.url).searchParams.get("entityType");
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user!.id, entityType: entityType ? (entityType as BookmarkEntityType) : undefined },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_entityType_entityId: { userId: user!.id, ...parsed.data } },
    update: {},
    create: { userId: user!.id, ...parsed.data },
  });
  return NextResponse.json({ bookmark }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  await prisma.bookmark
    .delete({ where: { userId_entityType_entityId: { userId: user!.id, ...parsed.data } } })
    .catch(() => null);
  return NextResponse.json({ ok: true });
}
