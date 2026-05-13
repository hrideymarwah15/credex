"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  current: number;
  recommended: number;
  className?: string;
}

export function SpendBar({ current, recommended, className }: Props) {
  const prefersReduced = useReducedMotion();

  if (current <= 0) return null;
  const ratio = Math.max(0, Math.min(1, recommended / current));
  const savingPct = Math.round((1 - ratio) * 100);

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          style={{ opacity: 0.7 }}
          initial={prefersReduced ? false : { width: "100%" }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono tabular-nums shrink-0">
        -{savingPct}%
      </span>
    </div>
  );
}
