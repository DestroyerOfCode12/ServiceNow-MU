"use client";

import { useState } from "react";
import { StartAttemptButton } from "@/components/exam/start-attempt-button";

export interface TopicOption {
  id: string;
  name: string;
  domainName: string;
  questionCount: number;
}

export function TopicPicker({ topics }: { topics: TopicOption[] }) {
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const selected = topics.find((t) => t.id === topicId);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="topic" className="label">
          Topic
        </label>
        <select id="topic" className="input" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.domainName} — {t.name} ({t.questionCount} questions)
            </option>
          ))}
        </select>
      </div>
      {selected && selected.questionCount === 0 ? (
        <p className="text-sm text-warning">This topic doesn&apos;t have practice questions yet.</p>
      ) : (
        <StartAttemptButton request={{ mode: "TOPIC_PRACTICE", topicId, count: Math.min(15, selected?.questionCount ?? 15) }} className="w-full">
          Start Topic Practice
        </StartAttemptButton>
      )}
    </div>
  );
}
