import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeightEditor } from "./weight-editor";
import { ActivateButton } from "./activate-button";

export default async function AdminBlueprintPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/blueprint");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const versions = await prisma.blueprintVersion.findMany({ include: { domains: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } });
  const active = versions.find((v) => v.status === "ACTIVE");

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page max-w-3xl py-10">
        <h1 className="text-2xl font-bold text-foreground">CSA Blueprint</h1>
        <p className="mt-1 text-foreground-muted">
          The domain structure and weighting driving exam generation are stored here, not hard-coded in the
          application. When ServiceNow revises the CSA blueprint, create a new version and activate it — questions
          are automatically re-evaluated against the new structure.
        </p>

        {active && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Active: {active.version}</h2>
                <Badge variant="success">ACTIVE</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-foreground-muted">
                {active.questionCount} questions · {active.examDurationMinutes} minutes · effective {active.effectiveDate.toLocaleDateString()}
              </p>
              {active.sourceUrl && (
                <a href={active.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-accent hover:underline">
                  {active.sourceTitle ?? "Source"} ↗
                </a>
              )}
              <div className="mt-4">
                <WeightEditor domains={active.domains.map((d) => ({ id: d.id, code: d.code, name: d.name, weightPercent: d.weightPercent }))} />
              </div>
            </CardBody>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <h2 className="font-semibold text-foreground">All Blueprint Versions</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{v.version}</p>
                  <p className="text-xs text-foreground-muted">
                    {v.questionCount}q · {v.examDurationMinutes}min · {v.domains.length} domains
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={v.status === "ACTIVE" ? "success" : v.status === "DRAFT" ? "warning" : "neutral"}>{v.status}</Badge>
                  {v.status !== "ACTIVE" && <ActivateButton versionId={v.id} />}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
