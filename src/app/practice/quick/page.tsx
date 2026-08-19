import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PRACTICE_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { StartAttemptButton } from "@/components/exam/start-attempt-button";

export default async function QuickPracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/practice/quick");

  return (
    <div>
      <SubTabs tabs={PRACTICE_TABS} />
      <div className="container-page max-w-xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Quick Practice</h1>
        <Card className="mt-6">
          <CardBody>
            <p className="text-foreground-muted">
              10 questions, untimed, drawn from across every CSA domain — prioritizing verified content and
              questions you haven&apos;t seen recently.
            </p>
            <StartAttemptButton request={{ mode: "QUICK_PRACTICE" }} className="mt-6 w-full">
              Start Quick Practice
            </StartAttemptButton>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
