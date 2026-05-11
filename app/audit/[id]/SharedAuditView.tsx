"use client";

import type { AuditResult } from "@/lib/audit/types";
import { severityConfig } from "@/lib/audit/severity";
import { SeverityBadge } from "@/components/ui/Badge";
import { ToolIcon } from "@/components/icons/ToolIcon";
import { SpendBar } from "@/components/SpendBar";
import { formatUsd } from "@/lib/utils";
import { TrendingDown, CheckCircle2, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

interface Props {
  result: AuditResult;
  summary: string | null;
}

export function SharedAuditView({ result, summary }: Props) {
  const { findings, totalMonthlySavings, totalAnnualSavings, totalCurrentMonthly, totalRecommendedMonthly, credexEligible, isOptimal } = result;

  const sortedFindings = [...findings].sort((a, b) => b.monthlySavings - a.monthlySavings);

  return (
    <div className="space-y-8">
      {/* Shared via badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-[10px] font-medium text-muted">
        Shared via SpendLens
      </div>

      {/* Hero */}
      <section
        aria-label="Savings summary"
        className="relative overflow-hidden rounded-2xl border border-border p-8 sm:p-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-teal-500/[0.04]" aria-hidden="true" />

        {isOptimal ? (
          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Optimized
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-heading">
              Nothing meaningful to cut.
            </h2>
            <p className="text-sm text-muted max-w-md leading-relaxed">
              Stack audited against current pricing — no significant overspend found.
            </p>
          </div>
        ) : (
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
              Estimated savings
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter text-heading font-mono tabular-nums">
                {formatUsd(totalMonthlySavings)}
              </h2>
              <span className="text-lg text-muted/60 font-normal">/mo</span>
            </div>
            <p className="text-sm text-foreground/70">
              <span className="text-heading font-medium">{formatUsd(totalAnnualSavings)}/yr</span>
              <span className="text-muted/40 mx-2">&middot;</span>
              <span className="font-mono text-xs text-muted">
                {formatUsd(totalCurrentMonthly)} &rarr; {formatUsd(totalRecommendedMonthly)}/mo
              </span>
            </p>
          </div>
        )}
      </section>

      {/* AI Summary */}
      {summary && (
        <section className="rounded-2xl border border-border bg-card/30 p-5 sm:p-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Analysis
          </h3>
          <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* Per-tool findings */}
      <section aria-label="Per-tool breakdown" className="space-y-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1">Breakdown</h3>
        {sortedFindings.map((f, i) => {
          const config = severityConfig[f.severity];
          return (
            <div
              key={i}
              className={`rounded-xl border-l-[3px] ${config.accent} border ${config.border} ${config.bg} p-4 sm:p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ToolIcon tool={f.tool} size={14} />
                    <span className="text-sm font-semibold text-heading">{f.toolLabel}</span>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <p className="text-xs text-foreground/70">{f.action}</p>
                  <p className="text-[11px] text-muted leading-relaxed">{f.reason}</p>
                  {f.monthlySavings > 0 && (
                    <SpendBar current={f.currentSpend} recommended={f.recommendedSpend} className="mt-2 max-w-xs" />
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted/60 font-mono">
                    {formatUsd(f.currentSpend)} &rarr; {formatUsd(f.recommendedSpend)}
                  </div>
                  {f.monthlySavings > 0 ? (
                    <div className="text-emerald-400 font-bold text-lg font-mono tabular-nums mt-0.5">
                      -{formatUsd(f.monthlySavings)}
                    </div>
                  ) : (
                    <div className="text-muted/60 text-xs mt-1">No change</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Credex CTA */}
      {credexEligible && (
        <section className="relative overflow-hidden rounded-2xl border border-indigo-500/20 p-5 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.04]" aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center" aria-hidden="true">
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-heading">
                Qualifies for Credex consultation
              </h3>
              <p className="text-xs text-muted leading-relaxed max-w-md">
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
