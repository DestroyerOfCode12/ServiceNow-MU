"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface StartAttemptRequest {
  mode: "FULL_EXAM" | "TIMED_PRACTICE" | "QUICK_PRACTICE" | "TOPIC_PRACTICE" | "DOMAIN_PRACTICE" | "WEAK_AREA_PRACTICE" | "RANDOM_PRACTICE";
  topicId?: string;
  domainId?: string;
  count?: number;
  durationSeconds?: number;
}

export function StartAttemptButton({
  request,
  children,
  size = "lg",
  variant = "primary",
  className,
}: {
  request: StartAttemptRequest;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent" | "secondary" | "ghost";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Could not start this session.");
      setLoading(false);
      return;
    }
    router.push(`/attempt/${body.attemptId}`);
  }

  return (
    <div>
      <Button onClick={start} disabled={loading} size={size} variant={variant} className={className}>
        {loading ? "Preparing…" : children}
      </Button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
