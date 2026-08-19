import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { STUDY_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { ValidationBadge } from "@/components/validation-badge";
import { MarkdownLite } from "@/components/markdown-lite";

/**
 * Cheat sheets are generated at request time from each topic's already-
 * validated `coreConcepts` / `terminology` / `commonTraps` fields — never a
 * separately hand-maintained copy that could drift from the source topic.
 */

// Content is admin-editable and DB-backed — never statically frozen at build time.
export const dynamic = "force-dynamic";

const CHEAT_SHEETS: { title: string; topicSlugs: string[] }[] = [
  { title: "ACL Cheat Sheet", topicSlugs: ["access-control"] },
  { title: "Update Set Cheat Sheet", topicSlugs: ["system-update-sets"] },
  { title: "Import Set & Coalesce Cheat Sheet", topicSlugs: ["importing-data"] },
  { title: "Service Catalog Cheat Sheet", topicSlugs: ["service-catalog"] },
  { title: "CMDB / CSDM Cheat Sheet", topicSlugs: ["cmdb", "csdm"] },
  { title: "Flow Designer Cheat Sheet", topicSlugs: ["workflow-studio"] },
  { title: "Client vs. Server Cheat Sheet", topicSlugs: ["scripting-in-servicenow", "business-rules", "ui-policies"] },
  { title: "Forms & Lists Cheat Sheet", topicSlugs: ["forms", "lists-filters-tags"] },
  { title: "Shared Responsibility & Security Cheat Sheet", topicSlugs: ["shared-responsibility-model", "security-center"] },
];

export default async function CheatSheetsPage() {
  const allSlugs = CHEAT_SHEETS.flatMap((c) => c.topicSlugs);
  const topics = await prisma.topic.findMany({ where: { slug: { in: allSlugs } } });
  const bySlug = new Map(topics.map((t) => [t.slug, t]));

  return (
    <div>
      <SubTabs tabs={STUDY_TABS} />
      <div className="container-page max-w-4xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Cheat Sheets</h1>
        <p className="mt-1 text-foreground-muted">
          Auto-generated from each topic&apos;s validated core concepts and terminology — never a separate,
          hand-copied version that could drift out of sync.
        </p>

        <div className="mt-8 space-y-6">
          {CHEAT_SHEETS.map((sheet) => {
            const topicsForSheet = sheet.topicSlugs.map((s) => bySlug.get(s)).filter((t): t is NonNullable<typeof t> => !!t);
            if (topicsForSheet.length === 0) return null;
            return (
              <Card key={sheet.title}>
                <CardBody>
                  <h2 className="text-lg font-semibold text-foreground">{sheet.title}</h2>
                  <div className="mt-4 space-y-6">
                    {topicsForSheet.map((t) => (
                      <div key={t.id}>
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                          <ValidationBadge status={t.validationStatus} />
                        </div>
                        {t.coreConcepts && (
                          <div className="mb-3">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-muted">Core concepts</p>
                            <MarkdownLite text={t.coreConcepts} />
                          </div>
                        )}
                        {t.terminology && (
                          <div className="mb-3">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-muted">Terminology</p>
                            <MarkdownLite text={t.terminology} />
                          </div>
                        )}
                        {t.commonTraps && (
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-muted">Common traps</p>
                            <MarkdownLite text={t.commonTraps} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
