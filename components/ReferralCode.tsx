"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Gift, Copy, Check } from "lucide-react";

interface Props {
  auditId: string | null;
  email?: string | null;
  savings: number;
}

export function ReferralCode({ auditId, email, savings }: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Only show referral for audits with savings
  if (!auditId || savings < 100) return null;

  const generateCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/referral/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email }),
      });

      if (res.ok) {
        const data = await res.json();
        setCode(data.code);
      }
    } catch (err) {
      console.error("Failed to generate referral code:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const referralUrl = `${baseUrl}?ref=${code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) {
    return (
      <FadeIn delay={0.4}>
        <section className="rounded-2xl border border-border bg-gradient-to-br from-indigo-500/[0.06] to-violet-500/[0.04] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-heading mb-1">
                  Share SpendLens, both get a perk
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Get a unique referral code. When someone uses SpendLens through your link and
                  saves &gt;$100/mo, you both qualify for exclusive early access to Credex deals.
                </p>
              </div>
              <Button
                onClick={generateCode}
                disabled={loading}
                size="sm"
                variant="secondary"
                className="border-indigo-500/30 hover:bg-indigo-500/10"
              >
                {loading ? "Generating..." : "Get my referral code"}
              </Button>
            </div>
          </div>
        </section>
      </FadeIn>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralUrl = `${baseUrl}?ref=${code}`;

  return (
    <FadeIn delay={0.4}>
      <section className="rounded-2xl border border-border bg-gradient-to-br from-indigo-500/[0.06] to-violet-500/[0.04] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Gift className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-heading mb-1">
                Your referral code: <span className="font-mono text-indigo-400">{code}</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed mb-2">
                Share this link. When someone saves &gt;$100/mo using it, you both get early access to Credex deals.
              </p>
              <div className="rounded-lg bg-card/50 border border-border p-2 flex items-center gap-2">
                <code className="text-xs text-muted flex-1 truncate font-mono">
                  {referralUrl}
                </code>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-7"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
