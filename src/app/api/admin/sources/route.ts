import { NextResponse } from "next/server";
import { z } from "zod";
import { SourceTier, ContentAuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";
import { DocumentationValidator } from "@/lib/validation/documentation-validator";
import { classifySourceUrl } from "@/lib/validation/source-allowlist";

const bodySchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  productVersion: z.string().optional(),
  excerpt: z.string().optional(),
  topicId: z.string().cuid().optional(),
});

export async function POST(req: Request) {
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const check = DocumentationValidator.validateSourceUrl(parsed.data.url);
  if (!check.accepted) return NextResponse.json({ error: check.reason }, { status: 422 });

  const { host, tier } = classifySourceUrl(parsed.data.url);

  const source = await prisma.documentationSource.create({
    data: {
      title: parsed.data.title,
      url: parsed.data.url,
      domainHost: host,
      tier: tier ?? SourceTier.TIER3,
      productVersion: parsed.data.productVersion,
      excerpt: parsed.data.excerpt,
      fetchedAt: new Date(),
    },
  });

  if (parsed.data.topicId) {
    await prisma.topicSource.create({ data: { topicId: parsed.data.topicId, sourceId: source.id } });
  }

  await prisma.contentAuditLog.create({
    data: { entityType: "documentation_source", entityId: source.id, action: ContentAuditAction.CREATE, actorId: user!.id, after: source },
  });

  return NextResponse.json({ source }, { status: 201 });
}
