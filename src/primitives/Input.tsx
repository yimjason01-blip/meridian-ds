import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Input — Meridian primitive.
 * DESIGN_SYSTEM.md §7 Components › Inputs.
 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-8 w-full rounded-[6px] px-3 py-1 text-ui",
        "bg-white/[.02] border border-border text-text placeholder:text-text-muted",
        "transition-colors",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-tint",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
