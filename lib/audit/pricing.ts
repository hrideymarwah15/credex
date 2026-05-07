// Pricing tables — source of truth for the audit engine.
// Every number here must trace to PRICING_DATA.md at repo root.
// Verified 2026-05-07.

import type { ToolId } from "./types";

export interface PricingPlan {
  id: string;
  label: string;
  pricePerSeat: number;     // monthly, USD
  minSeats: number;
  needsSso?: boolean;       // true if plan only justified by SSO/compliance
  notes?: string;
}

export interface ToolPricing {
  id: ToolId;
  label: string;
  plans: PricingPlan[];
  hasApi?: boolean;
}

export const TOOLS: Record<ToolId, ToolPricing> = {
  cursor: {
    id: "cursor",
    label: "Cursor",
    plans: [
      { id: "hobby", label: "Hobby", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 20, minSeats: 1 },
      { id: "business", label: "Business", pricePerSeat: 40, minSeats: 1, needsSso: true },
      { id: "ultra", label: "Ultra", pricePerSeat: 200, minSeats: 1 },
    ],
  },
  copilot: {
    id: "copilot",
    label: "GitHub Copilot",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 10, minSeats: 1 },
      { id: "pro_plus", label: "Pro+", pricePerSeat: 39, minSeats: 1 },
      { id: "business", label: "Business", pricePerSeat: 19, minSeats: 1, needsSso: true },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 39, minSeats: 1, needsSso: true },
    ],
  },
  claude: {
    id: "claude",
    label: "Claude",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 20, minSeats: 1 },
      { id: "max5", label: "Max 5×", pricePerSeat: 100, minSeats: 1 },
      { id: "max20", label: "Max 20×", pricePerSeat: 200, minSeats: 1 },
      { id: "team", label: "Team", pricePerSeat: 30, minSeats: 5 },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 60, minSeats: 1, needsSso: true },
    ],
    hasApi: true,
  },
  chatgpt: {
    id: "chatgpt",
    label: "ChatGPT",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "plus", label: "Plus", pricePerSeat: 20, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 200, minSeats: 1 },
      { id: "team", label: "Team", pricePerSeat: 25, minSeats: 2 },
      { id: "business", label: "Business", pricePerSeat: 25, minSeats: 1, needsSso: true },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 60, minSeats: 150, needsSso: true },
    ],
    hasApi: true,
  },
  anthropic_api: {
    id: "anthropic_api",
    label: "Anthropic API",
    plans: [{ id: "api", label: "Pay-as-you-go", pricePerSeat: 0, minSeats: 1 }],
    hasApi: true,
  },
  openai_api: {
    id: "openai_api",
    label: "OpenAI API",
    plans: [{ id: "api", label: "Pay-as-you-go", pricePerSeat: 0, minSeats: 1 }],
    hasApi: true,
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "ai_pro", label: "AI Pro", pricePerSeat: 20, minSeats: 1 },
      { id: "ai_ultra", label: "AI Ultra", pricePerSeat: 250, minSeats: 1 },
    ],
    hasApi: true,
  },
  windsurf: {
    id: "windsurf",
    label: "Windsurf",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 15, minSeats: 1 },
      { id: "teams", label: "Teams", pricePerSeat: 30, minSeats: 2, needsSso: true },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 60, minSeats: 200, needsSso: true },
    ],
  },
};

export function getPlan(toolId: ToolId, planId: string): PricingPlan | undefined {
  return TOOLS[toolId]?.plans.find((p) => p.id === planId);
}

export function listPlans(toolId: ToolId): PricingPlan[] {
  return TOOLS[toolId]?.plans ?? [];
}
