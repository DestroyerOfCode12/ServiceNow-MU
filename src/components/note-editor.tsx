"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function NoteEditor({
  entityType,
  entityId,
  initialContent,
}: {
  entityType: "QUESTION" | "TOPIC" | "FLASHCARD";
  entityId: string;
  initialContent: string;
}) {
  const { status } = useSession();
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  if (status !== "authenticated") return null;

  async function save() {
    setSaving(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId, content }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3">
      <label className="mb-1 block text-xs font-medium text-foreground-muted">My note (private)</label>
      <textarea
        className="input min-h-20 resize-y"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaved(false);
        }}
        placeholder="Jot down anything that helps this stick…"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || saved}
          className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save note"}
        </button>
      </div>
    </div>
  );
}
