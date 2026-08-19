import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddAchievementForm } from "./add-achievement-form";
import { AchievementActiveToggle } from "./achievement-active-toggle";

export default async function AdminAchievementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/achievements");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const achievements = await prisma.achievement.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }],
    include: { _count: { select: { unlocks: true } } },
  });

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page max-w-4xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
        <p className="mt-1 text-foreground-muted">
          Badges are entirely admin-defined here — nothing is hard-coded in the app. Criteria types are a fixed vocabulary
          (streak days, questions answered, exams completed, etc.); the specific name, description, icon, and threshold for
          each badge are yours to edit.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-sm font-semibold text-foreground">Add an achievement</h2>
          </CardHeader>
          <CardBody>
            <AddAchievementForm />
          </CardBody>
        </Card>

        <div className="mt-6 space-y-3">
          {achievements.map((a) => (
            <Card key={a.id} className={a.isActive ? undefined : "opacity-60"}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {a.icon}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{a.name}</h3>
                        <Badge variant={a.isActive ? "success" : "neutral"}>{a.isActive ? "Active" : "Retired"}</Badge>
                        <span className="font-mono text-xs text-foreground-muted">{a.code}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground-muted">{a.description}</p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        {a.criteriaType}
                        {a.criteriaThreshold != null ? ` ≥ ${a.criteriaThreshold}` : ""} · {a.xpReward} XP ·{" "}
                        {a._count.unlocks} {a._count.unlocks === 1 ? "user has" : "users have"} unlocked this
                      </p>
                    </div>
                  </div>
                  <AchievementActiveToggle id={a.id} isActive={a.isActive} />
                </div>
              </CardBody>
            </Card>
          ))}
          {achievements.length === 0 && <p className="text-sm text-foreground-muted">No achievements yet — add one above.</p>}
        </div>
      </div>
    </div>
  );
}
