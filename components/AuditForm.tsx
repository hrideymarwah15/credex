"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { TOOLS } from "@/lib/audit/pricing";
import type { AuditInput, ToolId, ToolInput, UseCase, Intensity } from "@/lib/audit/types";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToolIcon } from "@/components/icons/ToolIcon";
import { formatUsd } from "@/lib/utils";
import { Plus, X, Zap } from "lucide-react";

const STORAGE_KEY = "spendlens:form:v1";

const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "data", label: "Data / analysis" },
  { id: "research", label: "Research" },
  { id: "mixed", label: "Mixed" },
];

const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: "occasional", label: "Light" },
  { id: "regular", label: "Regular" },
  { id: "heavy", label: "Heavy" },
];

interface Props {
  onSubmit: (input: AuditInput) => void;
  loading?: boolean;
}

const emptyTool = (): ToolInput => ({
  tool: "cursor",
  plan: "pro",
  monthlySpend: 0,
  seats: 1,
  intensity: "regular",
});

function readStorage(): AuditInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuditInput;
  } catch { /* ignore */ }
  return null;
}

export function AuditForm({ onSubmit, loading }: Props) {
  const [formState, setFormState] = useState<AuditInput>({
    teamSize: 1,
    useCase: "coding",
    tools: [emptyTool()],
  });

  const { teamSize, useCase, tools } = formState;

  const totalMonthly = useMemo(
    () => tools.reduce((sum, t) => sum + t.monthlySpend, 0),
    [tools],
  );

  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      setFormState({
        teamSize: stored.teamSize ?? 1,
        useCase: stored.useCase ?? "coding",
        tools: stored.tools?.length ? stored.tools : [emptyTool()],
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(formState)); }
    catch { /* ignore */ }
  }, [formState]);

  const setTeamSize = (n: number) => setFormState((s) => ({ ...s, teamSize: n }));
  const setUseCase = (u: UseCase) => setFormState((s) => ({ ...s, useCase: u }));
  const setTools = (fn: (t: ToolInput[]) => ToolInput[]) =>
    setFormState((s) => ({ ...s, tools: fn(s.tools) }));

  const updateTool = (idx: number, patch: Partial<ToolInput>) =>
    setTools((curr) => curr.map((t, i) => (i === idx ? { ...t, ...patch } : t)));

  const addTool = () => setTools((c) => [...c, emptyTool()]);
  const removeTool = (idx: number) =>
    setTools((c) => (c.length > 1 ? c.filter((_, i) => i !== idx) : c));

  const handleToolChange = (idx: number, toolId: ToolId) => {
    const firstPlan = TOOLS[toolId].plans[0];
    updateTool(idx, { tool: toolId, plan: firstPlan.id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ teamSize, useCase, tools });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="AI tool spend audit form">
      {/* Section: Team context */}
      <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 sm:p-6 card-shadow space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-muted">Step 1</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-foreground">Your team</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-muted mb-1.5 block">Team size</span>
            <Input
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value) || 1))}
              placeholder="e.g. 5"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-muted mb-1.5 block">Primary use</span>
            <Select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UseCase)}
            >
              {USE_CASES.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </Select>
          </label>
        </div>
      </div>

      {/* Section: Tools */}
      <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 sm:p-6 card-shadow space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-muted">Step 2</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-foreground">Your AI tools</span>
          </div>
          <button
            type="button"
            aria-label="Add tool"
            onClick={addTool}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-accent hover:text-emerald-700 dark:hover:text-accent-muted uppercase tracking-wider transition-colors"
          >
            <Plus className="w-3 h-3" aria-hidden="true" /> Add tool
          </button>
        </div>

        {tools.map((t, idx) => {
          const meta = TOOLS[t.tool];
          return (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="group relative rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-surface p-3.5 sm:p-4 hover:border-slate-300 dark:hover:border-muted/40 transition-all"
            >
              {/* Tool selector header */}
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 flex-1 min-w-0">
                  <ToolIcon tool={t.tool} size={15} />
                  <Select
                    value={t.tool}
                    onChange={(e) => handleToolChange(idx, e.target.value as ToolId)}
                    inputSize="sm"
                    className="text-xs font-semibold text-slate-700 dark:text-foreground/80 border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0 focus:border-0 cursor-pointer"
                  >
                    {Object.values(TOOLS).map((tool) => (
                      <option key={tool.id} value={tool.id}>{tool.label}</option>
                    ))}
                  </Select>
                </label>
                {tools.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(idx)}
                    className="p-1 rounded-lg text-slate-400 dark:text-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    aria-label={`Remove tool ${idx + 1}`}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Tool fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <label>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-muted/70 mb-1 block uppercase tracking-wider">Plan</span>
                  <Select value={t.plan} onChange={(e) => updateTool(idx, { plan: e.target.value })} inputSize="sm">
                    {meta.plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </Select>
                </label>

                <label>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-muted/70 mb-1 block uppercase tracking-wider">Seats</span>
                  <Input
                    type="number"
                    min={1}
                    value={t.seats}
                    onChange={(e) => updateTool(idx, { seats: Math.max(1, Number(e.target.value) || 1) })}
                    inputSize="sm"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-muted/70 mb-1 block uppercase tracking-wider">$/mo</span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={t.monthlySpend}
                    onChange={(e) => updateTool(idx, { monthlySpend: Math.max(0, Number(e.target.value) || 0) })}
                    inputSize="sm"
                    className="font-mono"
                  />
                </label>

                <div className="flex items-end gap-2">
                  <label className="flex-1">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-muted/70 mb-1 block uppercase tracking-wider">Usage</span>
                    <Select
                      value={t.intensity ?? "regular"}
                      onChange={(e) => updateTool(idx, { intensity: e.target.value as Intensity })}
                      inputSize="sm"
                    >
                      {INTENSITIES.map((i) => (
                        <option key={i.id} value={i.id}>{i.label}</option>
                      ))}
                    </Select>
                  </label>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cost preview */}
      {totalMonthly > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-4 py-3 card-shadow"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-muted">You&apos;re currently paying</span>
          <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-heading">
            {formatUsd(totalMonthly)}<span className="text-xs font-normal text-slate-400 dark:text-muted">/mo</span>
          </span>
        </motion.div>
      )}

      {/* Submit */}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {loading ? "Analyzing…" : (
          <>
            <Zap className="w-4 h-4" aria-hidden="true" />
            Run free audit
          </>
        )}
      </Button>

      <p className="text-center text-[11px] text-slate-400 dark:text-muted/60">
        No account needed · Results in seconds · Verified pricing data
      </p>
    </form>
  );
}
