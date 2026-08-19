"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

export function BookmarkButton({
  entityType,
  entityId,
  initialBookmarked,
}: {
  entityType: "QUESTION" | "TOPIC" | "FLASHCARD";
  entityId: string;
  initialBookmarked: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    const next = !bookmarked;
    setBookmarked(next);
    await fetch("/api/bookmarks", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId }),
    });
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
        bookmarked ? "border-accent bg-info-bg text-accent" : "border-border text-foreground-muted hover:bg-surface-muted",
      )}
    >
      <span aria-hidden="true">{bookmarked ? "★" : "☆"}</span>
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
