import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { EXAM_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { TimedPracticeForm } from "./timed-form";

export default async function TimedPracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/exams/timed");

  const domains = await prisma.examDomain.findMany({ where: { blueprintVersion: { status: "ACTIVE" } }, orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <SubTabs tabs={EXAM_TABS} />
      <div className="container-page max-w-xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Timed Practice</h1>
        <p className="mt-1 text-foreground-muted">Configure your own question count and time limit.</p>
        <Card className="mt-6">
          <CardBody>
            <TimedPracticeForm domains={domains.map((d) => ({ id: d.id, name: `${d.code} — ${d.name}` }))} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
