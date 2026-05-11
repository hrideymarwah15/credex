"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import type { AuditResult } from "@/lib/audit/types";

interface Props {
  result: AuditResult;
  summary?: string | null;
  shareUrl?: string | null;
}

export function DownloadButton({ result, summary, shareUrl }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { AuditReport } = await import("./AuditReport");
      const blob = await pdf(<AuditReport result={result} summary={summary} shareUrl={shareUrl} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spendlens-audit-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* PDF generation failed silently */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleDownload} loading={loading}>
      <Download className="w-3 h-3" aria-hidden="true" />
      {loading ? "Generating..." : "Download PDF"}
    </Button>
  );
}
