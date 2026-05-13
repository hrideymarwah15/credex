import type { FindingSeverity } from "./types";

export interface SeverityStyle {
  border: string;
  bg: string;
  badge: string;
  badgeText: string;
  label: string;
  accent: string;
}

export const severityConfig: Record<FindingSeverity, SeverityStyle> = {
  save_big: {
    border: "border-emerald-100 dark:border-emerald-500/20",
    bg: "bg-emerald-50 dark:bg-emerald-500/[0.04]",
    badge: "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-400",
    label: "High savings",
    accent: "border-l-emerald-500",
  },
  save_some: {
    border: "border-amber-100 dark:border-amber-500/20",
    bg: "bg-amber-50 dark:bg-amber-500/[0.04]",
    badge: "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-400",
    label: "Some savings",
    accent: "border-l-amber-500",
  },
  optimal: {
    border: "border-slate-200 dark:border-zinc-800",
    bg: "bg-slate-50 dark:bg-zinc-900/30",
    badge: "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700",
    badgeText: "text-slate-600 dark:text-zinc-400",
    label: "Optimal",
    accent: "border-l-slate-300 dark:border-l-zinc-700",
  },
  underpaying: {
    border: "border-red-100 dark:border-red-500/20",
    bg: "bg-red-50 dark:bg-red-500/[0.04]",
    badge: "bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
    badgeText: "text-red-700 dark:text-red-400",
    label: "Heads up",
    accent: "border-l-red-400",
  },
};
