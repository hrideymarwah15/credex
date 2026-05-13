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
        "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide",
        config.badge,
        config.badgeText,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "neutral";
  className?: string;
}

const statusVariants = {
  success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  error: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
  neutral: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700",
};

export function StatusBadge({ children, variant = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border",
        statusVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
