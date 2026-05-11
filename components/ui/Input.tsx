import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseStyles =
  "block w-full rounded-md border border-border bg-card/50 text-sm text-foreground placeholder:text-muted/60 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 hover:border-muted/40 transition-colors";

type InputSize = "sm" | "md";

const sizeStyles: Record<InputSize, string> = {
  sm: "px-2 py-1.5 text-xs",
  md: "px-3 py-2",
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
        className={cn(baseStyles, sizeStyles[inputSize], className)}
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
    ? "text-[10px] text-muted/70"
    : "text-[11px] text-muted";

  return (
    <label className={cn("block", className)} {...props}>
      <span className={cn("font-medium uppercase tracking-wider mb-1 block", sizeClass)}>
        {children}
      </span>
    </label>
  );
}
