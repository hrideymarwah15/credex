import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SharedAuditView } from "./SharedAuditView";
import { PageShell } from "@/components/layout/PageShell";
import type { AuditResult } from "@/lib/audit/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getAudit(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) return { title: "Audit not found — SpendLens" };

  const result = audit.result as AuditResult;
  const savings = Math.round(result.totalMonthlySavings);
  const annual = Math.round(result.totalAnnualSavings);
  const toolCount = result.findings.length;

  const title = savings > 0
    ? `SpendLens found $${annual.toLocaleString()}/yr in AI tool savings`
    : "SpendLens — AI stack is optimized";

  const description = savings > 0
    ? `Audited ${toolCount} AI tool${toolCount > 1 ? "s" : ""} and found $${savings.toLocaleString()}/month ($${annual.toLocaleString()}/year) in potential savings. Free audit — no login required.`
    : `Audited ${toolCount} AI tool${toolCount > 1 ? "s" : ""} — stack is well-optimized. Run your own free audit at SpendLens.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "SpendLens",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();

  const result = audit.result as AuditResult;
  const summary = audit.summary as string | null;

  return (
    <PageShell
      title="AI Spend Audit"
      subtitle="Shared audit results — identifying details stripped."
      headerContent={
        <>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            AI Spend Audit
          </h1>
          <p className="mt-3 text-sm text-muted max-w-md leading-relaxed">
            Shared audit results — identifying details stripped.
          </p>
        </>
      }
    >
      <SharedAuditView result={result} summary={summary} />

      <div className="mt-10 rounded-xl border border-border bg-card/30 p-6 text-center">
        <p className="text-sm text-muted mb-4">
          Want to audit your own AI tool spend?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all"
        >
          Run your free audit
        </Link>
      </div>
    </PageShell>
  );
}
