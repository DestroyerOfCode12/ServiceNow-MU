"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DomainPerformanceDatum {
  domainCode: string;
  domainName: string;
  correct: number;
  total: number;
  accuracy: number;
}

// The Y-axis carries only the short code ("D1") rather than the full domain
// name — a full name like "Database Management and Platform Security" forced
// onto a narrow category axis wraps to 2-3 lines and eats over half the
// chart's width on a phone, squeezing the bars themselves down to near
// nothing. The full name still surfaces in the tooltip and the legend below.
export function DomainPerformanceChart({ data }: { data: DomainPerformanceDatum[] }) {
  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--foreground-muted)" }} unit="%" />
            <YAxis type="category" dataKey="domainCode" width={40} tick={{ fontSize: 12, fill: "var(--foreground-muted)" }} />
            <Tooltip
              formatter={(_value, _name, item) => {
                const d = item.payload as DomainPerformanceDatum;
                return [`${d.correct} / ${d.total} (${d.accuracy.toFixed(0)}%)`, d.domainName];
              }}
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="accuracy" fill="var(--accent)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-foreground-muted sm:grid-cols-2">
        {data.map((d) => (
          <li key={d.domainCode}>
            <span className="font-medium text-foreground">{d.domainCode}</span> — {d.domainName}
          </li>
        ))}
      </ul>
    </div>
  );
}
