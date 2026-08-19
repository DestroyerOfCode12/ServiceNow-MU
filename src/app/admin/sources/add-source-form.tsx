"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddSourceForm({ topics }: { topics: { id: string; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", url: "", productVersion: "", topicId: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, topicId: form.topicId || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not add source.");
      return;
    }
    setForm({ title: "", url: "", productVersion: "", topicId: "" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">Title</label>
        <input className="input" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      </div>
      <div>
        <label className="label">URL (must be on the official ServiceNow allowlist)</label>
        <input className="input" required type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Product version (optional)</label>
          <input className="input" value={form.productVersion} onChange={(e) => setForm((f) => ({ ...f, productVersion: e.target.value }))} />
        </div>
        <div>
          <label className="label">Attach to topic (optional)</label>
          <select className="input" value={form.topicId} onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value }))}>
            <option value="">None</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={saving} size="sm">
        {saving ? "Adding…" : "Add source"}
      </Button>
    </form>
  );
}
