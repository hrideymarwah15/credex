"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AuditForm } from "@/components/AuditForm";
import { Results } from "@/components/Results";
import { LeadCapture } from "@/components/LeadCapture";
import { PageShell } from "@/components/layout/PageShell";
import { runAudit } from "@/lib/audit/engine";
import type { AuditInput, AuditResult, UseCase } from "@/lib/audit/types";

const springTransition = { type: "spring" as const, stiffness: 260, damping: 28 };

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border p-8 sm:p-10 space-y-4">
        <div className="h-3 w-24 rounded bg-border animate-shimmer" />
        <div className="h-12 w-48 rounded bg-border animate-shimmer" />
        <div className="h-3 w-56 rounded bg-border animate-shimmer" />
      </div>
      <div className="rounded-2xl border border-border p-5 sm:p-6 space-y-3">
        <div className="h-3 w-16 rounded bg-border animate-shimmer" />
        <div className="h-20 w-full rounded bg-border animate-shimmer" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border p-4 sm:p-5 space-y-2">
          <div className="h-3 w-32 rounded bg-border animate-shimmer" />
          <div className="h-2 w-full rounded bg-border animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [priorityAction, setPriorityAction] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditInput, setAuditInput] = useState<{ teamSize: number; useCase: UseCase } | null>(null);

  const handleAudit = async (input: AuditInput) => {
    setLoading(true);
    setResult(null);
    setSummary(null);
    setPriorityAction(null);
    setAuditId(null);

    const audit = runAudit(input);
    setAuditInput({ teamSize: input.teamSize, useCase: input.useCase });

    const minDelay = new Promise((r) => setTimeout(r, 800));

    let aiSummary: string | null = null;
    let aiPriorityAction: string | null = null;

    const summarizePromise = fetch("/api/summarize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input, result: audit }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        aiSummary = data.summary;
        aiPriorityAction = data.priorityAction ?? null;
      }
    }).catch(() => {});

    const savePromise = fetch("/api/audit/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input, result: audit, summary: aiSummary }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setAuditId(data.id);
      }
    }).catch(() => {});

    await Promise.all([minDelay, summarizePromise, savePromise]);

    setResult(audit);
    setSummary(aiSummary);
    setPriorityAction(aiPriorityAction);
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setSummary(null);
    setPriorityAction(null);
    setAuditId(null);
    setAuditInput(null);
  };

  return (
    <PageShell subtitle="Tell us what you pay. Get a free, instant breakdown of where to cut — backed by current vendor pricing.">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={springTransition}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={springTransition}
            className="space-y-8"
          >
            <Results
              result={result}
              summary={summary}
              priorityAction={priorityAction}
              onReset={reset}
              auditUrl={auditId ? `${typeof window !== "undefined" ? window.location.origin : ""}/audit/${auditId}` : null}
              teamSize={auditInput?.teamSize}
              useCase={auditInput?.useCase}
            />
            <LeadCapture result={result} auditId={auditId} />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={springTransition}
          >
            <AuditForm onSubmit={handleAudit} loading={loading} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
