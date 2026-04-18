import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * Button — Meridian primitive.
 * Variants map to DESIGN_SYSTEM.md §7 Components › Buttons.
 * States: default / hover / focus / active / disabled. No loading state by default (add Spinner child).
 */
const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-[6px] text-ui transition-colors " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-[#fff] hover:bg-accent-hover active:bg-accent-bright",
        ghost:
          "bg-white/[.02] text-text-secondary border border-border hover:bg-bg-hover hover:text-text",
        subtle:
          "bg-transparent text-text-muted hover:text-text",
        destructive:
          "bg-transparent text-status-crit border border-border hover:border-status-crit",
      },
      size: {
        sm: "h-7 px-3",
        md: "h-8 px-3.5",
        lg: "h-9 px-4",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(button({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
