"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AchievementActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    await fetch(`/api/admin/achievements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={pending} onClick={toggle}>
      {isActive ? "Retire" : "Reactivate"}
    </Button>
  );
}
