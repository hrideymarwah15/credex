import type { ToolId } from "@/lib/audit/types";
import { Code2, GitFork, MessageSquare, Bot, Cpu, Cloud, Sparkles, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<ToolId, typeof Code2> = {
  cursor: Code2,
  copilot: GitFork,
  claude: Sparkles,
  chatgpt: MessageSquare,
  anthropic_api: Bot,
  openai_api: Cpu,
  gemini: Cloud,
  windsurf: Wind,
};

const colorMap: Record<ToolId, string> = {
  cursor: "text-blue-400",
  copilot: "text-zinc-400",
  claude: "text-orange-400",
  chatgpt: "text-green-400",
  anthropic_api: "text-orange-300",
  openai_api: "text-emerald-400",
  gemini: "text-sky-400",
  windsurf: "text-teal-400",
};

interface Props {
  tool: ToolId;
  className?: string;
  size?: number;
}

export function ToolIcon({ tool, className, size = 14 }: Props) {
  const Icon = iconMap[tool];
  return <Icon className={cn(colorMap[tool], className)} style={{ width: size, height: size }} />;
}
