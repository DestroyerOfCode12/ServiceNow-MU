"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ClientAttempt, ClientQuestion } from "@/lib/exam/types";
import { formatTime } from "@/lib/format-time";

const MODE_TITLES: Record<string, string> = {
  FULL_EXAM: "ServiceNow CSA Practice Exam",
  TIMED_PRACTICE: "Timed Practice Session",
  QUICK_PRACTICE: "Quick Practice",
  TOPIC_PRACTICE: "Topic Practice",
  DOMAIN_PRACTICE: "Domain Practice",
  WEAK_AREA_PRACTICE: "Smart Practice — Weak Areas",
  RANDOM_PRACTICE: "Random Practice",
};

export function AttemptRunner({ attempt }: { attempt: ClientAttempt }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<ClientQuestion[]>(attempt.questions);
  const [index, setIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const deadline = attempt.serverDeadlineAt ? new Date(attempt.serverDeadlineAt).getTime() : null;
  const [remaining, setRemaining] = useState<number | null>(null);
  const autoSubmitted = useRef(false);
  const questionEnteredAt = useRef<number>(0);

  const current = questions[index];
  const answeredCount = questions.filter((q) => q.selectedOptionIds.length > 0).length;
  const unansweredCount = questions.length - answeredCount;

  const submit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/attempts/${attempt.attemptId}/submit`, { method: "POST" });
    if (res.ok) {
      router.push(`/attempt/${attempt.attemptId}/results`);
    } else {
      setSubmitting(false);
      setSaveError("Could not submit — please try again.");
    }
  }, [attempt.attemptId, router, submitting]);

  // Timer
  useEffect(() => {
    if (deadline === null) return;
    const tick = () => {
      const secs = Math.max(0, (deadline - Date.now()) / 1000);
      setRemaining(secs);
      if (secs <= 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        submit();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline, submit]);

  useEffect(() => {
    questionEnteredAt.current = Date.now();
  }, [index]);

  async function saveAnswer(examQuestionId: string, selectedOptionIds: string[], confidenceRating?: number) {
    setQuestions((qs) => qs.map((q) => (q.examQuestionId === examQuestionId ? { ...q, selectedOptionIds, confidenceRating: confidenceRating ?? q.confidenceRating } : q)));
    const responseTimeSeconds = Math.round((Date.now() - questionEnteredAt.current) / 1000);
    const res = await fetch(`/api/attempts/${attempt.attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examQuestionId, selectedOptionIds, confidenceRating, responseTimeSeconds }),
    });
    if (res.status === 409) {
      router.push(`/attempt/${attempt.attemptId}/results`);
    } else if (!res.ok) {
      setSaveError("Your last change may not have saved. Check your connection.");
    } else {
      setSaveError(null);
    }
  }

  function toggleOption(optionId: string) {
    if (!current) return;
    const isMulti = current.questionType === "MULTIPLE_SELECT";
    const cap = current.requiredSelectionCount ?? current.options.length;

    if (!isMulti) {
      saveAnswer(current.examQuestionId, [optionId]);
      return;
    }

    const already = current.selectedOptionIds.includes(optionId);
    let next: string[];
    if (already) {
      next = current.selectedOptionIds.filter((id) => id !== optionId);
    } else {
      if (current.selectedOptionIds.length >= cap) return; // prevent selecting more than allowed
      next = [...current.selectedOptionIds, optionId];
    }
    saveAnswer(current.examQuestionId, next);
  }

  async function toggleFlag() {
    if (!current) return;
    const nextFlag = !current.isFlagged;
    setQuestions((qs) => qs.map((q) => (q.examQuestionId === current.examQuestionId ? { ...q, isFlagged: nextFlag } : q)));
    await fetch(`/api/attempts/${attempt.attemptId}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examQuestionId: current.examQuestionId, flagged: nextFlag }),
    });
  }

  function clearAnswer() {
    if (!current) return;
    saveAnswer(current.examQuestionId, []);
  }

  const title = MODE_TITLES[attempt.mode] ?? "Practice Session";

  if (!current) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-foreground-muted">
              Question {index + 1} of {questions.length}
            </p>
          </div>
          {remaining !== null && (
            <div
              className={clsx(
                "rounded-lg border px-4 py-2 text-center font-mono text-lg font-semibold tabular-nums",
                remaining < 300 ? "border-danger bg-danger-bg text-danger" : "border-border bg-surface-muted text-foreground",
              )}
              aria-live="polite"
            >
              <div className="text-[10px] font-sans font-normal uppercase tracking-wide text-foreground-muted">Time remaining</div>
              {formatTime(remaining)}
            </div>
          )}
        </div>
      </header>

      <div className="container-page flex flex-1 flex-col gap-6 py-6 lg:flex-row">
        <div className="flex-1">
          <QuestionCard question={current} onToggle={toggleOption} onConfidence={(c) => saveAnswer(current.examQuestionId, current.selectedOptionIds, c)} />

          {saveError && (
            <p role="alert" className="mt-3 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning">
              {saveError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
              Previous
            </Button>
            <Button variant="secondary" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={index === questions.length - 1}>
              Next
            </Button>
            <Button variant={current.isFlagged ? "accent" : "secondary"} onClick={toggleFlag}>
              {current.isFlagged ? "Unflag question" : "Flag question"}
            </Button>
            <Button variant="ghost" onClick={clearAnswer} disabled={current.selectedOptionIds.length === 0}>
              Clear answer
            </Button>
            {current.topicSlug && (
              <Link href={`/study/topics/${current.topicSlug}`} target="_blank" className="ml-auto text-sm font-medium text-accent hover:underline">
                Learn more →
              </Link>
            )}
          </div>
        </div>

        <aside className="w-full shrink-0 lg:w-72">
          <Navigator questions={questions} currentIndex={index} onJump={setIndex} />
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-sm text-foreground-muted">
              {answeredCount} answered · {unansweredCount} unanswered · {questions.filter((q) => q.isFlagged).length} flagged
            </p>
            <Button onClick={() => setShowSubmitConfirm(true)} disabled={submitting}>
              Submit {attempt.mode === "FULL_EXAM" ? "Exam" : "Practice"}
            </Button>
          </div>
        </aside>
      </div>

      {showSubmitConfirm && (
        <SubmitConfirmModal
          unansweredCount={unansweredCount}
          submitting={submitting}
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={submit}
        />
      )}
    </div>
  );
}

function QuestionCard({
  question,
  onToggle,
  onConfidence,
}: {
  question: ClientQuestion;
  onToggle: (optionId: string) => void;
  onConfidence: (rating: number) => void;
}) {
  const isMulti = question.questionType === "MULTIPLE_SELECT";
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
        <Badge variant="info">{question.domainName}</Badge>
        {question.topicName && <Badge>{question.topicName}</Badge>}
        {isMulti && (
          <Badge variant="warning">
            Select {question.requiredSelectionCount} answer{question.requiredSelectionCount === 1 ? "" : "s"}
          </Badge>
        )}
      </div>
      <p className="text-lg font-medium leading-relaxed text-foreground">{question.questionText}</p>

      <fieldset className="mt-5 space-y-2">
        <legend className="sr-only">Answer choices</legend>
        {question.options.map((opt, i) => {
          const checked = question.selectedOptionIds.includes(opt.id);
          const letter = String.fromCharCode(65 + i);
          return (
            <label
              key={opt.id}
              className={clsx(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                checked ? "border-accent bg-info-bg" : "border-border hover:bg-surface-muted",
              )}
            >
              <input
                type={isMulti ? "checkbox" : "radio"}
                name={`q-${question.examQuestionId}`}
                checked={checked}
                onChange={() => onToggle(opt.id)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                <span className="mr-2 font-semibold text-foreground-muted">{letter}.</span>
                {opt.text}
              </span>
            </label>
          );
        })}
      </fieldset>

      {question.selectedOptionIds.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-foreground-muted">How confident were you? (optional)</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onConfidence(n)}
                aria-pressed={question.confidenceRating === n}
                className={clsx(
                  "h-8 w-8 rounded-md border text-sm font-medium transition-colors",
                  question.confidenceRating === n ? "border-accent bg-accent text-white" : "border-border text-foreground-muted hover:bg-surface-muted",
                )}
              >
                {n}
              </button>
            ))}
            <span className="ml-2 self-center text-xs text-foreground-muted">1 = guess, 5 = certain</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Navigator({
  questions,
  currentIndex,
  onJump,
}: {
  questions: ClientQuestion[];
  currentIndex: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Question Navigator</p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-6">
        {questions.map((q, i) => {
          const answered = q.selectedOptionIds.length > 0;
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.examQuestionId}
              onClick={() => onJump(i)}
              aria-current={isCurrent ? "true" : undefined}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ", unanswered"}${q.isFlagged ? ", flagged" : ""}`}
              className={clsx(
                "relative flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium transition-colors",
                isCurrent
                  ? "border-2 border-primary bg-primary text-white"
                  : answered
                    ? "border-success bg-success-bg text-success"
                    : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
              )}
            >
              {i + 1}
              {q.isFlagged && <span className="absolute -right-1 -top-1 text-warning" aria-hidden="true">⚑</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-1 text-xs text-foreground-muted">
        <LegendRow swatch="border-success bg-success-bg" label="Answered" />
        <LegendRow swatch="border-border bg-surface" label="Unanswered" />
        <LegendRow swatch="border-2 border-primary bg-primary" label="Current question" />
        <p>⚑ Flagged for review</p>
      </div>
    </div>
  );
}

function LegendRow({ swatch, label }: { swatch: string; label: string }) {
  return (
    <p className="flex items-center gap-2">
      <span className={clsx("inline-block h-3 w-3 rounded border", swatch)} aria-hidden="true" />
      {label}
    </p>
  );
}

function SubmitConfirmModal({
  unansweredCount,
  submitting,
  onCancel,
  onConfirm,
}: {
  unansweredCount: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg">
        <h2 id="submit-title" className="text-lg font-semibold text-foreground">
          Submit this attempt?
        </h2>
        {unansweredCount > 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">
            You still have <strong className="text-foreground">{unansweredCount} unanswered question{unansweredCount === 1 ? "" : "s"}</strong>. Are
            you sure you want to submit?
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground-muted">All questions are answered. This cannot be undone.</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Keep working
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
