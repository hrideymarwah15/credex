"use client";

import { motion, useReducedMotion } from "motion/react";
import type { AuditResult, UseCase } from "@/lib/audit/types";
import { severityConfig } from "@/lib/audit/severity";
import { SeverityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FadeIn } from "@/components/ui/FadeIn";
import { ToolIcon } from "@/components/icons/ToolIcon";
import { SpendBar } from "@/components/SpendBar";
import { ShareButtons } from "@/components/ShareButtons";
import { Benchmark } from "@/components/Benchmark";
import { DownloadButton } from "@/components/pdf/DownloadButton";
import { getBenchmark } from "@/lib/audit/benchmarks";
import { downloadCsv } from "@/lib/export/csv";
import { formatUsd } from "@/lib/utils";
import { ArrowRight, CheckCircle2, TrendingDown, AlertTriangle, Sparkles, ArrowLeft, FileDown, Zap } from "lucide-react";

interface Props {
  result: AuditResult;
  summary?: string | null;
  priorityAction?: string | null;
  onReset: () => void;
  auditUrl?: string | null;
  teamSize?: number;
  useCase?: UseCase;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.25 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Results({ result, summary, priorityAction, onReset, auditUrl, teamSize, useCase }: Props) {
  const {
    findings,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentMonthly,
    totalRecommendedMonthly,
    credexEligible,
    isOptimal,
    perSeatSpendForBenchmark,
  } = result;

  const prefersReduced = useReducedMotion();
  const sortedFindings = [...findings].sort((a, b) => b.monthlySavings - a.monthlySavings);
  const benchmark = teamSize && useCase
    ? getBenchmark(useCase, teamSize, perSeatSpendForBenchmark)
    : null;

  return (
    <div className="space-y-5">
      {/* Back button */}
      <FadeIn>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Run new audit
        </Button>
      </FadeIn>

      {/* Savings hero card */}
      <FadeIn>
        <section
          aria-label="Savings summary"
          className="relative overflow-hidden rounded-2xl border p-8 sm:p-10 card-shadow border-emerald-100 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-500/[0.07] dark:via-transparent dark:to-transparent"
        >
          {isOptimal ? (
            <div className="relative space-y-3">
              <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                Stack optimized
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-heading">
                Your stack looks tight.
              </h2>
              <p className="text-sm text-slate-500 dark:text-muted max-w-md leading-relaxed">
                Checked every tool against current pricing and team size. No overspend found.
              </p>
            </div>
          ) : (
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-3 py-1">
                <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                Savings found
              </div>
              <div className="flex items-baseline gap-3">
                <div className="savings-glow">
                  <AnimatedCounter
                    value={totalMonthlySavings}
                    className="text-5xl sm:text-6xl font-bold tracking-tighter text-slate-900 dark:text-heading font-mono tabular-nums"
                  />
                </div>
                <span className="text-xl text-slate-400 dark:text-muted/60 font-normal">/mo</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-heading/80">
                  {formatUsd(totalAnnualSavings)}/year
                </span>
                <span className="text-slate-300 dark:text-muted/30">·</span>
                <span className="font-mono text-xs text-slate-400 dark:text-muted bg-white/70 dark:bg-surface rounded-lg px-2.5 py-1 border border-slate-200 dark:border-border">
                  {formatUsd(totalCurrentMonthly)} → {formatUsd(totalRecommendedMonthly)}/mo
                </span>
              </div>
            </div>
          )}
        </section>
      </FadeIn>

      {/* AI Summary */}
      {summary && (
        <FadeIn delay={0.12}>
          <section className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 sm:p-6 card-shadow">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-muted mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              AI Analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-foreground/80 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
            {priorityAction && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-100 dark:border-emerald-500/15 px-4 py-3">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-sm text-slate-700 dark:text-foreground/80 font-medium">{priorityAction}</p>
              </div>
            )}
          </section>
        </FadeIn>
      )}

      {/* Benchmark */}
      {benchmark && <Benchmark benchmark={benchmark} />}

      {/* Per-tool findings */}
      <FadeIn delay={0.18}>
        <section aria-label="Per-tool breakdown" className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-muted mb-2 px-0.5">
            Tool breakdown
          </h3>
          {sortedFindings.map((f, i) => {
            const config = severityConfig[f.severity];
            return (
              <motion.article
                key={i}
                custom={i}
                initial={prefersReduced ? false : "hidden"}
                animate="visible"
                variants={cardVariants}
                className={`rounded-xl border-l-[3px] ${config.accent} border ${config.border} ${config.bg} p-4 sm:p-5 card-shadow`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ToolIcon tool={f.tool} size={14} />
                      <span className="text-sm font-bold text-slate-800 dark:text-heading">{f.toolLabel}</span>
                      <SeverityBadge severity={f.severity} />
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-foreground/75">{f.action}</p>
                    <p className="text-[11px] text-slate-400 dark:text-muted leading-relaxed">{f.reason}</p>
                    {f.monthlySavings > 0 && (
                      <SpendBar current={f.currentSpend} recommended={f.recommendedSpend} className="mt-2.5 max-w-xs" />
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-[10px] text-slate-400 dark:text-muted/60 font-mono">
                      {formatUsd(f.currentSpend)} → {formatUsd(f.recommendedSpend)}
                    </div>
                    {f.monthlySavings > 0 ? (
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg font-mono tabular-nums">
                        -{formatUsd(f.monthlySavings)}
                      </div>
                    ) : (
                      <div className="text-slate-400 dark:text-muted/60 text-xs mt-1">No change</div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      </FadeIn>

      {/* Share & Export */}
      <FadeIn delay={0.25}>
        <section className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 sm:p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-muted">Share & Export</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => downloadCsv(result)}>
                <FileDown className="w-3 h-3" aria-hidden="true" />
                CSV
              </Button>
              <DownloadButton result={result} summary={summary} shareUrl={auditUrl} />
            </div>
          </div>
          <ShareButtons savings={totalMonthlySavings} url={auditUrl} />
        </section>
      </FadeIn>

      {/* Credex CTA */}
      {credexEligible && (
        <FadeIn delay={0.3}>
          <section className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-500/20 p-5 sm:p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-500/[0.04] dark:to-transparent card-shadow">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center" aria-hidden="true">
                <AlertTriangle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-bold text-sm text-slate-800 dark:text-heading">
                  Qualifies for Credex consultation
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted leading-relaxed max-w-md">
                  Custom contracts and committed-use discounts can save another 15–30% at this spend level. Our team works directly with vendors on your behalf.
                </p>
                <a
                  href="https://credex.ai/consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Schedule a call <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
