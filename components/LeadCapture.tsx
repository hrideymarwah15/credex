"use client";

import { useState } from "react";
import { Mail, Building2, Briefcase, Users, Loader2, Check, Link2 } from "lucide-react";
import type { AuditResult } from "@/lib/audit/types";

interface Props {
  result: AuditResult;
  auditId: string | null;
}

const inputBase = "block w-full rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 hover:border-zinc-700";

export function LeadCapture({ result, auditId }: Props) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [website, setWebsite] = useState("");
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
          website,
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
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center" aria-hidden="true">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium">Sent — check your inbox.</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {isHighSavings
            ? "Full report sent. A Credex team member will reach out within 48 hours about additional savings."
            : "Report sent. We&apos;ll notify you when new savings opportunities apply to your stack."}
        </p>

        {shareUrl && (
          <div className="pt-3 border-t border-zinc-800/50">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-2 block">Share link</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                aria-label="Shareable audit URL"
                className="flex-1 text-xs bg-zinc-900/50 border border-zinc-800 rounded-md px-2.5 py-1.5 text-zinc-500 font-mono truncate"
              />
              <button
                onClick={handleCopy}
                aria-label="Copy share link"
                className="shrink-0 inline-flex items-center gap-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition-colors"
              >
                <Link2 className="w-3 h-3" aria-hidden="true" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">
          {isHighSavings ? "Get your report + consultation" : "Save your results"}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
          {isHighSavings
            ? "We&apos;ll email the full report and connect you with our team for committed-use savings."
            : "We&apos;ll email your report and notify you when new savings apply."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot */}
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
          <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mb-1">
            <Mail className="w-3 h-3" aria-hidden="true" /> Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={`${inputBase} px-3 py-2`}
          />
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-[10px] font-medium text-zinc-600 flex items-center gap-1 mb-1">
              <Building2 className="w-2.5 h-2.5" aria-hidden="true" /> Company
            </span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`${inputBase} px-2.5 py-1.5 text-xs`}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-medium text-zinc-600 flex items-center gap-1 mb-1">
              <Briefcase className="w-2.5 h-2.5" aria-hidden="true" /> Role
            </span>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputBase} px-2.5 py-1.5 text-xs`}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-medium text-zinc-600 flex items-center gap-1 mb-1">
              <Users className="w-2.5 h-2.5" aria-hidden="true" /> Team
            </span>
            <input
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className={`${inputBase} px-2.5 py-1.5 text-xs`}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="w-full rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Sending...
            </>
          ) : (
            isHighSavings ? "Get report + consultation" : "Email my report"
          )}
        </button>

        {status === "error" && (
          <p className="text-xs text-red-400" role="alert">
            Something went wrong. Try again in a moment.
          </p>
        )}
      </form>
    </div>
  );
}
