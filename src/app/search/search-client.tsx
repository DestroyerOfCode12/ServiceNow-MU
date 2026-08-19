"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";

interface SearchResults {
  topics: { id: string; slug: string; name: string; validationStatus: string }[];
  questions: { id: string; questionText: string; topic: { slug: string; name: string } | null }[];
  flashcards: { id: string; term: string; definition: string }[];
}

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q") ?? "";
    const controller = new AbortController();

    // Runs as a microtask rather than synchronously in the effect body, so
    // the initial state update is a reaction to this effect's own async
    // work (the fetch/clear decision) rather than a same-tick render cascade.
    Promise.resolve().then(async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        setResults(await res.json());
      } catch {
        // aborted or network error — leave previous results as-is
      } finally {
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, [searchParams]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search topics, questions, flashcards… e.g. ACL, coalesce, CSDM"
          className="input"
          autoFocus
        />
      </form>

      {loading && <p className="mt-4 text-sm text-foreground-muted">Searching…</p>}

      {results && (
        <div className="mt-6 space-y-6">
          <ResultSection title="Topics">
            {results.topics.map((t) => (
              <Link key={t.id} href={`/study/topics/${t.slug}`} className="block rounded-md px-3 py-2 hover:bg-surface-muted">
                {t.name}
              </Link>
            ))}
          </ResultSection>
          <ResultSection title="Questions">
            {results.questions.map((qn) => (
              <div key={qn.id} className="rounded-md px-3 py-2">
                <p className="text-sm text-foreground">{qn.questionText}</p>
                {qn.topic && (
                  <Link href={`/study/topics/${qn.topic.slug}`} className="text-xs font-medium text-accent hover:underline">
                    {qn.topic.name} →
                  </Link>
                )}
              </div>
            ))}
          </ResultSection>
          <ResultSection title="Flashcards">
            {results.flashcards.map((f) => (
              <div key={f.id} className="rounded-md px-3 py-2">
                <p className="text-sm font-medium text-foreground">{f.term}</p>
                <p className="text-xs text-foreground-muted">{f.definition}</p>
              </div>
            ))}
          </ResultSection>
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some(Boolean);
  return (
    <Card>
      <CardBody>
        <h2 className="mb-2 text-sm font-semibold text-foreground">{title}</h2>
        {hasItems ? <div className="divide-y divide-border">{children}</div> : <p className="text-sm text-foreground-muted">No matches.</p>}
      </CardBody>
    </Card>
  );
}
