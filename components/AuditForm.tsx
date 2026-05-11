"use client";

import { useEffect, useState } from "react";
import { TOOLS } from "@/lib/audit/pricing";
import type { AuditInput, ToolId, ToolInput, UseCase, Intensity } from "@/lib/audit/types";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
  } catch {
    /* ignore */
  }
  return null;
}

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
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="AI tool spend audit form">
      {/* Context row */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">Team size</span>
          <Input
            type="number"
            min={1}
            value={teamSize}
            onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">Use case</span>
          <Select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value as UseCase)}
          >
            {USE_CASES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {/* Tool rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Your tools</span>
          <button
            type="button"
            onClick={addTool}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-emerald-400 uppercase tracking-wider transition-colors"
          >
            <Plus className="w-3 h-3" aria-hidden="true" /> Add
          </button>
        </div>

        {tools.map((t, idx) => {
          const meta = TOOLS[t.tool];
          return (
            <div
              key={idx}
              className="group relative rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <label className="col-span-1 sm:col-span-1">
                  <span className="text-[10px] font-medium text-zinc-600 mb-1 block">Tool</span>
                  <Select
                    value={t.tool}
                    onChange={(e) => handleToolChange(idx, e.target.value as ToolId)}
                    inputSize="sm"
                  >
                    {Object.values(TOOLS).map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.label}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="col-span-1 sm:col-span-1">
                  <span className="text-[10px] font-medium text-zinc-600 mb-1 block">Plan</span>
                  <Select
                    value={t.plan}
                    onChange={(e) => updateTool(idx, { plan: e.target.value })}
                    inputSize="sm"
                  >
                    {meta.plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="col-span-1 sm:col-span-1">
                  <span className="text-[10px] font-medium text-zinc-600 mb-1 block">Seats</span>
                  <Input
                    type="number"
                    min={1}
                    value={t.seats}
                    onChange={(e) =>
                      updateTool(idx, { seats: Math.max(1, Number(e.target.value) || 1) })
                    }
                    inputSize="sm"
                  />
                </label>

                <label className="col-span-1 sm:col-span-1">
                  <span className="text-[10px] font-medium text-zinc-600 mb-1 block">$/mo</span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={t.monthlySpend}
                    onChange={(e) =>
                      updateTool(idx, {
                        monthlySpend: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    inputSize="sm"
                    className="font-mono"
                  />
                </label>

                <div className="col-span-2 sm:col-span-1 flex items-end gap-2">
                  <label className="flex-1">
                    <span className="text-[10px] font-medium text-zinc-600 mb-1 block">Usage</span>
                    <Select
                      value={t.intensity ?? "regular"}
                      onChange={(e) =>
                        updateTool(idx, { intensity: e.target.value as Intensity })
                      }
                      inputSize="sm"
                    >
                      {INTENSITIES.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.label}
                        </option>
                      ))}
                    </Select>
                  </label>
                  {tools.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTool(idx)}
                      className="mb-0.5 p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`Remove tool ${idx + 1}`}
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        {loading ? "Analyzing..." : (
          <>
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            Run audit
          </>
        )}
      </Button>
    </form>
  );
}
