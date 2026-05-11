import { cn } from "@/lib/utils";

interface Props {
  current: number;
  recommended: number;
  className?: string;
}

export function SpendBar({ current, recommended, className }: Props) {
  if (current <= 0) return null;
  const ratio = Math.max(0, Math.min(1, recommended / current));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500/60 transition-all duration-700"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-[9px] text-muted font-mono tabular-nums shrink-0">
        {Math.round((1 - ratio) * 100)}% saved
      </span>
    </div>
  );
}
