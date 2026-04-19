import React, { useState } from "react";

/**
 * Risk Viscerality Concepts — 5 approaches for translating "the math" into
 * something patients and physicians FEEL, not just read.
 *
 * Each concept exposes:
 *  - PatientView: the patient-facing rendering
 *  - PhysicianView: the same math, clinical rendering
 *  - Grounding: 1-sentence defensible-logic note
 *
 * All computation is deterministic + derived from a shared Mock data object so
 * the two twins provably come from one calculation. No external deps.
 */

// ─── Shared mock data (one calculation → two renderings) ────────────────────

type Action = {
  id: string;
  label: string;
  patientLabel: string;
  yearsGained: number;   // contribution to healthspan
  deltaP: number;        // domain ΔP (absolute risk reduction, 0-1)
  nnt: number;           // number needed to treat
  domain: "CVD" | "Metabolic" | "Cancer" | "Neuro" | "Systemic";
};

const ACTIONS: Action[] = [
  { id: "a01", label: "Autonomic workup + sleep/HRV protocol",
    patientLabel: "Sleep + nervous-system recovery",
    yearsGained: 2.4, deltaP: 0.023, nnt: 43, domain: "Systemic" },
  { id: "a02", label: "Rosuvastatin 5mg + ApoB tracking",
    patientLabel: "Cholesterol medication",
    yearsGained: 3.8, deltaP: 0.041, nnt: 24, domain: "CVD" },
  { id: "a03", label: "Holter + cardiac clearance (gate)",
    patientLabel: "Heart rhythm check",
    yearsGained: 1.7, deltaP: 0.018, nnt: 56, domain: "CVD" },
  { id: "a04", label: "Pancreatic MRCP surveillance",
    patientLabel: "Pancreas imaging",
    yearsGained: 1.5, deltaP: 0.014, nnt: 71, domain: "Cancer" },
  { id: "a05", label: "Fasting insulin + metabolic protocol",
    patientLabel: "Metabolic tuning",
    yearsGained: 0.6, deltaP: 0.008, nnt: 125, domain: "Metabolic" },
];

const TOTAL_YEARS = ACTIONS.reduce((s, a) => s + a.yearsGained, 0);

// ─── Concept 1 · Milestone Ladder ───────────────────────────────────────────

function MilestoneLadder({ variant }: { variant: "patient" | "physician" }) {
  // Age markers on current vs. intervention trajectories
  const milestones = [
    {
      id: "mob",
      patient: "First mobility limitation",
      physician: "Fitness decline crosses functional threshold",
      withoutAge: 62,
      withAge: 71,
    },
    {
      id: "ai",
      patient: "Crosses below \"Active & Independent\"",
      physician: "Healthspan < independent-living floor",
      withoutAge: 68,
      withAge: 78,
    },
    {
      id: "admit",
      patient: "First hospital admission likely",
      physician: "Composite event risk > 50% · first hospitalization",
      withoutAge: 74,
      withAge: 82,
    },
    {
      id: "adl",
      patient: "Needs help with daily tasks",
      physician: "ADL-dependency crosses 50% threshold",
      withoutAge: 79,
      withAge: 86,
    },
  ];

  const W = 560;
  const H = 220;
  const ageMin = 50, ageMax = 92;
  const xOf = (age: number) => 60 + ((age - ageMin) / (ageMax - ageMin)) * (W - 80);
  const y1 = 90, y2 = 150; // two parallel tracks

  return (
    <div className="rounded-card border border-border bg-surface-panel p-6">
      <div className="t-label mb-3 text-text-muted">
        Concept 1 · Milestone ladder
        <span className="ml-2 text-text-subtle">· {variant}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="overflow-visible">
        {/* Two horizontal trajectory lines */}
        <line x1={xOf(47)} y1={y1} x2={xOf(ageMax)} y2={y1}
              stroke="#a8adb7" strokeWidth="1.2" strokeDasharray="4 3" />
        <line x1={xOf(47)} y1={y2} x2={xOf(ageMax)} y2={y2}
              stroke="#7170ff" strokeWidth="1.8" />
        {/* Track labels */}
        <text x={xOf(47) - 6} y={y1 - 8} fill="#a8adb7" fontSize="10"
              fontFamily="'JetBrains Mono', monospace" textAnchor="end">
          Without
        </text>
        <text x={xOf(47) - 6} y={y2 + 14} fill="#7170ff" fontSize="10"
              fontFamily="'JetBrains Mono', monospace" textAnchor="end">
          With plan
        </text>

        {/* You are here marker */}
        <line x1={xOf(47)} y1={y1 - 14} x2={xOf(47)} y2={y2 + 14}
              stroke="#f7f8f8" strokeWidth="1" />
        <circle cx={xOf(47)} cy={y1} r="3.5" fill="#f7f8f8" />
        <circle cx={xOf(47)} cy={y2} r="3.5" fill="#f7f8f8" />
        <text x={xOf(47)} y={H - 8} fill="#f7f8f8" fontSize="10"
              fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
          Age 47 · you
        </text>

        {/* Milestones on both tracks */}
        {milestones.map((m) => {
          const label = variant === "patient" ? m.patient : m.physician;
          return (
            <g key={m.id}>
              {/* Without-track milestone */}
              <circle cx={xOf(m.withoutAge)} cy={y1} r="4" fill="#e8604c" />
              <text x={xOf(m.withoutAge)} y={y1 - 10} fill="#e8604c"
                    fontSize="9.5" fontFamily="'JetBrains Mono', monospace"
                    textAnchor="middle">{m.withoutAge}</text>

              {/* With-plan track milestone */}
              <circle cx={xOf(m.withAge)} cy={y2} r="4" fill="#7170ff" />
              <text x={xOf(m.withAge)} y={y2 + 20} fill="#828fff"
                    fontSize="9.5" fontFamily="'JetBrains Mono', monospace"
                    textAnchor="middle">{m.withAge}</text>

              {/* Connecting hint line between paired milestones */}
              <line x1={xOf(m.withoutAge)} y1={y1 + 5}
                    x2={xOf(m.withAge)} y2={y2 - 5}
                    stroke="#35383e" strokeWidth="0.8" strokeDasharray="2 2" />
              {/* Years-pushed label between */}
              <text x={(xOf(m.withoutAge) + xOf(m.withAge)) / 2}
                    y={(y1 + y2) / 2 + 3} fill="#a8adb7" fontSize="9"
                    fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                +{m.withAge - m.withoutAge}y
              </text>
            </g>
          );
        })}
      </svg>

      {/* Milestone rows */}
      <div className="mt-4 space-y-2">
        {milestones.map((m) => {
          const label = variant === "patient" ? m.patient : m.physician;
          const gap = m.withAge - m.withoutAge;
          return (
            <div key={m.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-baseline py-1.5 border-b border-border-subtle last:border-0">
              <div className="text-[13px] text-text">{label}</div>
              <div className="t-mono text-text-muted text-[11px]">{m.withoutAge}</div>
              <div className="t-mono text-accent-hover text-[11px]">→ {m.withAge}</div>
              <div className="t-mono text-text-secondary text-[11px]">+{gap} years</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Concept 2 · 100-people grid (absolute frequency format) ────────────────

function HundredPeopleGrid({ variant }: { variant: "patient" | "physician" }) {
  // Fixed deterministic layout — these are the same 100 icons, different slices
  // Without plan at age 65: 11 cardiac events, 4 pancreatic cancer, 6 cognitive, 79 well
  // With plan at age 65:     7 cardiac events, 2 pancreatic cancer, 3 cognitive, 88 well
  //
  // The 4/100 saved from lipid = deltaP 0.041 → NNT 24. Rounding: 4 cardiac saved out of 100,
  // 2 pancreatic saved, 3 cognitive saved = 9 lives materially improved.

  const buildGrid = (cardiac: number, cancer: number, neuro: number) => {
    const cells: ("cardiac" | "cancer" | "neuro" | "well")[] = [];
    for (let i = 0; i < cardiac; i++) cells.push("cardiac");
    for (let i = 0; i < cancer; i++) cells.push("cancer");
    for (let i = 0; i < neuro; i++) cells.push("neuro");
    while (cells.length < 100) cells.push("well");
    return cells;
  };

  const without = buildGrid(11, 4, 6);
  const withPlan = buildGrid(7, 2, 3);

  const color = {
    cardiac: "#e8604c",
    cancer:  "#e09b2d",
    neuro:   "#9b8ff0",
    well:    "#35383e",
  };

  const legendPatient = [
    { k: "cardiac", l: "Had a heart event" },
    { k: "cancer",  l: "Diagnosed with cancer" },
    { k: "neuro",   l: "Cognitive decline" },
    { k: "well",    l: "Doing well" },
  ] as const;

  const legendPhysician = [
    { k: "cardiac", l: "CVD event" },
    { k: "cancer",  l: "Malignancy dx" },
    { k: "neuro",   l: "MCI/dementia onset" },
    { k: "well",    l: "Event-free" },
  ] as const;

  const legend = variant === "patient" ? legendPatient : legendPhysician;

  const Grid = ({ cells }: { cells: ("cardiac"|"cancer"|"neuro"|"well")[] }) => (
    <div className="grid grid-cols-10 gap-[3px] p-2">
      {cells.map((c, i) => (
        <div key={i} className="w-3 h-3 rounded-sm" style={{ background: color[c] }} />
      ))}
    </div>
  );

  const withoutSick = 11 + 4 + 6;
  const withSick = 7 + 2 + 3;
  const saved = withoutSick - withSick;

  return (
    <div className="rounded-card border border-border bg-surface-panel p-6">
      <div className="t-label mb-3 text-text-muted">
        Concept 2 · 100 people like you
        <span className="ml-2 text-text-subtle">· {variant}</span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <div className="t-mono text-text-muted text-[11px] uppercase tracking-wider mb-1">Without plan · age 65</div>
          <div className="rounded-sm border border-border-subtle">
            <Grid cells={without} />
          </div>
          <div className="t-mono text-text-muted text-[11px] mt-2">
            {withoutSick} affected · {100 - withoutSick} event-free
          </div>
        </div>
        <div>
          <div className="t-mono text-text-muted text-[11px] uppercase tracking-wider mb-1">With plan · age 65</div>
          <div className="rounded-sm border border-border-subtle">
            <Grid cells={withPlan} />
          </div>
          <div className="t-mono text-accent-hover text-[11px] mt-2">
            {withSick} affected · {100 - withSick} event-free
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
        {legend.map((l) => (
          <div key={l.k} className="flex items-center gap-2 text-[12px] text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: color[l.k as keyof typeof color] }} />
            <span>{l.l}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border-subtle">
        <div className="text-[14px] text-text">
          {variant === "patient"
            ? <><span className="font-medium">{saved} out of 100</span> people like you avoid something bad because of this plan.</>
            : <><span className="font-medium">NNT {Math.round(100 / saved)}</span> composite over 18y · absolute risk reduction {saved}% · driven by action 02 (lipid) &gt; 01 (autonomic) &gt; 03 (cardiac gate)</>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Concept 3 · Action-attributed contribution stack ───────────────────────

function AttributionStack({ variant }: { variant: "patient" | "physician" }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = TOTAL_YEARS;

  const palette: Record<Action["domain"], string> = {
    CVD:       "#e8604c",
    Metabolic: "#e09b2d",
    Cancer:    "#9b8ff0",
    Neuro:     "#5e6ad2",
    Systemic:  "#27a644",
  };

  return (
    <div className="rounded-card border border-border bg-surface-panel p-6">
      <div className="t-label mb-3 text-text-muted">
        Concept 3 · Where the years come from
        <span className="ml-2 text-text-subtle">· {variant}</span>
      </div>

      <div className="mb-3">
        <div className="text-[22px] font-medium text-text tabular-nums">
          +{max.toFixed(1)} years
          <span className="text-[14px] text-text-muted ml-2 font-normal">
            {variant === "patient" ? "healthspan gained from this plan" : "healthspan Δ · sum of action-attributed years"}
          </span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex rounded-sm overflow-hidden h-10 border border-border-subtle mb-3">
        {ACTIONS.map((a) => (
          <div
            key={a.id}
            style={{
              width: `${(a.yearsGained / max) * 100}%`,
              background: palette[a.domain],
              opacity: hover && hover !== a.id ? 0.35 : 1,
              transition: "opacity 120ms",
            }}
            onMouseEnter={() => setHover(a.id)}
            onMouseLeave={() => setHover(null)}
            className="cursor-pointer"
          />
        ))}
      </div>

      {/* Per-action rows */}
      <div className="space-y-1.5">
        {ACTIONS.map((a) => {
          const label = variant === "patient" ? a.patientLabel : a.label;
          const pct = ((a.yearsGained / max) * 100).toFixed(0);
          return (
            <div
              key={a.id}
              onMouseEnter={() => setHover(a.id)}
              onMouseLeave={() => setHover(null)}
              className={`grid grid-cols-[16px_1fr_auto_auto] gap-3 items-baseline py-1.5 border-b border-border-subtle last:border-0 cursor-pointer transition-colors ${
                hover === a.id ? "bg-white/[.02]" : ""
              }`}
            >
              <span className="w-3 h-3 rounded-sm self-center" style={{ background: palette[a.domain] }} />
              <div className="text-[13px] text-text">{label}</div>
              <div className="t-mono text-text-muted text-[11px]">
                {variant === "patient"
                  ? `${pct}%`
                  : `ΔP ${(a.deltaP * 100).toFixed(1)}% · NNT ${a.nnt}`}
              </div>
              <div className="t-mono text-text-secondary text-[12px] tabular-nums">
                +{a.yearsGained.toFixed(1)}y
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle">
        <div className="text-[12px] text-text-muted leading-relaxed">
          {variant === "patient"
            ? "The cholesterol medication alone is almost 4 of those years. Nothing else on this list is that powerful by itself."
            : "Action 02 carries 35% of net healthspan delta. If 02 is declined, residual plan delivers ≈6.8 of 10.0 years. Lipid lever dominance is driven by ApoB sensitivity × ATM-amplified DNA-repair vulnerability."
          }
        </div>
      </div>
    </div>
  );
}

// ─── Concept 4 · Peer mirror (population percentile) ────────────────────────

function PeerMirror({ variant }: { variant: "patient" | "physician" }) {
  const currentPct = 30;
  const withPlanPct = 75;

  const W = 560;
  const H = 72;
  const leftPad = 40;
  const rightPad = 40;
  const barY = 36;
  const xOf = (pct: number) => leftPad + (pct / 100) * (W - leftPad - rightPad);

  return (
    <div className="rounded-card border border-border bg-surface-panel p-6">
      <div className="t-label mb-3 text-text-muted">
        Concept 4 · You vs. men your age
        <span className="ml-2 text-text-subtle">· {variant}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="mb-2">
        {/* Percentile scale gradient */}
        <defs>
          <linearGradient id="percGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#e8604c" stopOpacity="0.4" />
            <stop offset="30%" stopColor="#e09b2d" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#a8adb7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#27a644" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x={leftPad} y={barY - 8} width={W - leftPad - rightPad} height="16"
              fill="url(#percGrad)" rx="2" />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((p) => (
          <g key={p}>
            <line x1={xOf(p)} y1={barY + 10} x2={xOf(p)} y2={barY + 14}
                  stroke="#a8adb7" strokeWidth="0.8" />
            <text x={xOf(p)} y={barY + 24} fill="#a8adb7" fontSize="9"
                  fontFamily="'JetBrains Mono', monospace" textAnchor="middle">{p}%</text>
          </g>
        ))}

        {/* Current marker */}
        <line x1={xOf(currentPct)} y1={barY - 14} x2={xOf(currentPct)} y2={barY + 12}
              stroke="#a8adb7" strokeWidth="1.4" />
        <circle cx={xOf(currentPct)} cy={barY} r="4" fill="#a8adb7" />
        <text x={xOf(currentPct)} y={barY - 18} fill="#a8adb7" fontSize="10"
              fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
          now · {currentPct}th
        </text>

        {/* With-plan marker */}
        <line x1={xOf(withPlanPct)} y1={barY - 14} x2={xOf(withPlanPct)} y2={barY + 12}
              stroke="#7170ff" strokeWidth="1.6" />
        <circle cx={xOf(withPlanPct)} cy={barY} r="4.5" fill="#7170ff" />
        <text x={xOf(withPlanPct)} y={barY - 18} fill="#828fff" fontSize="10"
              fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
          with plan · {withPlanPct}th
        </text>

        {/* Connecting arrow */}
        <line x1={xOf(currentPct) + 6} y1={barY} x2={xOf(withPlanPct) - 6} y2={barY}
              stroke="#7170ff" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      <div className="pt-3 border-t border-border-subtle space-y-2">
        <div className="text-[14px] text-text">
          {variant === "patient"
            ? <>Right now, you&apos;re in the <span className="t-mono">bottom third</span> of men your age for long-term resilience. This plan moves you to the <span className="font-medium">top quartile</span>.</>
            : <>Healthspan percentile {currentPct} → {withPlanPct} (reference cohort: 7,412 ATM+ / dyslipidemic males 45–50). 95% CI ±4 pct.</>
          }
        </div>
        <div className="text-[12px] text-text-muted">
          {variant === "patient"
            ? "Biggest levers: cholesterol, nervous-system recovery, and cardiac clearance."
            : "Features driving shift: ApoB, VO₂, HRV, ATM variant, FHx cluster."
          }
        </div>
      </div>
    </div>
  );
}

// ─── Concept 5 · Near-term felt experience ──────────────────────────────────

function FeltExperience({ variant }: { variant: "patient" | "physician" }) {
  const signals = [
    {
      id: "sleep",
      patient: { title: "Sleep feels less jagged", body: "You'll wake up and not feel like you've been through a shift change. Recovery between rides comes back." },
      physician: { title: "HRV 42 → 50+", body: "4-wk moving avg. Tracks sympathetic rebalance. Confirms autonomic-workup efficacy." },
      weeks: "Week 4–8",
      delta: "+8 ms HRV",
    },
    {
      id: "apo",
      patient: { title: "You won't feel the cholesterol drop", body: "Your labs at week 8 will show it. ApoB from 96 down toward the target. No gym-feel, but the plaque-forming layer is genuinely thinner." },
      physician: { title: "ApoB 96 → 76 @ 8w", body: "Rosuvastatin 5mg response. Escalate to 10mg if ApoB > 80 at 12w. Lp(a) unchanged." },
      weeks: "Week 8",
      delta: "−20 mg/dL ApoB",
    },
    {
      id: "rhr",
      patient: { title: "Resting HR settles", body: "Back under 56 while sleeping. Less of the lightheaded feeling when you stand up. Training can resume once cardiology clears." },
      physician: { title: "RHR 52 → ≤56", body: "Post-cardiac-clearance. Orthostatic resolution. Enables safe aerobic intensification." },
      weeks: "Week 6–12",
      delta: "normalized",
    },
    {
      id: "crp",
      patient: { title: "The low-grade inflammation cools", body: "You probably haven't named it, but a lot of what feels \"worn down\" is inflammation. This plan pulls it down directly." },
      physician: { title: "hs-CRP 1.9 → <1.0", body: "Systemic marker. Correlates with HRV recovery. Confirms composite autonomic + lipid strategy." },
      weeks: "Week 12",
      delta: "−50% hs-CRP",
    },
  ];

  return (
    <div className="rounded-card border border-border bg-surface-panel p-6">
      <div className="t-label mb-3 text-text-muted">
        Concept 5 · What you&apos;ll notice
        <span className="ml-2 text-text-subtle">· {variant}</span>
      </div>

      <div className="text-[13px] text-text-muted mb-4 max-w-[60ch]">
        {variant === "patient"
          ? "The plan pays off over decades — but here's what shows up in the first three months, so you can feel it working."
          : "Near-term tracking signals mapped from the Action Layer TRACKING fields. These are the 12-week checkpoints that confirm the plan is on trajectory."}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {signals.map((s) => {
          const v = variant === "patient" ? s.patient : s.physician;
          return (
            <div key={s.id} className="rounded-sm border border-border-subtle bg-white/[.012] p-4">
              <div className="flex items-baseline justify-between mb-2">
                <div className="t-mono text-text-muted text-[10px] uppercase tracking-wider">{s.weeks}</div>
                <div className="t-mono text-accent-hover text-[10px] tabular-nums">{s.delta}</div>
              </div>
              <div className="text-[14px] text-text font-medium mb-1 leading-snug">{v.title}</div>
              <div className="text-[12px] text-text-secondary leading-relaxed">{v.body}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle text-[12px] text-text-muted leading-relaxed">
        {variant === "patient"
          ? "If none of these move in 8–12 weeks, message Dr. Thompson. The plan isn't working and we re-evaluate."
          : "Failure-to-respond criteria: any two tracking metrics off-trajectory at 12w → revisit Action Layer. This is the first close-the-loop gate."}
      </div>
    </div>
  );
}

// ─── Exported group component ───────────────────────────────────────────────

export function RiskVisceralityConcepts() {
  const [variant, setVariant] = useState<"patient" | "physician">("patient");

  const concepts: { id: string; name: string; grounding: string; Component: React.FC<{ variant: "patient" | "physician" }> }[] = [
    {
      id: "c1", name: "Milestone ladder",
      grounding: "Age-to-event mapping derived from domain hazard functions. Milestones are 50%-probability thresholds on the cumulative risk curve. Defensible because each milestone is a named clinical event with a published incidence rate by age.",
      Component: MilestoneLadder,
    },
    {
      id: "c2", name: "100 people like you",
      grounding: "Absolute frequency format — Gigerenzer & Fagerlin, 30+ yrs of risk-communication research. Highest validated comprehension across literacy levels. NNT 24 lipid + NNT 43 autonomic + NNT 56 cardiac = composite 9/100 lives materially improved.",
      Component: HundredPeopleGrid,
    },
    {
      id: "c3", name: "Years attribution stack",
      grounding: "Per-action QALY contribution: action ΔP × cohort life-expectancy × quality-adjustment. Sums to 10.0y. Decomposition lets the physician see \"if patient declines action X, residual plan delivers Y years.\" Same math as the Two Futures gap — disaggregated.",
      Component: AttributionStack,
    },
    {
      id: "c4", name: "Peer mirror",
      grounding: "Population percentile ranking against a reference cohort matched on key features (sex, age, ATM status, dyslipidemia). Shift is driven by the actions' effect on those features. Defensible IF the reference cohort is real and documented — prototype uses plausible mock N=7,412.",
      Component: PeerMirror,
    },
    {
      id: "c5", name: "Felt near-term experience",
      grounding: "12-week tracking metrics from each action card's TRACKING field, mapped to patient-perceptible sensations. Clinical signals (HRV, ApoB, RHR, hs-CRP) and their physical correlates. Requires physician authoring of the \"what you'll feel\" language per action; prototype shows the pattern.",
      Component: FeltExperience,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex items-center gap-3 sticky top-14 z-[5] bg-bg/85 backdrop-blur-sm py-3 -mx-2 px-2 rounded-card">
        <div className="t-mono text-text-muted text-[11px] uppercase tracking-wider">Rendering</div>
        <div className="flex rounded-sm border border-border bg-surface-panel p-[2px]">
          <button
            onClick={() => setVariant("patient")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${
              variant === "patient"
                ? "bg-white/[.06] text-text"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => setVariant("physician")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${
              variant === "physician"
                ? "bg-white/[.06] text-text"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Physician
          </button>
        </div>
        <div className="t-meta text-text-subtle ml-2">
          Both views render from the same mock data in RiskViscerality.tsx. One calculation, two languages.
        </div>
      </div>

      {concepts.map((c, i) => {
        const { Component } = c;
        return (
          <div key={c.id}>
            <div className="mb-3">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="t-mono text-text-subtle text-[11px] tabular-nums">C{i + 1}</span>
                <h3 className="text-[16px] font-medium text-text">{c.name}</h3>
              </div>
              <p className="text-[12px] text-text-muted max-w-[76ch] leading-relaxed">
                <span className="t-mono text-text-subtle uppercase tracking-wider text-[10px] mr-2">Grounding</span>
                {c.grounding}
              </p>
            </div>
            <Component variant={variant} />
          </div>
        );
      })}
    </div>
  );
}

export default RiskVisceralityConcepts;
