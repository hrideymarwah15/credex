"use client";

import { useState } from "react";
import { Mail, Building2, Briefcase, Users, Loader2, Check, Share2, Link2 } from "lucide-react";
import type { AuditResult } from "@/lib/audit/types";

interface Props {
  result: AuditResult;
  auditId: string | null;
}

export function LeadCapture({ result, auditId }: Props) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const isHighSavings = result.credexEligible;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          auditId,
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          savingsMonthly: result.totalMonthlySavings,
          credexEligible: result.credexEligible,
          website, // honeypot
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "rate_limited") {
          setStatus("error");
          return;
        }
        throw new Error("failed");
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const shareUrl = auditId ? `${window.location.origin}/audit/${auditId}` : null;

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <Check className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">Got it — check your inbox.</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isHighSavings
            ? "We'll send your full audit report and a Credex team member will reach out within 48 hours about additional savings opportunities."
            : "We'll send your audit report and notify you when new optimizations apply to your stack."}
        </p>

        {shareUrl && (
          <div className="pt-2 border-t border-emerald-500/20">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
              <Share2 className="w-4 h-4" aria-hidden="true" /> Share your audit
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                aria-label="Shareable audit URL"
                className="flex-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-zinc-600 dark:text-zinc-400"
              />
              <button
                onClick={handleCopy}
                aria-label="Copy share link"
                className="shrink-0 inline-flex items-center gap-1 text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 rounded-md hover:opacity-90"
              >
                <Link2 className="w-3 h-3" aria-hidden="true" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">
          {isHighSavings
            ? "Get your full report + Credex consultation"
            : "Save your audit results"}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {isHighSavings
            ? "We'll email the full report and connect you with our team for additional committed-use savings."
            : "We'll email your report and notify you when new savings opportunities apply to your tools."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot — hidden from real users */}
        <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        <label className="block">
          <span className="text-sm font-medium flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" aria-hidden="true" /> Email *
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
          />
        </label>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Building2 className="w-3 h-3" aria-hidden="true" /> Company
            </span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Briefcase className="w-3 h-3" aria-hidden="true" /> Role
            </span>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Users className="w-3 h-3" aria-hidden="true" /> Team size
            </span>
            <input
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="w-full rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sending…
            </>
          ) : (
            isHighSavings ? "Get report + book consultation" : "Email me my report"
          )}
        </button>

        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Something went wrong. Please try again in a moment.
          </p>
        )}
      </form>
    </div>
  );
}
