import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PRACTICE_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { StartAttemptButton } from "@/components/exam/start-attempt-button";

export default async function RandomPracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/practice/random");

  return (
    <div>
      <SubTabs tabs={PRACTICE_TABS} />
      <div className="container-page max-w-xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Random Practice</h1>
        <Card className="mt-6">
          <CardBody className="space-y-4">
            <p className="text-foreground-muted">A random slice of verified questions across the whole bank, untimed.</p>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 40].map((n) => (
                <StartAttemptButton key={n} request={{ mode: "RANDOM_PRACTICE", count: n }} variant="secondary">
                  {n} questions
                </StartAttemptButton>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
