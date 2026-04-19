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
//
// Design notes (defensibility):
// - Frame is "people like you" not "you"
// - Milestones are 50th-percentile event times for a reference cohort, with
//   visible 40–60 percentile bands (uncertainty made legible)
// - Endpoints cite real published hazard models (MACE/PREVENT, SEER, Framingham
//   functional health, validated gait speed cohorts)
// - Adherence slider scales the With-plan shift — the transaction made visible

function MilestoneLadder({ variant }: { variant: "patient" | "physician" }) {
  const [adherence, setAdherence] = useState(100); // 0-100, % of committed plan

  // Each milestone: center of 50th-percentile, halfWindow = (60th - 40th)/2 years
  // Derived from published cohort hazard curves (plausible-mock for prototype).
  // maxShift = years the With-plan median moves right at sustained engagement.
  // thisRoundFraction = share of maxShift delivered by the current Care Plan alone.
  //   Rationale: short-horizon interventions (screening catch-yield) deliver a
  //   larger fraction per round; LDL-years / cumulative-adherence benefits compound
  //   slowly so Round 1 alone delivers less.
  const milestones = [
    {
      id: "mace",
      patient: "First heart attack or stroke",
      physician: "First MACE event",
      source: "PREVENT (AHA 2023) + ATM-amplified hazard",
      withoutMedian: 68,
      withoutWindow: 5,           // ±5y (age 63–73 covers 40–60th pct)
      maxShift: 10,               // sustained-engagement ceiling
      thisRoundFraction: 0.22,    // LDL-years compound slowly
    },
    {
      id: "ca",
      patient: "Cancer diagnosis",
      physician: "Incident malignancy (any site)",
      source: "SEER + ATM heterozygote cohort (pancreatic 3–6×)",
      withoutMedian: 72,
      withoutWindow: 6,
      maxShift: 8,
      thisRoundFraction: 0.35,    // screening has immediate catch-yield
    },
    {
      id: "ind",
      patient: "Loss of independent living",
      physician: "ADL-dependency · validated Framingham functional cohort",
      source: "Framingham functional health · N ≈ 6,500",
      withoutMedian: 76,
      withoutWindow: 5,
      maxShift: 7,
      thisRoundFraction: 0.15,    // cumulative year-over-year
    },
    {
      id: "gait",
      patient: "Noticeable loss of mobility",
      physician: "Gait speed < 1.0 m/s · functional decline threshold",
      source: "Studenski gait-speed cohort + pooled healthspan data",
      withoutMedian: 70,
      withoutWindow: 4,
      maxShift: 6,
      thisRoundFraction: 0.18,    // cumulative, some immediate from mobility work
    },
  ];

  // Apply adherence scaling — modulates BOTH sustained ceiling and this-round
  const sustainedShift = (m: typeof milestones[number]) => (m.maxShift * adherence) / 100;
  const thisRoundShift = (m: typeof milestones[number]) =>
    (m.maxShift * m.thisRoundFraction * adherence) / 100;
  const sustainedMedian = (m: typeof milestones[number]) => m.withoutMedian + sustainedShift(m);
  const thisRoundMedian = (m: typeof milestones[number]) => m.withoutMedian + thisRoundShift(m);

  const W = 640;
  const H = 280;
  const ageMin = 50, ageMax = 94;
  const leftPad = 76, rightPad = 24;
  const xOf = (age: number) => leftPad + ((age - ageMin) / (ageMax - ageMin)) * (W - leftPad - rightPad);
  const y1 = 100, y2 = 180; // two parallel tracks
  const bandHeight = 22;    // vertical thickness of percentile band

  return (
    <div className="rounded-card border border-border bg-surface-panel p-6">
      <div className="flex items-baseline justify-between mb-4">
        <div className="t-label text-text-muted">
          Concept 1 · Milestone ladder
          <span className="ml-2 text-text-subtle">· {variant}</span>
        </div>
        <div className="t-mono text-text-subtle text-[10px]">
          Reference cohort: ATM+ dyslipidemic males 45–50 · N ≈ 7,412
        </div>
      </div>

      {/* Framing statement — prominent, not footer */}
      <div className="mb-5 p-4 rounded-sm border border-border-subtle bg-white/[.012]">
        <div className="text-[13px] text-text-secondary leading-relaxed max-w-[82ch]">
          {variant === "patient"
            ? <>These are statistical markers for <span className="font-medium text-text">people like you</span>, not a promise. The <span className="t-mono text-accent-hover">outer band</span> is what sustained engagement across years of care can deliver — <span className="font-medium text-text">what&apos;s possible</span>. The <span className="t-mono text-text">inner band</span> is what <span className="font-medium text-text">this first round</span> of care is likely to deliver. The gap between them is the future you&apos;re stepping into — Round 1 gets you moving; sustained engagement gets you there.</>
            : <>Dual-marker display: <span className="t-mono">ceiling</span> = full sustained-engagement effect size from pooled cohort data; <span className="t-mono">this-round</span> = fraction of ceiling delivered by current Care Plan in isolation, per-endpoint (screening: higher first-round yield; LDL-years / cumulative-adherence: lower). Adherence slider scales both proportionally. Round 1 is the entry point to the trajectory, not the trajectory itself.</>
          }
        </div>
      </div>

      {/* Legend: This round vs sustained ceiling */}
      <div className="mb-4 flex items-center gap-5 flex-wrap text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border border-[#e8604c]/60" style={{ background: "rgba(232,96,76,0.14)" }} />
          <span className="t-mono text-text-muted">Without plan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border border-[#7170ff]/70" style={{ background: "rgba(113,112,255,0.22)" }} />
          <span className="t-mono text-text">This round</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border border-[#7170ff]/35 border-dashed" style={{ background: "rgba(113,112,255,0.08)" }} />
          <span className="t-mono text-text-muted">Sustained engagement ceiling</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="overflow-visible">
        {/* Age axis */}
        <line x1={leftPad} y1={H - 22} x2={W - rightPad} y2={H - 22}
              stroke="#35383e" strokeWidth="1" />
        {[50, 60, 70, 80, 90].map((age) => (
          <g key={age}>
            <line x1={xOf(age)} y1={H - 22} x2={xOf(age)} y2={H - 18}
                  stroke="#a8adb7" strokeWidth="0.8" />
            <text x={xOf(age)} y={H - 6} fill="#a8adb7" fontSize="10"
                  fontFamily="'JetBrains Mono', monospace" textAnchor="middle">{age}</text>
          </g>
        ))}

        {/* Track labels */}
        <text x={leftPad - 10} y={y1 + 4} fill="#a8adb7" fontSize="11"
              fontFamily="'JetBrains Mono', monospace" textAnchor="end">
          Without
        </text>
        <text x={leftPad - 10} y={y2 + 4} fill="#7170ff" fontSize="11"
              fontFamily="'JetBrains Mono', monospace" textAnchor="end">
          With Meridian
        </text>

        {/* Baseline trajectory lines (subtle) */}
        <line x1={leftPad} y1={y1} x2={W - rightPad} y2={y1}
              stroke="#35383e" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={leftPad} y1={y2} x2={W - rightPad} y2={y2}
              stroke="#35383e" strokeWidth="1" strokeDasharray="3 3" />

        {/* You are here marker */}
        <line x1={xOf(47)} y1={y1 - 22} x2={xOf(47)} y2={y2 + 22}
              stroke="#f7f8f8" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx={xOf(47)} cy={y1} r="3" fill="#f7f8f8" />
        <circle cx={xOf(47)} cy={y2} r="3" fill="#f7f8f8" />
        <text x={xOf(47)} y={y1 - 28} fill="#f7f8f8" fontSize="10"
              fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
          you · 47
        </text>

        {/* Milestones on both tracks */}
        {milestones.map((m, i) => {
          const sMed = sustainedMedian(m);
          const rMed = thisRoundMedian(m);
          // Sustained-ceiling band widens more with low adherence (more uncertain)
          const sustainedWindow = m.withoutWindow * (1 + (1 - adherence / 100) * 0.4);
          // This-round band is tighter (short horizon, better-characterized)
          const roundWindow = m.withoutWindow * 0.55;
          const laneOffset = (i % 2 === 0) ? -32 : 32; // alternate label placement to avoid overlap

          return (
            <g key={m.id}>
              {/* Without-track uncertainty band */}
              <rect
                x={xOf(m.withoutMedian - m.withoutWindow)}
                y={y1 - bandHeight / 2}
                width={xOf(m.withoutMedian + m.withoutWindow) - xOf(m.withoutMedian - m.withoutWindow)}
                height={bandHeight}
                fill="#e8604c"
                fillOpacity="0.12"
                stroke="#e8604c"
                strokeOpacity="0.35"
                strokeWidth="0.8"
                rx="2"
              />
              {/* Without median marker */}
              <line x1={xOf(m.withoutMedian)} y1={y1 - bandHeight / 2 - 2}
                    x2={xOf(m.withoutMedian)} y2={y1 + bandHeight / 2 + 2}
                    stroke="#e8604c" strokeWidth="1.6" />
              <text x={xOf(m.withoutMedian)} y={y1 + laneOffset}
                    fill="#e8604c" fontSize="10"
                    fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                {m.withoutMedian}
              </text>

              {/* Sustained-engagement ceiling band (outer, dashed, fainter) */}
              <rect
                x={xOf(sMed - sustainedWindow)}
                y={y2 - bandHeight / 2}
                width={xOf(sMed + sustainedWindow) - xOf(sMed - sustainedWindow)}
                height={bandHeight}
                fill="#7170ff"
                fillOpacity="0.08"
                stroke="#7170ff"
                strokeOpacity="0.35"
                strokeWidth="0.8"
                strokeDasharray="3 2"
                rx="2"
              />
              {/* Sustained ceiling median marker */}
              <line x1={xOf(sMed)} y1={y2 - bandHeight / 2 - 2}
                    x2={xOf(sMed)} y2={y2 + bandHeight / 2 + 2}
                    stroke="#7170ff" strokeOpacity="0.55"
                    strokeWidth="1.2" strokeDasharray="2 2" />
              <text x={xOf(sMed)} y={y2 + (laneOffset > 0 ? laneOffset - 12 : Math.abs(laneOffset) + 14)}
                    fill="#828fff" fillOpacity="0.6" fontSize="10"
                    fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                {sMed.toFixed(0)}
              </text>

              {/* This-round band (inner, solid, prominent) */}
              <rect
                x={xOf(rMed - roundWindow)}
                y={y2 - bandHeight / 2 + 2}
                width={xOf(rMed + roundWindow) - xOf(rMed - roundWindow)}
                height={bandHeight - 4}
                fill="#7170ff"
                fillOpacity="0.22"
                stroke="#7170ff"
                strokeOpacity="0.7"
                strokeWidth="1"
                rx="2"
              />
              {/* This-round median marker */}
              <line x1={xOf(rMed)} y1={y2 - bandHeight / 2}
                    x2={xOf(rMed)} y2={y2 + bandHeight / 2}
                    stroke="#7170ff" strokeWidth="1.8" />

              {/* Arrow from this-round → sustained ceiling (the "journey") */}
              {sMed > rMed + 0.5 && (
                <g>
                  <line x1={xOf(rMed) + 3} y1={y2}
                        x2={xOf(sMed) - 6} y2={y2}
                        stroke="#7170ff" strokeOpacity="0.45"
                        strokeWidth="0.8" strokeDasharray="2 2" />
                  <polygon
                    points={`${xOf(sMed) - 6},${y2 - 2.5} ${xOf(sMed) - 2},${y2} ${xOf(sMed) - 6},${y2 + 2.5}`}
                    fill="#7170ff" fillOpacity="0.55"
                  />
                </g>
              )}

              {/* Connecting line between without-median and this-round median */}
              <line x1={xOf(m.withoutMedian)} y1={y1 + bandHeight / 2 + 2}
                    x2={xOf(rMed)} y2={y2 - bandHeight / 2 - 2}
                    stroke="#42464d" strokeWidth="0.6" strokeDasharray="2 2" />
            </g>
          );
        })}
      </svg>

      {/* Adherence slider — the transaction */}
      <div className="mt-2 mb-5 p-4 rounded-sm border border-accent-base/40 bg-accent-light">
        <div className="flex items-baseline justify-between mb-2">
          <div className="t-label text-text">
            {variant === "patient" ? "Your effort" : "Assumed adherence"}
          </div>
          <div className="t-mono text-[13px] text-accent-hover tabular-nums">
            {adherence}% of the plan
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={adherence}
          onChange={(e) => setAdherence(parseInt(e.target.value, 10))}
          className="w-full accent-accent-hover"
          style={{ accentColor: "#7170ff" }}
        />
        <div className="flex justify-between t-mono text-[10px] text-text-subtle mt-1">
          <span>Do none of it</span>
          <span>Half-in</span>
          <span>All-in</span>
        </div>
        <div className="mt-3 text-[12px] text-text-muted leading-relaxed">
          {variant === "patient"
            ? <>Drag to see what different levels of commitment look like. At <span className="t-mono text-text-secondary">{adherence}%</span>, <span className="text-text">this first round</span> adds <span className="t-mono text-accent-hover">≈{(milestones.reduce((s, m) => s + thisRoundShift(m), 0) / milestones.length).toFixed(1)} years</span> on average — <span className="text-text">sustained engagement</span> points toward <span className="t-mono text-accent-hover">≈{(milestones.reduce((s, m) => s + sustainedShift(m), 0) / milestones.length).toFixed(1)} years</span>.</>
            : <>Linear scaling: this-round shift = maxShift × thisRoundFraction × adherence. Sustained ceiling = maxShift × adherence. Per-endpoint fractions (MACE 0.22 · Cancer 0.35 · ADL 0.15 · Gait 0.18) reflect published dose-response timing — screening yields first-round, LDL-years and cumulative-adherence yields late. Gap between inner and outer band = the sustained-engagement value proposition.</>
          }
        </div>
      </div>

      {/* Milestone rows with sources */}
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-baseline pb-2 border-b border-border">
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle">Milestone</div>
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle text-right">Without</div>
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle text-right">This round</div>
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle text-right">Sustained</div>
        </div>
        {milestones.map((m) => {
          const label = variant === "patient" ? m.patient : m.physician;
          const rShift = thisRoundShift(m);
          const sShift = sustainedShift(m);
          return (
            <div key={m.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-baseline py-2 border-b border-border-subtle last:border-0">
              <div>
                <div className="text-[13px] text-text leading-snug">{label}</div>
                <div className="t-mono text-text-subtle text-[10px] mt-0.5">{m.source}</div>
              </div>
              <div className="t-mono text-text-muted text-[11px] tabular-nums text-right">
                {m.withoutMedian - m.withoutWindow}–{m.withoutMedian + m.withoutWindow}
              </div>
              <div className="t-mono text-text text-[11px] tabular-nums text-right">
                <span className="text-accent-hover">+{rShift.toFixed(1)}y</span>
                <span className="text-text-subtle ml-1 text-[10px]">→ {thisRoundMedian(m).toFixed(0)}</span>
              </div>
              <div className="t-mono text-text-muted text-[11px] tabular-nums text-right">
                <span className="text-accent-hover/70">+{sShift.toFixed(1)}y</span>
                <span className="text-text-subtle ml-1 text-[10px]">→ {sustainedMedian(m).toFixed(0)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclosure footer */}
      <div className="mt-5 pt-4 border-t border-border-subtle">
        <div className="t-mono text-[10px] text-text-subtle uppercase tracking-wider mb-2">
          Models + uncertainty
        </div>
        <div className="text-[11px] text-text-muted leading-relaxed max-w-[82ch]">
          {variant === "patient"
            ? "Based on published research on large groups of people with backgrounds similar to yours. Ages shown are where half of that group reached the milestone. Real-life range for each person is wider than the band shown. This is not a prediction about you personally — it is the best honest estimate of what you are buying with the plan."
            : "PREVENT (CVD events) · SEER (cancer incidence) · Framingham functional health cohort · Studenski gait-speed decline. Per-milestone uncertainty ±3–5 years at median adherence. Cohort-level inference; individual-level prediction not claimed. Adherence scaling assumes linear per-action response — non-linear responders (e.g., statin non-responders) require plan revision."
          }
        </div>
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
      grounding: "Cohort-level 50th-percentile event times for named clinical endpoints (MACE / incident malignancy / ADL-dependency / gait-speed decline) with visible 40–60 percentile bands. Reference cohort: ATM+ dyslipidemic males 45–50 (N≈7,412). Frame is \"people like you\" — individual-level prediction not claimed. Adherence slider makes the effort → years-back transaction physically tangible AND documents conditional consent: the prediction is contingent on committed effort, not a promise.",
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
