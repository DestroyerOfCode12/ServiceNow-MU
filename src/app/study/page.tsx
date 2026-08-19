import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { STUDY_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { ValidationBadge } from "@/components/validation-badge";

// Content is admin-editable and DB-backed — never statically frozen at build time.
export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const domains = await prisma.examDomain.findMany({
    where: { blueprintVersion: { status: "ACTIVE" } },
    orderBy: { sortOrder: "asc" },
    include: {
      topics: {
        orderBy: { sortOrder: "asc" },
        include: { subtopics: { orderBy: { sortOrder: "asc" } }, _count: { select: { questions: true } } },
      },
    },
  });

  return (
    <div>
      <SubTabs tabs={STUDY_TABS} />
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-foreground">CSA Domains</h1>
        <p className="mt-1 text-foreground-muted">
          Browse the current CSA blueprint domain by domain. Each topic page is validated against official
          ServiceNow documentation where a source has been confirmed — look for the status badge.
        </p>

        <div className="mt-8 space-y-6">
          {domains.map((d) => (
            <Card key={d.id}>
              <CardBody>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {d.code} — {d.name}
                  </h2>
                  <span className="text-sm font-medium text-foreground-muted">{d.weightPercent}% of exam</span>
                </div>
                {d.description && <p className="mt-1 text-sm text-foreground-muted">{d.description}</p>}

                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {d.topics.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/study/topics/${t.slug}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted"
                      >
                        <span className="text-foreground">
                          {t.name}
                          {t.subtopics.length > 0 && <span className="ml-1 text-xs text-foreground-muted">({t.subtopics.length} subtopics)</span>}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-foreground-muted">{t._count.questions}q</span>
                          <ValidationBadge status={t.validationStatus} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
