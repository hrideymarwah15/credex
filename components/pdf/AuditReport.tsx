"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AuditResult } from "@/lib/audit/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#27272a" },
  header: { marginBottom: 24 },
  brand: { fontSize: 8, color: "#10b981", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "bold", color: "#09090b", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#71717a" },
  hero: { backgroundColor: "#f0fdf4", borderRadius: 8, padding: 20, marginBottom: 20 },
  heroAmount: { fontSize: 32, fontWeight: "bold", color: "#059669", fontFamily: "Courier" },
  heroSub: { fontSize: 9, color: "#71717a", marginTop: 4 },
  sectionTitle: { fontSize: 8, color: "#a1a1aa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 },
  findingRow: { flexDirection: "row", justifyContent: "space-between", borderBottom: "1pt solid #e4e4e7", paddingVertical: 8 },
  findingTool: { fontSize: 11, fontWeight: "bold", color: "#18181b" },
  findingAction: { fontSize: 9, color: "#52525b", marginTop: 2 },
  findingReason: { fontSize: 8, color: "#a1a1aa", marginTop: 2 },
  findingSavings: { fontSize: 14, fontWeight: "bold", color: "#059669", fontFamily: "Courier", textAlign: "right" },
  findingSpend: { fontSize: 8, color: "#a1a1aa", fontFamily: "Courier", textAlign: "right" },
  summaryBox: { backgroundColor: "#fafafa", borderRadius: 6, padding: 14, marginBottom: 16 },
  summaryText: { fontSize: 10, color: "#3f3f46", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#a1a1aa" },
});

function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

interface Props {
  result: AuditResult;
  summary?: string | null;
  shareUrl?: string | null;
}

export function AuditReport({ result, summary, shareUrl }: Props) {
  const sorted = [...result.findings].sort((a, b) => b.monthlySavings - a.monthlySavings);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>SpendLens Audit Report</Text>
          <Text style={styles.title}>
            {result.isOptimal ? "Your AI stack is optimized" : `Save ${formatUsd(result.totalAnnualSavings)}/year`}
          </Text>
          <Text style={styles.subtitle}>
            Generated {new Date(result.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </Text>
        </View>

        {!result.isOptimal && (
          <View style={styles.hero}>
            <Text style={styles.heroAmount}>{formatUsd(result.totalMonthlySavings)}/mo</Text>
            <Text style={styles.heroSub}>
              {formatUsd(result.totalCurrentMonthly)} → {formatUsd(result.totalRecommendedMonthly)}/mo · {formatUsd(result.totalAnnualSavings)}/yr
            </Text>
          </View>
        )}

        {summary && (
          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Analysis</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Per-tool breakdown</Text>
        {sorted.map((f, i) => (
          <View key={i} style={styles.findingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.findingTool}>{f.toolLabel}</Text>
              <Text style={styles.findingAction}>{f.action}</Text>
              <Text style={styles.findingReason}>{f.reason}</Text>
            </View>
            <View style={{ width: 80, alignItems: "flex-end" }}>
              <Text style={styles.findingSpend}>
                {formatUsd(f.currentSpend)} → {formatUsd(f.recommendedSpend)}
              </Text>
              {f.monthlySavings > 0 ? (
                <Text style={styles.findingSavings}>-{formatUsd(f.monthlySavings)}</Text>
              ) : (
                <Text style={{ fontSize: 9, color: "#a1a1aa" }}>No change</Text>
              )}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>SpendLens by Credex · Pricing verified May 2026</Text>
          {shareUrl && <Text style={styles.footerText}>{shareUrl}</Text>}
        </View>
      </Page>
    </Document>
  );
}
