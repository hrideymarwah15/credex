import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SharedAuditView } from "./SharedAuditView";
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
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16 flex-1 w-full">
      <header className="mb-10">
        <div className="text-xs font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
          SpendLens
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          AI Spend Audit Results
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl">
          Shared audit — identifying details stripped. Tools and savings shown.
        </p>
      </header>

      <SharedAuditView result={result} summary={summary} />

      <div className="mt-10 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
        <p className="text-zinc-600 dark:text-zinc-400 mb-3">
          Want to see where your team is overpaying?
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 font-medium hover:opacity-90"
        >
          Run your free audit →
        </Link>
      </div>

      <footer className="mt-16 text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        Built for the Credex internship. Pricing verified against vendor sites on
        2026-05-07. Not affiliated with the tools listed.
      </footer>
    </main>
  );
}
