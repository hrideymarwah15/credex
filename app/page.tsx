"use client";

import { useState } from "react";
import { AuditForm } from "@/components/AuditForm";
import { Results } from "@/components/Results";
import { LeadCapture } from "@/components/LeadCapture";
import { runAudit } from "@/lib/audit/engine";
import type { AuditInput, AuditResult } from "@/lib/audit/types";

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async (input: AuditInput) => {
    setLoading(true);
    const audit = runAudit(input);
    setResult(audit);
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
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-16 sm:py-24 flex-1">
      {/* Header */}
      <header className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">SpendLens</span>
        </div>
        <h1 className="text-[2.5rem] sm:text-5xl font-bold tracking-tight leading-[1.08] text-white">
          Stop overpaying for<br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> AI tools.</span>
        </h1>
        <p className="mt-5 text-base text-zinc-500 max-w-md leading-relaxed">
          Tell us what you pay. Get a free, instant breakdown of where to cut — backed by current vendor pricing.
        </p>
      </header>

      {result ? (
        <div className="space-y-8 animate-fade-up">
          <Results result={result} summary={summary} onReset={reset} />
          <LeadCapture result={result} auditId={auditId} />
        </div>
      ) : (
        <div className="animate-fade-up">
          <AuditForm onSubmit={handleAudit} loading={loading} />
        </div>
      )}

      <footer className="mt-24 flex items-center gap-3 text-[11px] text-zinc-600 border-t border-zinc-800/50 pt-6">
        <div className="h-1 w-1 rounded-full bg-zinc-700" aria-hidden="true" />
        Pricing verified May 2026. Not affiliated with listed tools.
      </footer>
    </main>
  );
}
