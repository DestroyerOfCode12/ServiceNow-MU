"use client";

import { useState } from "react";
import { StartAttemptButton } from "@/components/exam/start-attempt-button";

export function TimedPracticeForm({ domains }: { domains: { id: string; name: string }[] }) {
  const [domainId, setDomainId] = useState<string>("");
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(30);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="domain" className="label">
          Domain (optional — leave blank for a mix)
        </label>
        <select id="domain" className="input" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
          <option value="">All domains</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="count" className="label">
            Questions
          </label>
          <input id="count" type="number" min={5} max={80} className="input" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor="minutes" className="label">
            Minutes
          </label>
          <input id="minutes" type="number" min={5} max={180} className="input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
        </div>
      </div>
      <StartAttemptButton
        request={{ mode: "TIMED_PRACTICE", domainId: domainId || undefined, count, durationSeconds: minutes * 60 }}
        className="w-full"
      >
        Start Timed Practice
      </StartAttemptButton>
    </div>
  );
}
