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

    // Fetch AI summary
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

    // Save audit to get shareable ID
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
    <main className="mx-auto max-w-3xl px-5 py-14 sm:py-20 flex-1 w-full">
      <header className="mb-12">
        <nav aria-label="Site">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
            SpendLens
          </div>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
          Audit your AI tool spend<br className="hidden sm:block" /> in 90 seconds.
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Free. No login. Tell us what you pay, get a defensible breakdown of where
          you&apos;re overpaying — with current pricing as of May 2026.
        </p>
      </header>

      {result ? (
        <section aria-label="Audit results" className="space-y-10">
          <Results result={result} summary={summary} onReset={reset} />
          <LeadCapture
            result={result}
            auditId={auditId}
          />
        </section>
      ) : (
        <section aria-label="Audit input">
          <AuditForm onSubmit={handleAudit} loading={loading} />
        </section>
      )}

      <footer className="mt-20 text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        Built for the Credex internship. Pricing verified against vendor sites on
        2026-05-07. Not affiliated with the tools listed.
      </footer>
    </main>
  );
}
