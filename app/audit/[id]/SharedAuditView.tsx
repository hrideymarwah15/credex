"use client";

import type { AuditResult } from "@/lib/audit/types";
import { formatUsd } from "@/lib/utils";
import { TrendingDown, CheckCircle2, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

interface Props {
  result: AuditResult;
  summary: string | null;
}

const severityStyle: Record<string, string> = {
  save_big: "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-sm",
  save_some: "border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 shadow-sm",
  optimal: "border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/30 shadow-sm",
  underpaying: "border-red-200 dark:border-red-800/60 bg-red-50/80 dark:bg-red-950/30 shadow-sm",
};

const severityLabel: Record<string, string> = {
  save_big: "Save big",
  save_some: "Save some",
  optimal: "Looks good",
  underpaying: "Heads up",
};

const severityBadge: Record<string, string> = {
  save_big: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  save_some: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  optimal: "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  underpaying: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
};

export function SharedAuditView({ result, summary }: Props) {
  const { findings, totalMonthlySavings, totalAnnualSavings, totalCurrentMonthly, totalRecommendedMonthly, credexEligible, isOptimal } = result;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section aria-label="Savings summary" className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900/50 p-10 sm:p-12 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-teal-950/20 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/10">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-200/30 dark:bg-emerald-800/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-200/20 dark:bg-teal-800/10 blur-3xl pointer-events-none" aria-hidden="true" />

        {isOptimal ? (
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-wide">Optimized stack</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Nothing meaningful to cut.</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-lg text-lg leading-relaxed">
              This stack was audited against current pricing — no significant overspend found.
            </p>
          </div>
        ) : (
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <TrendingDown className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-wide">Estimated savings</span>
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              {formatUsd(totalMonthlySavings)}
              <span className="text-zinc-400 dark:text-zinc-500 text-2xl sm:text-3xl font-normal ml-1">/mo</span>
            </h2>
            <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
              That&apos;s <strong className="text-zinc-900 dark:text-white">{formatUsd(totalAnnualSavings)}/year</strong>. From {formatUsd(totalCurrentMonthly)}/mo &rarr; {formatUsd(totalRecommendedMonthly)}/mo.
            </p>
          </div>
        )}
      </section>

      {/* AI Summary */}
      {summary && (
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 bg-white dark:bg-zinc-900/60 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Analysis
          </h3>
          <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* Per-tool findings */}
      <section aria-label="Per-tool breakdown" className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Per-tool breakdown</h3>
        {findings.map((f, i) => (
          <div key={i} className={`rounded-xl border p-5 sm:p-6 ${severityStyle[f.severity]}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold">{f.toolLabel}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${severityBadge[f.severity]}`}>
                    {severityLabel[f.severity]}
                  </span>
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                  {f.action}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-zinc-500 font-mono">
                  {formatUsd(f.currentSpend)} &rarr; {formatUsd(f.recommendedSpend)}/mo
                </div>
                {f.monthlySavings > 0 ? (
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-xl mt-0.5">
                    -{formatUsd(f.monthlySavings)}<span className="text-sm font-normal">/mo</span>
                  </div>
                ) : (
                  <div className="text-zinc-400 dark:text-zinc-600 text-sm mt-0.5">No change</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Credex CTA */}
      {credexEligible && (
        <section className="relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-800/50 p-6 sm:p-8 bg-gradient-to-br from-indigo-50 via-white to-violet-50/50 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-violet-950/20 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/10">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-200/30 dark:bg-indigo-800/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="relative flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center" aria-hidden="true">
              <AlertTriangle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">
                Qualifies for a Credex consultation
              </h3>
              <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed max-w-lg">
                At this spend level, custom contracts and committed-use discounts typically save another 15-30%.
              </p>
              <a
                href="https://credex.ai/consultation"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-zinc-900 px-4 py-2 rounded-lg shadow-sm"
              >
                Learn about Credex <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
