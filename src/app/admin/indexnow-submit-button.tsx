"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function IndexNowSubmitButton() {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/indexnow", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        show({ message: data.error ?? "IndexNow submission failed.", variant: "info" });
      } else {
        show({ message: `Submitted ${data.submitted} URLs to IndexNow.`, variant: "success" });
      }
    } catch {
      show({ message: "IndexNow submission failed — network error.", variant: "info" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={submit} disabled={loading}>
      {loading ? "Submitting…" : "Submit all pages to IndexNow"}
    </Button>
  );
}
