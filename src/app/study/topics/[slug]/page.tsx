import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { DocumentationValidator } from "@/lib/validation/documentation-validator";
import { SubTabs } from "@/components/nav/sub-tabs";
import { STUDY_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ValidationBadge } from "@/components/validation-badge";
import { MarkdownLite } from "@/components/markdown-lite";
import { BookmarkButton } from "@/components/bookmark-button";
import { NoteEditor } from "@/components/note-editor";

const SECTIONS: { key: keyof NonNullable<Awaited<ReturnType<typeof getTopic>>>; title: string }[] = [
  { key: "overview", title: "What is it?" },
  { key: "whyItMatters", title: "Why does it matter?" },
  { key: "coreConcepts", title: "Core Concepts" },
  { key: "terminology", title: "Important Terminology" },
  { key: "howItWorks", title: "How it works" },
  { key: "adminTasks", title: "Common Administrator Tasks" },
  { key: "examFocus", title: "CSA Exam Focus" },
  { key: "commonTraps", title: "Common Traps" },
  { key: "exampleScenario", title: "Example Scenario" },
];

async function getTopic(slug: string) {
  return prisma.topic.findUnique({
    where: { slug },
    include: {
      domain: true,
      subtopics: { orderBy: { sortOrder: "asc" } },
      sources: { include: { source: true } },
      questions: { select: { id: true, questionText: true, difficulty: true, validationStatus: true }, take: 8 },
      _count: { select: { questions: true, flashcards: true } },
    },
  });
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const user = await getCurrentUser();
  const bookmark = user ? await prisma.bookmark.findUnique({ where: { userId_entityType_entityId: { userId: user.id, entityType: "TOPIC", entityId: topic.id } } }) : null;
  const note = user ? await prisma.note.findFirst({ where: { userId: user.id, entityType: "TOPIC", entityId: topic.id } }) : null;

  const stale = DocumentationValidator.isStale(topic.lastValidatedAt);
  const primarySource = topic.sources[0]?.source;

  return (
    <div>
      <SubTabs tabs={STUDY_TABS} />
      <div className="container-page max-w-4xl py-10">
        <p className="text-sm text-foreground-muted">
          <Link href="/study" className="hover:underline">
            CSA Domains
          </Link>{" "}
          / {topic.domain.name}
        </p>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">{topic.name}</h1>
          {user && <BookmarkButton entityType="TOPIC" entityId={topic.id} initialBookmarked={!!bookmark} />}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ValidationBadge status={topic.validationStatus} />
          {topic.lastValidatedAt && (
            <span className="text-xs text-foreground-muted">Last validated {topic.lastValidatedAt.toLocaleDateString()}</span>
          )}
        </div>

        {stale && (
          <div className="mt-4 rounded-md bg-warning-bg px-4 py-3 text-sm text-warning">
            This topic has not been validated against ServiceNow documentation in over 180 days. Treat details as
            potentially outdated until re-validated.
          </div>
        )}
        {topic.validationStatus !== "VERIFIED" && (
          <div className="mt-4 rounded-md bg-surface-muted px-4 py-3 text-sm text-foreground-muted">
            This content has not yet been verified against current official ServiceNow documentation.
            {topic.validationNotes && <span> {topic.validationNotes}</span>}
          </div>
        )}

        {topic.subtopics.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {topic.subtopics.map((s) => (
              <span key={s.id} className="rounded-full border border-border px-3 py-1 text-xs text-foreground-muted">
                {s.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-8">
          {SECTIONS.map((section) => {
            const value = topic[section.key] as string | null;
            if (!value) return null;
            return (
              <section key={String(section.key)}>
                <h2 className="mb-2 text-lg font-semibold text-foreground">{section.title}</h2>
                <MarkdownLite text={value} />
              </section>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardBody>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Practice Questions</h2>
            {topic._count.questions === 0 ? (
              <p className="text-sm text-foreground-muted">No practice questions for this topic yet.</p>
            ) : (
              <>
                <p className="mb-3 text-sm text-foreground-muted">{topic._count.questions} questions available for this topic.</p>
                <LinkButton href="/practice/topic" variant="secondary" size="sm">
                  Practice this topic →
                </LinkButton>
              </>
            )}
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardBody>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Official ServiceNow Documentation</h2>
            {primarySource ? (
              <a href={primarySource.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent hover:underline">
                {primarySource.title} ↗
              </a>
            ) : (
              <p className="text-sm text-foreground-muted">This content has not yet been verified against current official ServiceNow documentation.</p>
            )}
          </CardBody>
        </Card>

        {user && (
          <div className="mt-6">
            <NoteEditor entityType="TOPIC" entityId={topic.id} initialContent={note?.content ?? ""} />
          </div>
        )}
      </div>
    </div>
  );
}
