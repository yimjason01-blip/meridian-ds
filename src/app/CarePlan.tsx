import { DecisionCard } from "../clinical/DecisionCard";
import { patient } from "./data";

export function CarePlan() {
  return (
    <div className="space-y-3">
      <div className="mb-4">
        <div className="t-label mb-1">Care Plan</div>
        <p className="t-body max-w-[60ch]">
          {patient.actions.length} active actions. Prioritized by 12-month preventable risk delta.
        </p>
      </div>
      {patient.actions.map((a, i) => (
        <DecisionCard
          key={i}
          kicker={a.kicker}
          tone={a.tone}
          do={a.do}
          why={a.why}
          goal={a.goal}
          evidence={a.evidence}
        />
      ))}
    </div>
  );
}
