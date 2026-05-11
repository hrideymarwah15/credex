import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseStyles =
  "block w-full rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 hover:border-zinc-700 transition-colors";

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
    ? "text-[10px] text-zinc-600"
    : "text-[11px] text-zinc-500";

  return (
    <label className={cn("block", className)} {...props}>
      <span className={cn("font-medium uppercase tracking-wider mb-1 block", sizeClass)}>
        {children}
      </span>
    </label>
  );
}
