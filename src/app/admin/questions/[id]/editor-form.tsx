"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface EditorOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface EditorQuestion {
  id: string;
  questionText: string;
  explanation: string;
  examTip: string | null;
  difficulty: string;
  domainId: string;
  topicId: string | null;
  officialSourceTitle: string | null;
  officialSourceUrl: string | null;
  requiredSelectionCount: number | null;
  questionType: string;
  options: EditorOption[];
}

export function QuestionEditorForm({
  question,
  domains,
  topics,
}: {
  question: EditorQuestion;
  domains: { id: string; name: string }[];
  topics: { id: string; name: string; domainId: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(question);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateOption(idx: number, patch: Partial<EditorOption>) {
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)) }));
  }

  function setCorrect(idx: number) {
    if (form.questionType === "SINGLE_CHOICE") {
      setForm((f) => ({ ...f, options: f.options.map((o, i) => ({ ...o, isCorrect: i === idx })) }));
    } else {
      updateOption(idx, { isCorrect: !form.options[idx].isCorrect });
    }
  }

  function addOption() {
    setForm((f) => ({ ...f, options: [...f.options, { text: "", isCorrect: false }] }));
  }

  function removeOption(idx: number) {
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/questions/${question.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionText: form.questionText,
        explanation: form.explanation,
        examTip: form.examTip || null,
        difficulty: form.difficulty,
        domainId: form.domainId,
        topicId: form.topicId || null,
        officialSourceTitle: form.officialSourceTitle || null,
        officialSourceUrl: form.officialSourceUrl || null,
        requiredSelectionCount: form.requiredSelectionCount,
        options: form.options,
        changeSummary: "Edited via admin content editor.",
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Saved.");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? "Could not save.");
    }
  }

  const filteredTopics = topics.filter((t) => t.domainId === form.domainId);

  return (
    <div className="space-y-5">
      <div>
        <label className="label">Question text</label>
        <textarea className="input min-h-20" value={form.questionText} onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))} />
      </div>

      <div>
        <label className="label">Options ({form.questionType === "SINGLE_CHOICE" ? "select the correct one" : "check all correct answers"})</label>
        <div className="space-y-2">
          {form.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type={form.questionType === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                checked={o.isCorrect}
                onChange={() => setCorrect(i)}
              />
              <input className="input" value={o.text} onChange={(e) => updateOption(i, { text: e.target.value })} />
              <button type="button" onClick={() => removeOption(i)} className="text-xs text-danger">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} className="mt-2 text-xs font-medium text-accent">
          + Add option
        </button>
      </div>

      {form.questionType === "MULTIPLE_SELECT" && (
        <div>
          <label className="label">Required selection count</label>
          <input
            type="number"
            min={1}
            max={10}
            className="input w-24"
            value={form.requiredSelectionCount ?? 1}
            onChange={(e) => setForm((f) => ({ ...f, requiredSelectionCount: Number(e.target.value) }))}
          />
        </div>
      )}

      <div>
        <label className="label">Explanation</label>
        <textarea className="input min-h-24" value={form.explanation} onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))} />
      </div>

      <div>
        <label className="label">Exam tip (optional)</label>
        <input className="input" value={form.examTip ?? ""} onChange={(e) => setForm((f) => ({ ...f, examTip: e.target.value }))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Difficulty</label>
          <select className="input" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <div>
          <label className="label">Domain</label>
          <select className="input" value={form.domainId} onChange={(e) => setForm((f) => ({ ...f, domainId: e.target.value, topicId: null }))}>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Topic</label>
        <select className="input" value={form.topicId ?? ""} onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value || null }))}>
          <option value="">Unassigned</option>
          {filteredTopics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Official source title</label>
          <input className="input" value={form.officialSourceTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, officialSourceTitle: e.target.value }))} />
        </div>
        <div>
          <label className="label">Official source URL</label>
          <input className="input" value={form.officialSourceUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, officialSourceUrl: e.target.value }))} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {message && <span className="text-sm text-foreground-muted">{message}</span>}
      </div>
    </div>
  );
}
