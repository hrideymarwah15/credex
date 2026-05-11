"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AuditForm } from "@/components/AuditForm";
import { Results } from "@/components/Results";
import { LeadCapture } from "@/components/LeadCapture";
import { PageShell } from "@/components/layout/PageShell";
import { runAudit } from "@/lib/audit/engine";
import type { AuditInput, AuditResult, UseCase } from "@/lib/audit/types";

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditInput, setAuditInput] = useState<{ teamSize: number; useCase: UseCase } | null>(null);

  const handleAudit = async (input: AuditInput) => {
    setLoading(true);
    const audit = runAudit(input);
    setResult(audit);
    setAuditInput({ teamSize: input.teamSize, useCase: input.useCase });
    setSummary(null);
    setAuditId(null);

    let aiSummary: string | null = null;

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, result: audit }),
      });
      if (res.ok) {
        const data = await res.json();
        aiSummary = data.summary;
        setSummary(aiSummary);
      }
    } catch {
      /* results show without summary */
    }

    try {
      const res = await fetch("/api/audit/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, result: audit, summary: aiSummary }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditId(data.id);
      }
    } catch {
      /* shareable link is optional */
    }

    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setSummary(null);
    setAuditId(null);
    setAuditInput(null);
  };

  return (
    <PageShell subtitle="Tell us what you pay. Get a free, instant breakdown of where to cut — backed by current vendor pricing.">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <Results
              result={result}
              summary={summary}
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
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <AuditForm onSubmit={handleAudit} loading={loading} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
