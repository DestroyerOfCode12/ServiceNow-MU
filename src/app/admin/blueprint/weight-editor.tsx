"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface DomainRow {
  id: string;
  code: string;
  name: string;
  weightPercent: number;
}

export function WeightEditor({ domains }: { domains: DomainRow[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(Object.fromEntries(domains.map((d) => [d.id, d.weightPercent])));
  const [saving, setSaving] = useState(false);

  const total = Object.values(values).reduce((a, b) => a + b, 0);

  async function save() {
    setSaving(true);
    await Promise.all(
      domains.map((d) =>
        fetch(`/api/admin/blueprint/domains/${d.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weightPercent: values[d.id] }),
        }),
      ),
    );
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-foreground-muted">
          <tr>
            <th className="py-1">Domain</th>
            <th className="py-1">Weight %</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d.id} className="border-t border-border">
              <td className="py-2 text-foreground">
                {d.code} — {d.name}
              </td>
              <td className="py-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  className="input w-24"
                  value={values[d.id]}
                  onChange={(e) => setValues((v) => ({ ...v, [d.id]: Number(e.target.value) }))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`mt-2 text-sm ${Math.abs(total - 100) > 0.5 ? "text-warning" : "text-foreground-muted"}`}>
        Total: {total.toFixed(1)}% {Math.abs(total - 100) > 0.5 && "— weights should sum to ~100%"}
      </p>
      <Button size="sm" className="mt-3" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save weights"}
      </Button>
    </div>
  );
}
