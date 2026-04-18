import * as React from "react";
import { DecisionCard } from "../clinical/DecisionCard";
import { ReorderableList } from "../primitives/ReorderableCard";
import { patient } from "./data";

export function CarePlan() {
  const [actions, setActions] = React.useState(patient.actions);

  const reorder = (from: number, to: number) => {
    setActions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const items = actions.map((a, i) => {
    // Meta = severity · time-to-action (triage shape)
    const severity = a.tone === "urgent" ? "High" : "Moderate";
    const timing = a.tone === "urgent" ? "30 d" : "next visit";
    return {
      id: `action-${i}-${a.do.slice(0, 20)}`,
      title: a.do,
      meta: [severity, timing],
      body: (
        <DecisionCard
          do={a.do}
          why={a.why}
          goal={a.goal}
          evidence={a.evidence}
          tone={a.tone}
          className="!rounded-none !border-0"
        />
      ),
    };
  });

  return (
    <div>
      <div className="mb-4">
        <div className="t-label mb-1">Care Plan</div>
        <p className="t-body max-w-[60ch]">
          {actions.length} active actions. Drag to reorder by priority. Prioritized by 12-month preventable risk delta.
        </p>
      </div>
      <ReorderableList
        items={items}
        onReorder={reorder}
        ariaLabel="Care plan actions, drag to reorder"
      />
    </div>
  );
}
