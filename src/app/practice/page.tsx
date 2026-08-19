import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PRACTICE_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

const MODES = [
  { href: "/practice/quick", title: "Quick Practice", body: "10 mixed questions — a fast check-in when you have a few minutes." },
  { href: "/practice/topic", title: "Topic Practice", body: "Drill one specific topic until it clicks." },
  { href: "/practice/domain", title: "Domain Practice", body: "Practice across an entire CSA blueprint domain." },
  { href: "/practice/weak-areas", title: "Weak Areas", body: "Smart Practice — automatically weighted toward what you're missing." },
  { href: "/practice/random", title: "Random Practice", body: "A random slice of verified questions across the whole bank." },
  { href: "/study/flashcards", title: "Flashcards", body: "Drill the A-vs-B distinctions that trip people up on exam day." },
];

export default async function PracticeHub() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/practice");

  return (
    <div>
      <SubTabs tabs={PRACTICE_TABS} />
      <div className="container-page py-8">
        <h1 className="text-2xl font-bold text-foreground">Practice</h1>
        <p className="mt-1 text-foreground-muted">Untimed by default (except Timed Practice, under Exams) — learn at your own pace.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => (
            <Card key={m.href}>
              <CardBody className="flex h-full flex-col">
                <h2 className="font-semibold text-foreground">{m.title}</h2>
                <p className="mt-1 flex-1 text-sm text-foreground-muted">{m.body}</p>
                <LinkButton href={m.href} variant="secondary" size="sm" className="mt-4 self-start">
                  Open
                </LinkButton>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
