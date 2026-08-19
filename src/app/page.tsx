import Link from "next/link";
import { auth } from "@/auth";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const FEATURES = [
  "Full 60-question simulations",
  "90-minute timed exams",
  "Official ServiceNow documentation references",
  "Topic-based learning across all 6 CSA domains",
  "Weak-area practice that adapts to you",
  "Flashcards for the distinctions that trip people up",
  "Detailed, source-linked explanations",
  "Progress tracking & a practice readiness score",
];

export default async function LandingPage() {
  const session = await auth();
  const ctaHref = session?.user ? "/dashboard" : "/register";
  const ctaLabel = session?.user ? "Go to your dashboard" : "Start studying free";

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-block rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground-muted">
              Independent ServiceNow CSA preparation platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Master the ServiceNow CSA Exam.
            </h1>
            <p className="mt-4 text-lg text-foreground-muted">
              Practice with realistic CSA-style exams, study verified ServiceNow concepts, and identify exactly where
              you need to improve.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href={ctaHref} size="lg">
                {ctaLabel}
              </LinkButton>
              <LinkButton href="/study" variant="secondary" size="lg">
                Browse study content
              </LinkButton>
            </div>
            <p className="mt-6 text-xs text-foreground-muted">
              Not affiliated with, endorsed by, or sponsored by ServiceNow, Inc.
            </p>
          </div>
          <Card className="p-1">
            <CardBody>
              <p className="text-sm font-medium text-foreground-muted">Why candidates use it</p>
              <ul className="mt-3 space-y-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-semibold text-foreground">Built like a real certification platform</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            title="Realistic full exams"
            body="60 questions, a 90-minute server-timed countdown, a question navigator, flagging, and domain-weighted question selection — modeled on the current public CSA blueprint."
          />
          <InfoCard
            title="Every answer, sourced"
            body="Where a concept has been checked against official ServiceNow documentation, you'll see the source and the date it was last verified — never a fabricated link."
          />
          <InfoCard
            title="Weakness detection"
            body="Every question you answer feeds topic- and domain-level accuracy tracking, so Smart Practice can recommend exactly what to study next."
          />
          <InfoCard
            title="Study without pressure"
            body="Browse the CSA domain tree, read full topic pages, drill flashcards, and use auto-generated cheat sheets — no exam required to learn."
          />
          <InfoCard
            title="Transparent content status"
            body="Every question and topic carries a validation status — verified, needs review, outdated, or draft — visible to you, not hidden."
          />
          <InfoCard
            title="Your data stays yours"
            body="Your exam history, answers, notes, and bookmarks are private to your account."
          />
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-page py-12 text-sm text-foreground-muted">
          <p className="font-medium text-foreground">A note on integrity</p>
          <p className="mt-2 max-w-3xl">
            All practice questions here are original, CSA-style questions written from publicly available ServiceNow
            documentation and learning material — this platform does not use, and will never use, leaked exam
            content, exam dumps, or confidential ServiceNow certification questions. Practice scores are an internal
            readiness indicator only; ServiceNow does not publish its official CSA cut score, so this platform never
            claims a &ldquo;pass&rdquo; or &ldquo;fail&rdquo; result.
          </p>
          <p className="mt-4">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardBody>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-foreground-muted">{body}</p>
      </CardBody>
    </Card>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-success" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
    </svg>
  );
}
