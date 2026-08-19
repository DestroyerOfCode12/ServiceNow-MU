"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface NoteRow {
  id: string;
  entityType: string;
  entityId: string;
  content: string;
  title: string;
  href: string | null;
  updatedAt: string;
}

export function NotesList({ notes: initial }: { notes: NoteRow[] }) {
  const [notes, setNotes] = useState(initial);

  async function remove(id: string) {
    setNotes((n) => n.filter((note) => note.id !== id));
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  if (notes.length === 0) {
    return <p className="mt-6 text-sm text-foreground-muted">No notes yet. Add one from any topic or question page.</p>;
  }

  return (
    <div className="mt-6 space-y-3">
      {notes.map((n) => (
        <Card key={n.id}>
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="info">{n.entityType}</Badge>
                <p className="mt-1 font-medium text-foreground">{n.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(n.id)}>
                Delete
              </Button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground-muted">{n.content}</p>
            <p className="mt-2 text-xs text-foreground-muted">Updated {new Date(n.updatedAt).toLocaleDateString()}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
