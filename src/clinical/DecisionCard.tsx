import * as React from "react";
import { cn } from "../lib/cn";

/**
 * DecisionCard — canonical Meridian Care Plan action card.
 *
 * Encodes the DO / WHY / GOAL three-row pattern from:
 *   - skill: meridian-care-plan-shape
 *   - skill: answer-shaped-hierarchy-over-field-templates
 *   - DESIGN_SYSTEM.md §3.2 "Card content structure — the three-row pattern"
 *
 * Hard rules enforced by the component API:
 *   1. Exactly three content rows (Do / Why / Goal). No 4th, no 6th.
 *      The SOAP field template (Pattern/Mechanism/Intervention/Tracking-metric)
 *      is banned — see tokens.json › banned_patterns › soap-field-template.
 *   2. Labels sit in a fixed-width left column, deliberately quieter than values.
 *      This is the ONE place uppercase-tracked-muted-12px is permitted, because
 *      the value in the right column dominates (anti-inversion still holds).
 *   3. Evidence/citations are a single-line footer, never a row.
 *      Promoted evidence is "muting content to fit more" — see §3.0 "cut, don't mute".
 *
 * For compositional flexibility (alerts, recommendations), you may override
 * the row labels via props, but the SHAPE stays fixed at three.
 */

export interface DecisionCardProps {
  /** Verb / prescription. The action being taken. e.g. "Atorvastatin 20 mg qHS" */
  do: string;
  /** One-sentence rationale. Not a paragraph. */
  why: string;
  /** Quantified target. Use units. e.g. "ApoB < 90 mg/dL by Oct 2026" */
  goal: string;
  /** Section identifier / kicker (optional meta above the card, NOT a header). */
  kicker?: string;
  /** Single-line evidence footer. Keep to ≤80 chars. */
  evidence?: string;
  /** Optional override labels. Default: DO / WHY / GOAL. Keep them 2–4 chars. */
  labels?: { do?: string; why?: string; goal?: string };
  /** Optional node rendered on the right of the evidence footer (e.g. an Ask trigger). */
  evidenceAction?: React.ReactNode;
  className?: string;
  /** Optional status tone — applies a subtle left border marker only. */
  tone?: "default" | "urgent";
}

export function DecisionCard({
  do: doValue,
  why,
  goal,
  kicker,
  evidence,
  labels = {},
  tone = "default",
  evidenceAction,
  className,
}: DecisionCardProps) {
  const L = { do: labels.do ?? "Do", why: labels.why ?? "Why", goal: labels.goal ?? "Goal" };

  return (
    <article
      className={cn(
        "bg-white/[.02] border border-border rounded-card overflow-hidden",
        tone === "urgent" && "border-l-2 border-l-status-crit",
        className
      )}
    >
      {kicker && <div className="t-meta px-4 pt-3">{kicker}</div>}

      <div className="px-4 py-3 space-y-2.5">
        <Row label={L.do}>
          <span className="text-[15px] leading-snug font-ui text-text">{doValue}</span>
        </Row>
        <Row label={L.why}>
          <span className="text-ui text-text-secondary">{why}</span>
        </Row>
        <Row label={L.goal}>
          <span className="t-mono text-text">{goal}</span>
        </Row>
      </div>

      {evidence && (
        <footer className="px-4 py-2 border-t border-border-subtle flex items-center justify-between gap-3">
          <div className="t-meta truncate min-w-0" title={evidence}>
            {evidence}
          </div>
          {evidenceAction && <div className="flex-shrink-0">{evidenceAction}</div>}
        </footer>
      )}
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-3 items-baseline">
      <span className="t-label">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
