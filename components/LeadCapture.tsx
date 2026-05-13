"use client";

import { useState } from "react";
import { Mail, Building2, Briefcase, Users, Check, Link2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
        if (data.error === "rate_limited") { setStatus("error"); return; }
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
      <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/[0.04] dark:to-transparent p-5 sm:p-6 card-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0" aria-hidden="true">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-heading">Report sent — check your inbox.</p>
            <p className="text-xs text-slate-500 dark:text-muted mt-0.5">
              {isHighSavings
                ? "A Credex team member will reach out within 48 hours about additional savings."
                : "We'll notify you when new savings opportunities apply to your stack."}
            </p>
          </div>
        </div>

        {shareUrl && (
          <div className="pt-4 border-t border-slate-100 dark:border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-muted mb-2 block">
              Share your results
            </span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                aria-label="Shareable audit URL"
                className="flex-1 text-xs bg-white dark:bg-card/50 border border-slate-200 dark:border-border rounded-xl px-3 py-2 text-slate-400 dark:text-muted font-mono truncate shadow-xs"
              />
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                <Link2 className="w-3 h-3" aria-hidden="true" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 sm:p-6 card-shadow space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-surface border border-slate-200 dark:border-border flex items-center justify-center shrink-0" aria-hidden="true">
          <Mail className="w-4 h-4 text-slate-600 dark:text-muted" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-heading">
            {isHighSavings ? "Get your full report + consultation" : "Email me my audit results"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted mt-0.5 leading-relaxed">
            {isHighSavings
              ? "We'll email the full report and connect you with our team for committed-use savings."
              : "We'll email your report and notify you when new savings apply."}
          </p>
        </div>
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
          <span className="text-xs font-semibold text-slate-500 dark:text-muted flex items-center gap-1.5 mb-1.5">
            <Mail className="w-3 h-3" aria-hidden="true" /> Work email
          </span>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          <label className="block">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-muted/70 flex items-center gap-1 mb-1.5">
              <Building2 className="w-2.5 h-2.5" aria-hidden="true" /> Company
            </span>
            <Input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} inputSize="sm" />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-muted/70 flex items-center gap-1 mb-1.5">
              <Briefcase className="w-2.5 h-2.5" aria-hidden="true" /> Role
            </span>
            <Input type="text" value={role} onChange={(e) => setRole(e.target.value)} inputSize="sm" />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-muted/70 flex items-center gap-1 mb-1.5">
              <Users className="w-2.5 h-2.5" aria-hidden="true" /> Team
            </span>
            <Input type="number" min={1} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} inputSize="sm" />
          </label>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-muted/60">
          <ShieldCheck className="w-3 h-3 text-slate-300 dark:text-muted/40" aria-hidden="true" />
          We never share your data. No spam, ever.
        </div>

        <Button
          type="submit"
          variant="secondary"
          loading={status === "loading"}
          disabled={!email}
          className="w-full"
        >
          {status === "loading"
            ? "Sending…"
            : isHighSavings ? "Get report + consultation" : "Email my report"}
        </Button>

        {status === "error" && (
          <p className="text-xs text-red-500 dark:text-red-400" role="alert">
            Something went wrong. Try again in a moment.
          </p>
        )}
      </form>
    </div>
  );
}
