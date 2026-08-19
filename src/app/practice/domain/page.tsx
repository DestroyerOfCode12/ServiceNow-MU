import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PRACTICE_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { DomainPicker } from "./domain-picker";

export default async function DomainPracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/practice/domain");

  const domains = await prisma.examDomain.findMany({
    where: { blueprintVersion: { status: "ACTIVE" } },
    include: { _count: { select: { questions: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <SubTabs tabs={PRACTICE_TABS} />
      <div className="container-page max-w-xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Domain Practice</h1>
        <Card className="mt-6">
          <CardBody>
            <DomainPicker domains={domains.map((d) => ({ id: d.id, code: d.code, name: d.name, questionCount: d._count.questions }))} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
