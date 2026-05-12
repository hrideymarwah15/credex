"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  current: number;
  recommended: number;
  className?: string;
}

export function SpendBar({ current, recommended, className }: Props) {
  if (current <= 0) return null;
  const ratio = Math.max(0, Math.min(1, recommended / current));
  const prefersReduced = useReducedMotion();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-emerald-500/60"
          initial={prefersReduced ? false : { width: "100%" }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-[9px] text-muted font-mono tabular-nums shrink-0">
        {Math.round((1 - ratio) * 100)}% saved
      </span>
    </div>
  );
}
