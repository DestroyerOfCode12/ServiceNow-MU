import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { ValidationBadge } from "@/components/validation-badge";
import { Badge } from "@/components/ui/badge";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/questions");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const { status, q } = await searchParams;

  const questions = await prisma.question.findMany({
    where: {
      validationStatus: status && status !== "ALL" ? (status as never) : undefined,
      questionText: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    include: { domain: true, topic: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const statuses = ["ALL", "VERIFIED", "NEEDS_REVIEW", "OUTDATED", "REJECTED", "DRAFT"];

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Questions</h1>
          <p className="text-sm text-foreground-muted">{questions.length} shown</p>
        </div>

        <form className="mt-4 flex flex-wrap gap-3">
          <select name="status" defaultValue={status ?? "ALL"} className="input w-auto">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={q ?? ""} placeholder="Search question text…" className="input w-64" />
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            Filter
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase text-foreground-muted">
              <tr>
                <th className="px-3 py-2">Question</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Topic</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Quality</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-t border-border">
                  <td className="max-w-md px-3 py-2 text-foreground">{q.questionText}</td>
                  <td className="px-3 py-2 text-foreground-muted">{q.domain.name}</td>
                  <td className="px-3 py-2 text-foreground-muted">{q.topic?.name ?? "—"}</td>
                  <td className="px-3 py-2">
                    <ValidationBadge status={q.validationStatus} />
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={q.qualityScore >= 90 ? "success" : q.qualityScore >= 80 ? "info" : "neutral"}>{q.qualityScore}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/questions/${q.id}`} className="font-medium text-accent hover:underline">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
