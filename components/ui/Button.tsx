import { forwardRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 dark:shadow-emerald-900/30 border border-emerald-600 hover:border-emerald-700",
  secondary:
    "bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-card-hover text-slate-700 dark:text-foreground border border-slate-200 dark:border-border shadow-sm",
  ghost:
    "bg-transparent hover:bg-slate-100 dark:hover:bg-surface text-slate-500 dark:text-muted hover:text-slate-900 dark:hover:text-foreground",
  danger:
    "bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-sm gap-2 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, onDrag: _onDrag, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...(props as Record<string, unknown>)}
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" aria-hidden="true" />
            {children}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
