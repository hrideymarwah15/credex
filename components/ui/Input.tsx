import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseStyles =
  "block w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card/50 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-muted/60 shadow-xs hover:border-slate-300 dark:hover:border-muted/40 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all";

type InputSize = "sm" | "md";

const sizeStyles: Record<InputSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2.5",
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = "md", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(baseStyles, sizeStyles[inputSize], className)}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  inputSize?: InputSize;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, inputSize = "md", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(baseStyles, sizeStyles[inputSize], "cursor-pointer", className)}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  size?: "sm" | "md";
}

export function Label({ className, size = "md", children, ...props }: LabelProps) {
  const sizeClass = size === "sm"
    ? "text-[10px] text-slate-500 dark:text-muted/70"
    : "text-xs text-slate-600 dark:text-muted";

  return (
    <label className={cn("block", className)} {...props}>
      <span className={cn("font-semibold uppercase tracking-wider mb-1.5 block", sizeClass)}>
        {children}
      </span>
    </label>
  );
}
