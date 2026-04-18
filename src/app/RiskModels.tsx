import { DomainPane } from "../clinical/DomainPane";
import { patient } from "./data";

export function RiskModels() {
  const r = patient.risk;
  return (
    <div className="space-y-6">
      <SummaryStrip />
      <div className="grid grid-cols-2 gap-4">
        <DomainPane
          name="Cardiovascular"
          hero={{ value: r.cv.value, label: r.cv.label, delta: r.cv.delta, trend: r.cv.trend }}
          drivers={r.cv.drivers}
          evidence={r.cv.evidence}
        />
        <DomainPane
          name="Metabolic"
          hero={{ value: r.metabolic.value, label: r.metabolic.label, delta: r.metabolic.delta, trend: r.metabolic.trend }}
          drivers={r.metabolic.drivers}
          evidence={r.metabolic.evidence}
        />
        <DomainPane
          name="Renal"
          hero={{ value: r.ckd.value, label: r.ckd.label, delta: r.ckd.delta, trend: r.ckd.trend }}
          drivers={r.ckd.drivers}
          evidence={r.ckd.evidence}
        />
        <DomainPane
          name="Neurocognitive"
          hero={{ value: r.neuro.value, label: r.neuro.label, delta: r.neuro.delta, trend: r.neuro.trend }}
          drivers={r.neuro.drivers}
          evidence={r.neuro.evidence}
        />
      </div>
    </div>
  );
}

function SummaryStrip() {
  const r = patient.risk;
  const cells = [
    { name: "Cardiovascular",  v: r.cv.value,        delta: r.cv.delta,        trend: r.cv.trend },
    { name: "Metabolic",        v: r.metabolic.value, delta: r.metabolic.delta, trend: r.metabolic.trend },
    { name: "Renal",            v: r.ckd.value,       delta: r.ckd.delta,       trend: r.ckd.trend },
    { name: "Neurocognitive",   v: r.neuro.value,     delta: r.neuro.delta,     trend: r.neuro.trend },
  ];
  return (
    <section className="rounded-card bg-bg-panel border border-border-subtle p-4">
      <div className="t-label mb-3">Risk summary · 4 domains</div>
      <div className="grid grid-cols-4 gap-6">
        {cells.map((c) => (
          <div key={c.name} className="min-w-0">
            <div className="t-caption truncate">{c.name}</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="t-h2 text-text">{c.v}</span>
              <span className={
                (c.trend as string) === "up" ? "t-ui text-status-crit"
                : (c.trend as string) === "down" ? "t-ui text-status-ok"
                : "t-ui text-text-muted"
              }>{c.delta}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
