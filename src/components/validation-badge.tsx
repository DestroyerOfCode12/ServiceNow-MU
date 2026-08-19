import { Badge } from "@/components/ui/badge";

const CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral"; icon: string }> = {
  VERIFIED: { label: "Verified", variant: "success", icon: "✓" },
  NEEDS_REVIEW: { label: "Needs review", variant: "warning", icon: "⚠" },
  OUTDATED: { label: "Outdated", variant: "danger", icon: "✕" },
  REJECTED: { label: "Rejected", variant: "danger", icon: "✕" },
  DRAFT: { label: "Draft", variant: "neutral", icon: "○" },
};

export function ValidationBadge({ status }: { status: string }) {
  const cfg = CONFIG[status] ?? CONFIG.DRAFT;
  return (
    <Badge variant={cfg.variant}>
      <span aria-hidden="true">{cfg.icon}</span> {cfg.label}
    </Badge>
  );
}
