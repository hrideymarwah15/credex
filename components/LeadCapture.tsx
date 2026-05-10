"use client";

import { useState } from "react";
import { Mail, Building2, Briefcase, Users, Loader2, Check, Share2, Link2 } from "lucide-react";
import type { AuditResult } from "@/lib/audit/types";

interface Props {
  result: AuditResult;
  auditId: string | null;
}

const inputClasses = "mt-1 block w-full rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20";

const smallInputClasses = "mt-1 block w-full rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20";

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
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center" aria-hidden="true">
            <Check className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg">Got it — check your inbox.</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {isHighSavings
            ? "We'll send your full audit report and a Credex team member will reach out within 48 hours about additional savings opportunities."
            : "We'll send your audit report and notify you when new optimizations apply to your stack."}
        </p>

        {shareUrl && (
          <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800/40">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5 flex items-center gap-1.5">
              <Share2 className="w-4 h-4" aria-hidden="true" /> Share your audit
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                aria-label="Shareable audit URL"
                className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-600 dark:text-zinc-400 font-mono shadow-sm"
              />
              <button
                onClick={handleCopy}
                aria-label="Copy share link"
                className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3.5 py-2 rounded-lg shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 sm:p-8 space-y-5 shadow-sm">
      <div>
        <h3 className="font-bold text-lg">
          {isHighSavings
            ? "Get your full report + Credex consultation"
            : "Save your audit results"}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
          {isHighSavings
            ? "We'll email the full report and connect you with our team for additional committed-use savings."
            : "We'll email your report and notify you when new savings opportunities apply to your tools."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" aria-hidden="true" /> Email *
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClasses}
          />
        </label>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" aria-hidden="true" /> Company
            </span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={smallInputClasses}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Briefcase className="w-3 h-3" aria-hidden="true" /> Role
            </span>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={smallInputClasses}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Users className="w-3 h-3" aria-hidden="true" /> Team size
            </span>
            <input
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className={smallInputClasses}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="w-full rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 font-semibold shadow-md shadow-zinc-900/10 dark:shadow-white/5 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending...
            </>
          ) : (
            isHighSavings ? "Get report + book consultation" : "Email me my report"
          )}
        </button>

        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            Something went wrong. Please try again in a moment.
          </p>
        )}
      </form>
    </div>
  );
}
