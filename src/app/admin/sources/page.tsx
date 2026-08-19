import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddSourceForm } from "./add-source-form";

export default async function AdminSourcesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/sources");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [sources, topics] = await Promise.all([
    prisma.documentationSource.findMany({ include: { topicSources: { include: { topic: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page max-w-4xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Documentation Sources</h1>
        <p className="mt-1 text-foreground-muted">
          Only URLs on the official ServiceNow allowlist (servicenow.com, docs.servicenow.com, developer.servicenow.com,
          nowlearning/learning.servicenow.com, support.servicenow.com) can be added here.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-sm font-semibold text-foreground">Add a source</h2>
          </CardHeader>
          <CardBody>
            <AddSourceForm topics={topics.map((t) => ({ id: t.id, name: t.name }))} />
          </CardBody>
        </Card>

        <div className="mt-6 space-y-3">
          {sources.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={s.tier === "TIER1" ? "success" : s.tier === "TIER2" ? "info" : "neutral"}>{s.tier}</Badge>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent hover:underline">
                    {s.title} ↗
                  </a>
                  {s.productVersion && <span className="text-xs text-foreground-muted">{s.productVersion}</span>}
                </div>
                <p className="mt-1 text-xs text-foreground-muted">{s.domainHost}</p>
                {s.excerpt && <p className="mt-1 text-sm text-foreground-muted">{s.excerpt}</p>}
                {s.topicSources.length > 0 && (
                  <p className="mt-2 text-xs text-foreground-muted">
                    Linked topics: {s.topicSources.map((ts) => ts.topic.name).join(", ")}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
