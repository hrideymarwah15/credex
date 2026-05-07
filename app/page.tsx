"use client";

import { useState } from "react";
import { AuditForm } from "@/components/AuditForm";
import { Results } from "@/components/Results";
import { runAudit } from "@/lib/audit/engine";
import type { AuditInput, AuditResult } from "@/lib/audit/types";

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async (input: AuditInput) => {
    setLoading(true);
    const audit = runAudit(input);
    setResult(audit);
    setSummary(null);

    // Fire-and-forget AI summary; results show immediately regardless.
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, result: audit }),
      });
      if (res.ok) {
        const { summary } = await res.json();
        setSummary(summary);
      }
    } catch {
      /* engine findings already explain the why; summary is just polish */
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSummary(null);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16 flex-1 w-full">
      <header className="mb-10">
        <div className="text-xs font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
          SpendLens
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Audit your AI tool spend in 90 seconds.
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl">
          Free. No login. Tell us what you pay, get a defensible breakdown of where
          you're overpaying — with current pricing as of May 2026.
        </p>
      </header>

      {result ? (
        <Results result={result} summary={summary} onReset={reset} />
      ) : (
        <AuditForm onSubmit={handleAudit} loading={loading} />
      )}

      <footer className="mt-16 text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        Built for the Credex internship. Pricing verified against vendor sites on
        2026-05-07. Not affiliated with the tools listed.
      </footer>
    </main>
  );
}
