import { cn } from "@/lib/utils";
import type { FindingSeverity } from "@/lib/audit/types";
import { severityConfig } from "@/lib/audit/severity";

interface BadgeProps {
  severity: FindingSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: BadgeProps) {
  const config = severityConfig[severity];
  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded border",
        config.badge,
        config.badgeText,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
