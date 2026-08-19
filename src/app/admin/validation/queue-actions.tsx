"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function QueueActions({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(action: string, status?: string) {
    setLoading(action);
    if (action === "revalidate") {
      await fetch(`/api/admin/questions/${questionId}/revalidate`, { method: "POST" });
    } else {
      await fetch(`/api/admin/questions/${questionId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    }
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="accent" onClick={() => setStatus("approve", "VERIFIED")} disabled={!!loading}>
        {loading === "approve" ? "…" : "Approve"}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setStatus("revalidate")} disabled={!!loading}>
        {loading === "revalidate" ? "…" : "Revalidate"}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setStatus("retire", "OUTDATED")} disabled={!!loading}>
        {loading === "retire" ? "…" : "Retire"}
      </Button>
      <Button size="sm" variant="danger" onClick={() => setStatus("reject", "REJECTED")} disabled={!!loading}>
        {loading === "reject" ? "…" : "Reject"}
      </Button>
    </div>
  );
}
