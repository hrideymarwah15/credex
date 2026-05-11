import { cn } from "@/lib/utils";

type Variant = "default" | "highlighted" | "accent";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  default: "border-zinc-800 bg-zinc-900/30",
  highlighted: "border-zinc-800 overflow-hidden",
  accent: "border-indigo-500/20 overflow-hidden",
};

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div className={cn("rounded-xl border", variantStyles[variant], className)} {...props}>
      {variant === "highlighted" && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-teal-500/[0.04]" aria-hidden="true" />
      )}
      {variant === "accent" && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.04]" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
