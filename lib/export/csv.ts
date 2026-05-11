import type { AuditResult, ToolFinding } from "@/lib/audit/types";

function escapeField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsv(result: AuditResult): string {
  const headers = ["Tool", "Current Spend", "Recommended Spend", "Monthly Savings", "Annual Savings", "Action", "Severity"];
  const rows = result.findings.map((f: ToolFinding) => [
    escapeField(f.toolLabel),
    `$${f.currentSpend}`,
    `$${f.recommendedSpend}`,
    `$${f.monthlySavings}`,
    `$${f.monthlySavings * 12}`,
    escapeField(f.action),
    f.severity,
  ]);

  const totalRow = [
    "TOTAL",
    `$${result.totalCurrentMonthly}`,
    `$${result.totalRecommendedMonthly}`,
    `$${result.totalMonthlySavings}`,
    `$${result.totalAnnualSavings}`,
    "",
    "",
  ];

  return [headers.join(","), ...rows.map((r) => r.join(",")), totalRow.join(",")].join("\n");
}

export function downloadCsv(result: AuditResult): void {
  const csv = generateCsv(result);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `spendlens-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
