"use client";

import { motion, useReducedMotion } from "motion/react";
import type { BenchmarkResult } from "@/lib/audit/benchmarks";
import { formatUsd } from "@/lib/utils";
import { FadeIn } from "@/components/ui/FadeIn";
import { BarChart3 } from "lucide-react";

interface Props {
  benchmark: BenchmarkResult;
}

const ratingConfig = {
  below: { color: "text-emerald-400", bg: "bg-emerald-500", label: "Below average" },
  average: { color: "text-amber-400", bg: "bg-amber-500", label: "Average" },
  above: { color: "text-red-400", bg: "bg-red-500", label: "Above average" },
};

export function Benchmark({ benchmark }: Props) {
  const { perSeatSpend, cohortP25, cohortP50, cohortP75, percentile, rating } = benchmark;
  const config = ratingConfig[rating];
  const maxValue = cohortP75 * 1.4;
  const position = Math.min(95, Math.max(5, (perSeatSpend / maxValue) * 100));
  const prefersReduced = useReducedMotion();
  const markerColor = rating === "below" ? "#10b981" : rating === "average" ? "#f59e0b" : "#ef4444";

  return (
    <FadeIn delay={0.18}>
      <section className="rounded-2xl border border-border bg-card/30 p-5 sm:p-6" aria-label="Spend benchmark">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted mb-4 flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3" aria-hidden="true" />
          Benchmark
        </h3>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono tabular-nums text-heading">
                {formatUsd(perSeatSpend)}
              </span>
              <span className="text-xs text-muted ml-1">/dev/mo</span>
            </div>
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label} ({benchmark.bucket} team)
            </span>
          </div>

          <div
            className="relative"
            role="img"
            aria-label={`Spend gauge: your spend of ${formatUsd(perSeatSpend)}/dev/mo is at the ${percentile}th percentile. p25=${formatUsd(cohortP25)}, p50=${formatUsd(cohortP50)}, p75=${formatUsd(cohortP75)}`}
          >
            <div className="h-2 rounded-full bg-border overflow-hidden flex">
              <div className="h-full bg-emerald-500/30" style={{ width: `${(cohortP25 / maxValue) * 100}%` }} />
              <div className="h-full bg-amber-500/30" style={{ width: `${((cohortP50 - cohortP25) / maxValue) * 100}%` }} />
              <div className="h-full bg-amber-500/20" style={{ width: `${((cohortP75 - cohortP50) / maxValue) * 100}%` }} />
              <div className="h-full bg-red-500/20 flex-1" />
            </div>
            <motion.div
              className="absolute top-[-4px] w-3 h-3 rounded-full border-2 border-background shadow-sm"
              style={{ transform: "translateX(-50%)", backgroundColor: markerColor }}
              initial={prefersReduced ? false : { left: "0%", scale: 0 }}
              animate={{ left: `${position}%`, scale: 1 }}
              transition={{
                left: { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
                scale: { type: "spring", stiffness: 300, damping: 15, delay: 0.9 },
              }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-muted font-mono">
            <span>p25: {formatUsd(cohortP25)}</span>
            <span>p50: {formatUsd(cohortP50)}</span>
            <span>p75: {formatUsd(cohortP75)}</span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Your AI spend per developer is{" "}
            {percentile <= 25
              ? "well below average — you're spending efficiently."
              : percentile <= 50
                ? "below the median — room to optimize, but not urgent."
                : percentile <= 75
                  ? "above the median — consider the recommendations above."
                  : "in the top quartile — significant savings likely available."}
          </p>
        </div>
      </section>
    </FadeIn>
  );
}
