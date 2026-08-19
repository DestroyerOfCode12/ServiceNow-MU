"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ActivateButton({ versionId }: { versionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function activate() {
    if (!confirm("Activate this blueprint version? The currently active version will be retired.")) return;
    setLoading(true);
    await fetch(`/api/admin/blueprint/versions/${versionId}/activate`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button size="sm" variant="secondary" onClick={activate} disabled={loading}>
      {loading ? "…" : "Activate"}
    </Button>
  );
}
