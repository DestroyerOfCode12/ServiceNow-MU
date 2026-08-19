import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { ValidationBadge } from "@/components/validation-badge";

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [total, byStatus, byDomain, missingSource, needsReviewList] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ["validationStatus"], _count: true }),
    prisma.question.groupBy({ by: ["domainId"], _count: true }),
    prisma.question.count({ where: { officialSourceUrl: null } }),
    prisma.questionValidation.count({ where: { hasConflict: true } }),
  ]);

  const domains = await prisma.examDomain.findMany({ where: { id: { in: byDomain.map((d) => d.domainId) } } });
  const domainMap = new Map(domains.map((d) => [d.id, d]));
  const statusMap = new Map(byStatus.map((s) => [s.validationStatus, s._count]));

  const topicCounts = await prisma.question.groupBy({ by: ["topicId"], _count: true, orderBy: { _count: { topicId: "desc" } } });
  const topics = await prisma.topic.findMany({ where: { id: { in: topicCounts.map((t) => t.topicId).filter((x): x is string => !!x) } } });
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-foreground">Content Validation Dashboard</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Questions" value={total} />
          <StatCard label="Verified" value={statusMap.get("VERIFIED") ?? 0} variant="success" />
          <StatCard label="Needs Review" value={statusMap.get("NEEDS_REVIEW") ?? 0} variant="warning" />
          <StatCard label="Outdated" value={statusMap.get("OUTDATED") ?? 0} variant="danger" />
          <StatCard label="Rejected" value={statusMap.get("REJECTED") ?? 0} variant="danger" />
          <StatCard label="Draft" value={statusMap.get("DRAFT") ?? 0} variant="neutral" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardBody>
              <h2 className="mb-3 font-semibold text-foreground">Questions by CSA Domain</h2>
              <ul className="space-y-1.5 text-sm">
                {byDomain.map((d) => (
                  <li key={d.domainId} className="flex justify-between border-b border-border pb-1.5 last:border-0">
                    <span className="text-foreground">{domainMap.get(d.domainId)?.name ?? d.domainId}</span>
                    <span className="text-foreground-muted">{d._count}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-3 font-semibold text-foreground">Questions by Topic</h2>
              <ul className="max-h-64 space-y-1.5 overflow-y-auto text-sm">
                {topicCounts.map((t) => (
                  <li key={t.topicId ?? "none"} className="flex justify-between border-b border-border pb-1.5 last:border-0">
                    <span className="text-foreground">{t.topicId ? (topicMap.get(t.topicId)?.name ?? t.topicId) : "Unassigned"}</span>
                    <span className="text-foreground-muted">{t._count}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-3 font-semibold text-foreground">Questions by Validation Status</h2>
              <ul className="space-y-2">
                {[...statusMap.entries()].map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between">
                    <ValidationBadge status={status} />
                    <span className="text-sm text-foreground-muted">{count}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-3 font-semibold text-foreground">Content Gaps</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-foreground">Questions missing official sources</span>
                  <span className="font-medium text-foreground-muted">{missingSource}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-foreground">Questions with conflicting documentation</span>
                  <span className="font-medium text-foreground-muted">{needsReviewList}</span>
                </li>
              </ul>
              <Link href="/admin/validation" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
                Open review queue →
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, variant }: { label: string; value: number; variant?: "success" | "warning" | "danger" | "neutral" }) {
  const colors: Record<string, string> = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-foreground-muted",
  };
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-foreground-muted">{label}</p>
        <p className={`text-2xl font-bold ${variant ? colors[variant] : "text-foreground"}`}>{value}</p>
      </CardBody>
    </Card>
  );
}
