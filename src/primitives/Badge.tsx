import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Badge — status pill and neutral tag.
 * DESIGN_SYSTEM.md §7 Components › Badges / Pills.
 * Status badges use status-* tokens (data-viz only). Neutral uses border + text-secondary.
 */
type BadgeTone = "neutral" | "ok" | "warn" | "crit" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "border border-border text-text-secondary bg-transparent",
  ok:      "text-status-ok bg-[rgba(39,166,68,0.12)]",
  warn:    "text-status-warn bg-[rgba(224,155,45,0.12)]",
  crit:    "text-status-crit bg-[rgba(232,96,76,0.12)]",
  accent:  "text-accent-hover bg-accent-tint",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "neutral", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-ui tracking-tight",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
