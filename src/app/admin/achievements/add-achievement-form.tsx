"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const CRITERIA_TYPES = [
  { value: "STREAK_DAYS", label: "Streak days (threshold = consecutive days)" },
  { value: "QUESTIONS_ANSWERED", label: "Questions answered (threshold = lifetime count)" },
  { value: "EXAMS_COMPLETED", label: "Exams completed (threshold = full/timed exams submitted)" },
  { value: "DOMAIN_PERFECT", label: "100% accuracy in any one domain (threshold unused)" },
  { value: "TOPIC_MASTERED_COUNT", label: "Topics mastered ≥80% (threshold = topic count)" },
  { value: "FIRST_EXAM_COMPLETED", label: "First full exam completed (threshold unused)" },
] as const;

const THRESHOLD_LESS = new Set(["DOMAIN_PERFECT", "FIRST_EXAM_COMPLETED"]);

export function AddAchievementForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    icon: "🏅",
    criteriaType: "QUESTIONS_ANSWERED" as (typeof CRITERIA_TYPES)[number]["value"],
    criteriaThreshold: "",
    xpReward: "25",
    sortOrder: "0",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        name: form.name,
        description: form.description,
        icon: form.icon,
        criteriaType: form.criteriaType,
        criteriaThreshold: THRESHOLD_LESS.has(form.criteriaType) || !form.criteriaThreshold ? undefined : Number(form.criteriaThreshold),
        xpReward: Number(form.xpReward) || 0,
        sortOrder: Number(form.sortOrder) || 0,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create achievement.");
      return;
    }
    setForm({ code: "", name: "", description: "", icon: "🏅", criteriaType: "QUESTIONS_ANSWERED", criteriaThreshold: "", xpReward: "25", sortOrder: "0" });
    router.refresh();
  }

  const needsThreshold = !THRESHOLD_LESS.has(form.criteriaType);

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[5rem_1fr]">
        <div>
          <label className="label">Icon</label>
          <input className="input text-center text-lg" maxLength={4} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="label">Code (stable machine key, e.g. &ldquo;streak-14&rdquo;)</label>
        <input
          className="input"
          required
          pattern="[a-z0-9\-]+"
          placeholder="streak-14"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          required
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Criteria</label>
          <select
            className="input"
            value={form.criteriaType}
            onChange={(e) => setForm((f) => ({ ...f, criteriaType: e.target.value as typeof f.criteriaType }))}
          >
            {CRITERIA_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        {needsThreshold && (
          <div>
            <label className="label">Threshold</label>
            <input
              className="input"
              type="number"
              min={1}
              required
              value={form.criteriaThreshold}
              onChange={(e) => setForm((f) => ({ ...f, criteriaThreshold: e.target.value }))}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">XP reward</label>
          <input className="input" type="number" min={0} value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: e.target.value }))} />
        </div>
        <div>
          <label className="label">Sort order</label>
          <input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={saving} size="sm">
        {saving ? "Adding…" : "Add achievement"}
      </Button>
    </form>
  );
}
