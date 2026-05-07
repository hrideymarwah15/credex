// Audit engine — input + output types
// Single source of truth for the shape of an audit.

export type ToolId =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type Intensity = "occasional" | "regular" | "heavy";

export interface ToolInput {
  tool: ToolId;
  plan: string;             // plan id, e.g. "pro" | "business" | "team" | "api"
  monthlySpend: number;     // USD, what they actually pay
  seats: number;            // number of seats on this plan
  intensity?: Intensity;    // optional self-reported usage
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export type FindingSeverity = "save_big" | "save_some" | "optimal" | "underpaying";

export interface ToolFinding {
  tool: ToolId;
  toolLabel: string;
  currentSpend: number;       // monthly
  recommendedSpend: number;   // monthly after action
  monthlySavings: number;     // currentSpend - recommendedSpend (>=0)
  action: string;             // human-readable: "Switch to Pro × 2 seats"
  reason: string;             // 1-sentence defensible reasoning
  severity: FindingSeverity;
  alternativePlan?: string;
  alternativeTool?: ToolId;
}

export interface AuditResult {
  findings: ToolFinding[];
  totalCurrentMonthly: number;
  totalRecommendedMonthly: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  credexEligible: boolean;     // true when monthly savings > $500 OR API spend > $1k
  isOptimal: boolean;          // true when no findings save_big or save_some
  perSeatSpendForBenchmark: number;
  generatedAt: string;
}
