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
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.03]",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    badgeText: "text-emerald-400",
    label: "High savings",
    accent: "border-l-emerald-500",
  },
  save_some: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.03]",
    badge: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-400",
    label: "Some savings",
    accent: "border-l-amber-500",
  },
  optimal: {
    border: "border-zinc-800",
    bg: "bg-zinc-900/30",
    badge: "bg-zinc-800 border-zinc-700",
    badgeText: "text-zinc-400",
    label: "Optimal",
    accent: "border-l-zinc-700",
  },
  underpaying: {
    border: "border-red-500/20",
    bg: "bg-red-500/[0.03]",
    badge: "bg-red-500/10 border-red-500/20",
    badgeText: "text-red-400",
    label: "Heads up",
    accent: "border-l-red-500",
  },
};
