"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DomainPerformanceDatum {
  domain: string;
  correct: number;
  total: number;
  accuracy: number;
}

export function DomainPerformanceChart({ data }: { data: DomainPerformanceDatum[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--foreground-muted)" }} unit="%" />
          <YAxis type="category" dataKey="domain" width={170} tick={{ fontSize: 12, fill: "var(--foreground-muted)" }} />
          <Tooltip
            formatter={(_value, _name, item) => {
              const d = item.payload as DomainPerformanceDatum;
              return [`${d.correct} / ${d.total} (${d.accuracy.toFixed(0)}%)`, "Score"];
            }}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="accuracy" fill="var(--accent)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
