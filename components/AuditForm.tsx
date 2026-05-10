"use client";

import { useEffect, useState } from "react";
import { TOOLS } from "@/lib/audit/pricing";
import type { AuditInput, ToolId, ToolInput, UseCase, Intensity } from "@/lib/audit/types";
import { Plus, Trash2, Zap } from "lucide-react";

const STORAGE_KEY = "spendlens:form:v1";

const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "data", label: "Data / analysis" },
  { id: "research", label: "Research" },
  { id: "mixed", label: "Mixed" },
];

const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: "occasional", label: "Occasional" },
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
  } catch {
    /* ignore */
  }
  return null;
}

const inputClasses = "mt-1 block w-full rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20";

const smallInputClasses = "mt-1 block w-full rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20";

export function AuditForm({ onSubmit, loading }: Props) {
  const [formState, setFormState] = useState<AuditInput>(() => {
    const stored = readStorage();
    return {
      teamSize: stored?.teamSize ?? 1,
      useCase: stored?.useCase ?? "coding",
      tools: stored?.tools?.length ? stored.tools : [emptyTool()],
    };
  });

  const { teamSize, useCase, tools } = formState;

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
    } catch {
      /* ignore */
    }
  }, [formState]);

  const setTeamSize = (n: number) => setFormState((s) => ({ ...s, teamSize: n }));
  const setUseCase = (u: UseCase) => setFormState((s) => ({ ...s, useCase: u }));
  const setTools = (fn: (t: ToolInput[]) => ToolInput[]) =>
    setFormState((s) => ({ ...s, tools: fn(s.tools) }));

  const updateTool = (idx: number, patch: Partial<ToolInput>) => {
    setTools((curr) =>
      curr.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    );
  };

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
    <form onSubmit={handleSubmit} className="space-y-8" aria-label="AI tool spend audit form">
      {/* Team meta */}
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Team size</span>
          <input
            type="number"
            min={1}
            value={teamSize}
            onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value) || 1))}
            className={inputClasses}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Primary use case</span>
          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value as UseCase)}
            className={inputClasses}
          >
            {USE_CASES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Tools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Tools you&apos;re paying for
          </h3>
          <button
            type="button"
            onClick={addTool}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 px-2.5 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Add tool
          </button>
        </div>

        {tools.map((t, idx) => {
          const meta = TOOLS[t.tool];
          return (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-12 gap-3 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <label className="col-span-2 sm:col-span-3">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tool</span>
                <select
                  value={t.tool}
                  onChange={(e) => handleToolChange(idx, e.target.value as ToolId)}
                  className={smallInputClasses}
                >
                  {Object.values(TOOLS).map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="col-span-2 sm:col-span-3">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Plan</span>
                <select
                  value={t.plan}
                  onChange={(e) => updateTool(idx, { plan: e.target.value })}
                  className={smallInputClasses}
                >
                  {meta.plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="col-span-1 sm:col-span-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Seats</span>
                <input
                  type="number"
                  min={1}
                  value={t.seats}
                  onChange={(e) =>
                    updateTool(idx, { seats: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className={smallInputClasses}
                />
              </label>

              <label className="col-span-1 sm:col-span-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">$/mo</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={t.monthlySpend}
                  onChange={(e) =>
                    updateTool(idx, {
                      monthlySpend: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className={smallInputClasses}
                />
              </label>

              <label className="col-span-2 sm:col-span-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Usage</span>
                <select
                  value={t.intensity ?? "regular"}
                  onChange={(e) =>
                    updateTool(idx, { intensity: e.target.value as Intensity })
                  }
                  className={smallInputClasses}
                >
                  {INTENSITIES.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </label>

              {tools.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTool(idx)}
                  className="col-span-2 sm:col-span-12 text-xs text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 inline-flex items-center gap-1 justify-self-end px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                  aria-label={`Remove tool ${idx + 1}`}
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" /> Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 font-semibold text-base shadow-md shadow-zinc-900/10 dark:shadow-white/5 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" aria-hidden="true" />
            Auditing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" aria-hidden="true" />
            Run my audit
          </>
        )}
      </button>
    </form>
  );
}
