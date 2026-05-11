"use client";

import type { AuditResult } from "@/lib/audit/types";
import { formatUsd } from "@/lib/utils";
import { TrendingDown, CheckCircle2, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

interface Props {
  result: AuditResult;
  summary: string | null;
}

const severityConfig: Record<string, { border: string; bg: string; badge: string; badgeText: string; label: string }> = {
  save_big: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.03]",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    badgeText: "text-emerald-400",
    label: "High savings",
  },
  save_some: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.03]",
    badge: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-400",
    label: "Some savings",
  },
  optimal: {
    border: "border-zinc-800",
    bg: "bg-zinc-900/30",
    badge: "bg-zinc-800 border-zinc-700",
    badgeText: "text-zinc-400",
    label: "Optimal",
  },
  underpaying: {
    border: "border-red-500/20",
    bg: "bg-red-500/[0.03]",
    badge: "bg-red-500/10 border-red-500/20",
    badgeText: "text-red-400",
    label: "Heads up",
  },
};

export function SharedAuditView({ result, summary }: Props) {
  const { findings, totalMonthlySavings, totalAnnualSavings, totalCurrentMonthly, totalRecommendedMonthly, credexEligible, isOptimal } = result;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Savings summary"
        className="relative overflow-hidden rounded-xl border border-zinc-800 p-8 sm:p-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-teal-500/[0.04]" aria-hidden="true" />

        {isOptimal ? (
          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Optimized
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Nothing meaningful to cut.
            </h2>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              Stack audited against current pricing — no significant overspend found.
            </p>
          </div>
        ) : (
          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
              Estimated savings
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter text-white font-mono tabular-nums">
                {formatUsd(totalMonthlySavings)}
              </h2>
              <span className="text-lg text-zinc-600 font-normal">/mo</span>
            </div>
            <p className="text-sm text-zinc-400">
              <span className="text-white font-medium">{formatUsd(totalAnnualSavings)}/yr</span>
              <span className="text-zinc-600 mx-2">&middot;</span>
              <span className="font-mono text-xs text-zinc-500">
                {formatUsd(totalCurrentMonthly)} &rarr; {formatUsd(totalRecommendedMonthly)}/mo
              </span>
            </p>
          </div>
        )}
      </section>

      {/* AI Summary */}
      {summary && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Analysis
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* Per-tool findings */}
      <section aria-label="Per-tool breakdown" className="space-y-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-3">Breakdown</h3>
        {findings.map((f, i) => {
          const config = severityConfig[f.severity];
          return (
            <div
              key={i}
              className={`rounded-lg border ${config.border} ${config.bg} p-4`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{f.toolLabel}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${config.badge} ${config.badgeText}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{f.action}</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{f.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-zinc-600 font-mono">
                    {formatUsd(f.currentSpend)} &rarr; {formatUsd(f.recommendedSpend)}
                  </div>
                  {f.monthlySavings > 0 ? (
                    <div className="text-emerald-400 font-bold text-lg font-mono tabular-nums mt-0.5">
                      -{formatUsd(f.monthlySavings)}
                    </div>
                  ) : (
                    <div className="text-zinc-600 text-xs mt-1">No change</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Credex CTA */}
      {credexEligible && (
        <section className="relative overflow-hidden rounded-xl border border-indigo-500/20 p-5 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.04]" aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center" aria-hidden="true">
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-white">
                Qualifies for Credex consultation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                Custom contracts and committed-use discounts save another 15-30% at this spend level.
              </p>
              <a
                href="https://credex.ai/consultation"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Learn more <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
