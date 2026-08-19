import { redirect } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { ValidationBadge } from "@/components/validation-badge";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 25;

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/questions");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const { status, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = {
    validationStatus: status && status !== "ALL" ? (status as never) : undefined,
    questionText: q ? { contains: q, mode: "insensitive" as const } : undefined,
  };

  const [questions, totalCount] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { domain: true, topic: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.question.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageQuery = (p: number) => {
    const params = new URLSearchParams();
    if (status && status !== "ALL") params.set("status", status);
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  const statuses = ["ALL", "VERIFIED", "NEEDS_REVIEW", "OUTDATED", "REJECTED", "DRAFT"];

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Questions</h1>
          <p className="text-sm text-foreground-muted">
            {totalCount} total · showing {questions.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + questions.length}
          </p>
        </div>

        <form className="mt-4 flex flex-wrap gap-3">
          <select name="status" defaultValue={status ?? "ALL"} className="input w-auto">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={q ?? ""} placeholder="Search question text…" className="input w-full sm:w-64" />
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            Filter
          </button>
        </form>

        {/* overflow-x-auto only kicks in when the table can't shrink further — the table
            below carries an explicit min-width so columns keep readable widths and the
            whole row scrolls horizontally on narrow screens instead of every cell's text
            being force-wrapped into illegible slivers. */}
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[860px] text-sm">
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
                  <td className="whitespace-nowrap px-3 py-2 text-foreground-muted">{q.domain.name}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-foreground-muted">{q.topic?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <ValidationBadge status={q.validationStatus} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <Badge variant={q.qualityScore >= 90 ? "success" : q.qualityScore >= 80 ? "info" : "neutral"}>{q.qualityScore}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <Link href={`/admin/questions/${q.id}`} className="font-medium text-accent hover:underline">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
            <Link
              href={pageQuery(page - 1)}
              aria-disabled={page <= 1}
              className={clsx(
                "rounded-md border border-border px-3 py-2 text-sm font-medium",
                page <= 1 ? "pointer-events-none text-foreground-muted/50" : "text-foreground hover:bg-surface-muted",
              )}
            >
              ← Previous
            </Link>
            <span className="text-sm text-foreground-muted">
              Page {page} of {totalPages}
            </span>
            <Link
              href={pageQuery(page + 1)}
              aria-disabled={page >= totalPages}
              className={clsx(
                "rounded-md border border-border px-3 py-2 text-sm font-medium",
                page >= totalPages ? "pointer-events-none text-foreground-muted/50" : "text-foreground hover:bg-surface-muted",
              )}
            >
              Next →
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
