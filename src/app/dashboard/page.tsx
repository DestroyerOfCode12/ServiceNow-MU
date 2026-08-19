import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { computeReadiness } from "@/lib/exam/readiness";
import { getLifetimeXp, levelFromXp } from "@/lib/gamification/xp";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const [profile, exposures, fullExams, readiness, lifetimeXp, achievementCount, unlockedAchievements] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.questionExposure.findMany({ where: { userId: user.id } }),
    prisma.examAttempt.findMany({ where: { userId: user.id, mode: "FULL_EXAM", status: "SUBMITTED" } }),
    computeReadiness(user.id),
    getLifetimeXp(prisma, user.id),
    prisma.achievement.count({ where: { isActive: true } }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
      take: 6,
      include: { achievement: true },
    }),
  ]);
  const level = levelFromXp(lifetimeXp);

  const questionsAnswered = exposures.reduce((s, e) => s + e.timesCorrect + e.timesIncorrect, 0);
  const questionsCorrect = exposures.reduce((s, e) => s + e.timesCorrect, 0);
  const accuracy = questionsAnswered > 0 ? (questionsCorrect / questionsAnswered) * 100 : 0;
  const mastered = exposures.filter((e) => e.timesCorrect >= 2 && e.timesIncorrect === 0).length;
  const avgExamScore = fullExams.length > 0 ? fullExams.reduce((s, e) => s + (e.scorePercent ?? 0), 0) / fullExams.length : null;
  const studyMinutes = Math.round((profile?.totalStudyTimeSeconds ?? 0) / 60);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-foreground">CSA Preparation</h1>
      <p className="text-foreground-muted">Welcome back, {user.name ?? user.email}.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground-muted">Overall readiness</p>
              <p className="text-sm font-semibold text-accent">{readiness.score} / 100 · {readiness.band}</p>
            </div>
            <ProgressBar value={readiness.score} className="mt-2" />

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="Questions answered" value={String(questionsAnswered)} />
              <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} />
              <Stat label="Questions mastered" value={String(mastered)} />
              <Stat label="Study time" value={formatMinutes(studyMinutes)} />
              <Stat label="Full exams" value={String(fullExams.length)} />
              <Stat label="Avg. exam score" value={avgExamScore != null ? `${avgExamScore.toFixed(0)}%` : "—"} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-xl">🔥</span>
              <p className="text-lg font-semibold text-foreground">{profile?.studyStreakDays ?? 0} Day Streak</p>
            </div>
            <p className="mt-1 text-xs text-foreground-muted">Longest streak: {profile?.longestStreakDays ?? 0} days</p>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-foreground">Recommended study</p>
              <ol className="space-y-1.5">
                {readiness.recommendations.map((r, i) => (
                  <li key={r} className="text-sm text-foreground-muted">
                    {i + 1}. {r}
                  </li>
                ))}
              </ol>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground-muted">Level {level.level}</p>
              <p className="text-xs text-foreground-muted">
                {level.xpIntoLevel} / {level.xpForNextLevel} XP to level {level.level + 1} · {lifetimeXp} XP total
              </p>
            </div>
            <p className="text-xs text-foreground-muted">
              {unlockedAchievements.length > 0 ? `${unlockedAchievements.length}` : "0"} of {achievementCount} achievements unlocked
            </p>
          </div>
          <ProgressBar value={level.progressPercent} className="mt-2" />

          {unlockedAchievements.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {unlockedAchievements.map((u) => (
                <span
                  key={u.id}
                  title={u.achievement.description}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  <span aria-hidden="true">{u.achievement.icon}</span>
                  {u.achievement.name}
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <LinkButton href="/practice/weak-areas" variant="secondary">
          Practice weak areas
        </LinkButton>
        <LinkButton href="/exams" variant="secondary">
          Take a full exam
        </LinkButton>
        <LinkButton href="/progress/readiness" variant="secondary">
          View readiness breakdown
        </LinkButton>
      </div>

      <p className="mt-6 text-sm text-foreground-muted">
        Want the details? See{" "}
        <Link href="/progress" className="font-medium text-accent hover:underline">
          Progress
        </Link>{" "}
        for domain-by-domain performance and study history.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
