import * as React from "react";
import { cn } from "../lib/cn";

/**
 * SegmentedControl — top-level mode switch (prototype header pattern).
 *
 * Semantic: "switch between product modes / sections" (Care Plan / Risk Models / EMR).
 * NOT the same as <Tabs> (underline, in-page tab group).
 *
 * Visual spec (exact, from prototype.html :8087):
 *   Container: bg rgba(255,255,255,0.03), 1px border, 8px radius, 3px padding.
 *   Item:      padding 6px 14px, 13px/510/-0.13px, cv01+ss03.
 *   Active:    bg #ffffff, color #08090a, 6px radius, subtle drop shadow.
 *   Inactive:  color text-muted, hover → text.
 *
 * Use when you have 2–4 peer product-level sections. For >4 peers use <Tabs>.
 */

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Section",
}: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-[2px] rounded-card border border-border p-[3px]",
        "bg-white/[0.03]",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-7 px-3.5 rounded-[6px] text-ui transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
              active
                ? "bg-[#ffffff] text-[#08090a] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "bg-transparent text-text-muted hover:text-text"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
