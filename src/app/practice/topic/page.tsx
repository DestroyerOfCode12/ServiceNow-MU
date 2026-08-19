import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PRACTICE_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { TopicPicker } from "./topic-picker";

export default async function TopicPracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/practice/topic");

  const topics = await prisma.topic.findMany({
    include: { domain: true, _count: { select: { questions: true } } },
    orderBy: [{ domain: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <SubTabs tabs={PRACTICE_TABS} />
      <div className="container-page max-w-xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Topic Practice</h1>
        <Card className="mt-6">
          <CardBody>
            <TopicPicker
              topics={topics.map((t) => ({ id: t.id, name: t.name, domainName: t.domain.name, questionCount: t._count.questions }))}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
