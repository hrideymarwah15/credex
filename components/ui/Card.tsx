import { cn } from "@/lib/utils";

type Variant = "default" | "highlighted" | "accent" | "surface";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  default: "border-slate-200 dark:border-border bg-white dark:bg-card card-shadow",
  highlighted: "border-emerald-100 dark:border-emerald-500/20 bg-white dark:bg-card overflow-hidden card-shadow",
  accent: "border-indigo-100 dark:border-indigo-500/20 bg-white dark:bg-card overflow-hidden card-shadow",
  surface: "border-slate-100 dark:border-border bg-slate-50 dark:bg-surface",
};

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div className={cn("rounded-2xl border relative", variantStyles[variant], className)} {...props}>
      {variant === "highlighted" && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 dark:from-emerald-500/[0.04] via-transparent to-transparent rounded-2xl pointer-events-none" aria-hidden="true" />
      )}
      {variant === "accent" && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 dark:from-indigo-500/[0.04] via-transparent to-transparent rounded-2xl pointer-events-none" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pt-6 pb-4 border-b border-slate-100 dark:border-border", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
