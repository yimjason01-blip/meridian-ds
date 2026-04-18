import * as React from "react";
import { cn } from "../lib/cn";

/**
 * DomainPane — canonical Meridian Risk Model pane (CKD, CVD, Metabolic, Neuro).
 * Source skills: meridian-risk-domain-pane, meridian-domain-pane-shape.
 * Shape: Header (name + 5yr absolute risk hero) → Drivers (ranked contributors, math-only) →
 *        Evidence (citations, single-line) → Care Plan link (not nested).
 *
 * Rule: panes are math-only. Narrative lives in summary pane (meridian-summary-pane-shape).
 */
export interface DomainPaneProps {
  name: string;              // e.g., "Cardiovascular"
  hero: { value: string; label: string; delta?: string; trend?: "up" | "down" | "flat" };
  drivers: { label: string; weight: string; contribution: string }[]; // weight formatted e.g. "HR 1.24"
  evidence?: string;
  onOpenCarePlan?: () => void;
  className?: string;
}

export function DomainPane({ name, hero, drivers, evidence, onOpenCarePlan, className }: DomainPaneProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-white/[.02] overflow-hidden",
        className
      )}
      aria-label={`${name} risk model`}
    >
      {/* Header + hero */}
      <header className="px-5 py-4 flex items-end justify-between gap-4 border-b border-border-subtle">
        <div>
          <div className="t-label mb-1">Risk Model</div>
          <h3 className="t-h3">{name}</h3>
        </div>
        <div className="text-right">
          <div className="t-caption mb-0.5">{hero.label}</div>
          <div className="flex items-baseline gap-2 justify-end">
            <span className="t-display leading-none text-text">{hero.value}</span>
            {hero.delta && (
              <span
                className={cn(
                  "t-ui",
                  hero.trend === "up" ? "text-status-crit" : hero.trend === "down" ? "text-status-ok" : "text-text-muted"
                )}
              >
                {hero.delta}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Drivers — ranked contributors */}
      <div className="px-5 py-4">
        <div className="t-label mb-3">Top Drivers</div>
        <ol className="space-y-2">
          {drivers.map((d, i) => (
            <li key={d.label} className="grid grid-cols-[24px_1fr_auto_auto] items-baseline gap-3">
              <span className="t-caption tabular-nums">{i + 1}.</span>
              <span className="t-ui text-text">{d.label}</span>
              <span className="t-mono text-text-secondary">{d.weight}</span>
              <span className="t-mono text-text w-16 text-right">{d.contribution}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Evidence + Care Plan link (not nested card) */}
      {(evidence || onOpenCarePlan) && (
        <footer className="px-5 py-3 border-t border-border-subtle flex items-center justify-between gap-4">
          {evidence && <div className="t-meta truncate">{evidence}</div>}
          {onOpenCarePlan && (
            <button
              onClick={onOpenCarePlan}
              className="t-ui text-accent-hover hover:text-accent-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover rounded-sm"
            >
              Care Plan →
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
