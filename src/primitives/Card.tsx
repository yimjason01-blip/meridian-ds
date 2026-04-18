import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Card — Meridian primitive.
 * DESIGN_SYSTEM.md §6 Elevation level 2 + §7 Components › Cards.
 * RULE: No nested cards (banned_patterns › nested-card). Composition guard warns in dev.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    // Dev-time warning if a Card contains another Card
    if (import.meta.env.DEV) {
      React.Children.forEach(children, (child: React.ReactNode) => {
        if (React.isValidElement(child) && (child.type as React.ComponentType).displayName === "Card") {
          // eslint-disable-next-line no-console
          console.warn("[Meridian DS] Nested Card detected. See banned_patterns › nested-card.");
        }
      });
    }
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/[.02] border border-border rounded-card p-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("t-label mb-3", className)} {...p} />
);
export const CardBody = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("t-body", className)} {...p} />
);
