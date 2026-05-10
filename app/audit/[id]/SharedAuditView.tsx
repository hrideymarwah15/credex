"use client";

import type { AuditResult } from "@/lib/audit/types";
import { formatUsd } from "@/lib/utils";
import { TrendingDown, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";

interface Props {
  result: AuditResult;
  summary: string | null;
}

const severityStyle: Record<string, string> = {
  save_big: "border-emerald-500/40 bg-emerald-500/5",
  save_some: "border-amber-500/40 bg-amber-500/5",
  optimal: "border-zinc-300/40 bg-zinc-500/5",
  underpaying: "border-red-500/40 bg-red-500/5",
};

const severityLabel: Record<string, string> = {
  save_big: "Save big",
  save_some: "Save some",
  optimal: "Looks good",
  underpaying: "Heads up",
};

export function SharedAuditView({ result, summary }: Props) {
  const { findings, totalMonthlySavings, totalAnnualSavings, totalCurrentMonthly, totalRecommendedMonthly, credexEligible, isOptimal } = result;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-950">
        {isOptimal ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Optimized stack</span>
            </div>
            <h2 className="text-3xl font-semibold">Nothing meaningful to cut.</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-xl">
              This stack was audited against current pricing — no significant overspend found.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Estimated savings</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              {formatUsd(totalMonthlySavings)}
              <span className="text-zinc-500 text-2xl font-normal">/mo</span>
            </h2>
            <p className="text-lg text-zinc-700 dark:text-zinc-300">
              That&apos;s <strong>{formatUsd(totalAnnualSavings)}/year</strong>. From {formatUsd(totalCurrentMonthly)}/mo → {formatUsd(totalRecommendedMonthly)}/mo.
            </p>
          </div>
        )}
      </section>

      {/* AI Summary */}
      {summary && (
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-900/40">
          <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500 mb-2">
            Analysis
          </h3>
          <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* Per-tool findings */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Per-tool breakdown</h3>
        {findings.map((f, i) => (
          <div key={i} className={`rounded-xl border p-5 ${severityStyle[f.severity]}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{f.toolLabel}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-current/10">
                    {severityLabel[f.severity]}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  <strong>{f.action}</strong>
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{f.reason}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">
                  {formatUsd(f.currentSpend)} → {formatUsd(f.recommendedSpend)}/mo
                </div>
                {f.monthlySavings > 0 ? (
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-lg">
                    -{formatUsd(f.monthlySavings)}/mo
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm">No change</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Credex CTA */}
      {credexEligible && (
        <section className="rounded-2xl border border-indigo-500/40 bg-indigo-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">
                Qualifies for a Credex consultation
              </h3>
              <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80">
                At this spend level, custom contracts and committed-use discounts typically save another 15–30%.
              </p>
              <a
                href="https://credex.ai/consultation"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:underline"
              >
                Learn about Credex <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
