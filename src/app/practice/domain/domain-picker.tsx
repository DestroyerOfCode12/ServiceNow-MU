"use client";

import { useState } from "react";
import { StartAttemptButton } from "@/components/exam/start-attempt-button";

export interface DomainOption {
  id: string;
  code: string;
  name: string;
  questionCount: number;
}

export function DomainPicker({ domains }: { domains: DomainOption[] }) {
  const [domainId, setDomainId] = useState(domains[0]?.id ?? "");
  const selected = domains.find((d) => d.id === domainId);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="domain" className="label">
          CSA Domain
        </label>
        <select id="domain" className="input" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code} — {d.name} ({d.questionCount} questions)
            </option>
          ))}
        </select>
      </div>
      <StartAttemptButton
        request={{ mode: "DOMAIN_PRACTICE", domainId, count: Math.min(20, selected?.questionCount ?? 20) }}
        className="w-full"
      >
        Start Domain Practice
      </StartAttemptButton>
    </div>
  );
}
