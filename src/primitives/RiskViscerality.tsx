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
  // Slider encodes the two-stage journey:
  //   0–50%   = Fundamentals (meds, screening, sleep, basic movement)
  //   50–100% = Optimization (biomarker tuning, precision dosing, advanced recovery)
  // fundamentalsFrac = portion of maxShift delivered by fundamentals alone.
  // Rationale: published intervention literature shows ~65% of achievable
  // risk-reduction comes from basic medication + screening + lifestyle floor;
  // the remaining ~35% requires sustained optimization.
  const FUNDAMENTALS_FRAC = 0.65;

  const [progress, setProgress] = useState(50); // 0-100

  const milestones = [
    {
      id: "mace",
      patient: "First heart attack or stroke",
      physician: "First MACE event",
      source: "PREVENT (AHA 2023) + ATM-amplified hazard",
      withoutMedian: 68,
      withoutWindow: 5,
      maxShift: 10,
      color: "#e8604c",           // cardiac — orange-red
    },
    {
      id: "ca",
      patient: "Cancer diagnosis",
      physician: "Incident malignancy (any site)",
      source: "SEER + ATM heterozygote cohort (pancreatic 3–6×)",
      withoutMedian: 72,
      withoutWindow: 6,
      maxShift: 8,
      color: "#d14a6a",           // cancer — deep red/pink
    },
    {
      id: "ind",
      patient: "Loss of independent living",
      physician: "ADL-dependency · validated Framingham functional cohort",
      source: "Framingham functional health · N ≈ 6,500",
      withoutMedian: 76,
      withoutWindow: 5,
      maxShift: 7,
      color: "#e09b2d",           // functional — amber
    },
    {
      id: "gait",
      patient: "Noticeable loss of mobility",
      physician: "Gait speed < 1.0 m/s · functional decline threshold",
      source: "Studenski gait-speed cohort + pooled healthspan data",
      withoutMedian: 70,
      withoutWindow: 4,
      maxShift: 6,
      color: "#6db1c9",           // motor — teal-blue
    },
  ];

  // Two-stage scaling:
  //   0-50 maps linearly to 0 → FUNDAMENTALS_FRAC of maxShift
  //   50-100 maps linearly to FUNDAMENTALS_FRAC → 1.0 of maxShift
  const scaleFactor = (p: number) => {
    if (p <= 50) return (p / 50) * FUNDAMENTALS_FRAC;
    return FUNDAMENTALS_FRAC + ((p - 50) / 50) * (1 - FUNDAMENTALS_FRAC);
  };
  const currentScale = scaleFactor(progress);
  const shift = (m: typeof milestones[number]) => m.maxShift * currentScale;
  const withMedian = (m: typeof milestones[number]) => m.withoutMedian + shift(m);

  const stageLabel =
    progress === 0 ? "No plan" :
    progress < 50 ? "Fundamentals · in progress" :
    progress === 50 ? "Fundamentals · complete" :
    progress < 100 ? "Optimization · in progress" :
    "Optimization · complete";

  const W = 640;
  const H = 340;
  const ageMin = 50, ageMax = 94;
  const leftPad = 76, rightPad = 24;
  const xOf = (age: number) => leftPad + ((age - ageMin) / (ageMax - ageMin)) * (W - leftPad - rightPad);
  const y1 = 110, y2 = 230;        // two parallel tracks — 120px gap
  const laneSpacing = 14;           // vertical spacing between milestone lanes within a track
  const bandHeight = 10;            // vertical thickness of percentile band
  // Centers at -21, -7, +7, +21 (spacing 14); band edges ±5 → clean 4px gaps
  const laneYOffset = (i: number) => (i - 1.5) * laneSpacing;

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
            ? <>These are statistical markers for <span className="font-medium text-text">people like you</span>, not a promise. The journey has two stages: <span className="font-medium text-text">Fundamentals</span> gets you most of the way — meds, screening, sleep, movement. <span className="font-medium text-text">Optimization</span> adds further gains that some patients achieve with sustained precision care. Drag the slider through both stages to see what each delivers.</>
            : <>Two-stage engagement model. Fundamentals (meds + screening + lifestyle floor) delivers ~65% of achievable shift; Optimization (biomarker tuning, precision dosing) adds the remaining ~35% in patients with sustained precision care. Slider position encodes current stage of progression. At progress=0, With-Meridian band coincides with Without (no claimed shift, no added uncertainty); uncertainty widens proportionally with claimed shift magnitude. Adherence-conditional framing preserves consent documentation.</>
          }
        </div>
      </div>

      {/* Domain legend */}
      <div className="mb-4 flex items-center gap-5 flex-wrap text-[11px]">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm" style={{ background: m.color, opacity: 0.85 }} />
            <span className="t-mono text-text-muted">
              {variant === "patient" ? m.patient : m.physician.split(" · ")[0]}
            </span>
          </div>
        ))}
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

        {/* Track labels — above each track stack */}
        <text x={leftPad - 10} y={y1 - 34} fill="#a8adb7" fontSize="11"
              fontFamily="'JetBrains Mono', monospace" textAnchor="end">
          Without
        </text>
        <text x={leftPad - 10} y={y2 - 34} fill="#f7f8f8" fontSize="11"
              fontFamily="'JetBrains Mono', monospace" textAnchor="end">
          With Meridian
        </text>

        {/* Baseline trajectory lines (subtle) — drawn at track center */}
        <line x1={leftPad} y1={y1} x2={W - rightPad} y2={y1}
              stroke="#35383e" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={leftPad} y1={y2} x2={W - rightPad} y2={y2}
              stroke="#35383e" strokeWidth="1" strokeDasharray="3 3" />

        {/* You are here marker — brackets each full track stack */}
        <line x1={xOf(47)} y1={y1 - 30} x2={xOf(47)} y2={y2 + 30}
              stroke="#f7f8f8" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx={xOf(47)} cy={y1} r="3" fill="#f7f8f8" />
        <circle cx={xOf(47)} cy={y2} r="3" fill="#f7f8f8" />
        <text x={xOf(47)} y={y1 - 50} fill="#f7f8f8" fontSize="10"
              fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
          you · 47
        </text>

        {/* Milestones stacked by lane, colored by domain */}
        {milestones.map((m, i) => {
          const wMed = withMedian(m);
          // Uncertainty about the With-Meridian shift grows with the MAGNITUDE of
          // the claimed shift. At progress=0 (no plan, no claim), with-band = without-band.
          // At progress=100 (full claimed shift), with-band widens +30% to reflect
          // larger extrapolation uncertainty.
          const shiftFraction = m.maxShift > 0 ? shift(m) / m.maxShift : 0;
          const withWindow = m.withoutWindow * (1 + shiftFraction * 0.3);
          const yLane1 = y1 + laneYOffset(i);
          const yLane2 = y2 + laneYOffset(i);

          return (
            <g key={m.id}>
              {/* Without-track band — hollow outline (no fill) */}
              <rect
                x={xOf(m.withoutMedian - m.withoutWindow)}
                y={yLane1 - bandHeight / 2}
                width={xOf(m.withoutMedian + m.withoutWindow) - xOf(m.withoutMedian - m.withoutWindow)}
                height={bandHeight}
                fill={m.color}
                fillOpacity="0.08"
                stroke={m.color}
                strokeOpacity="0.65"
                strokeWidth="1"
                rx="2"
              />
              {/* Without median marker */}
              <line x1={xOf(m.withoutMedian)} y1={yLane1 - bandHeight / 2 - 1}
                    x2={xOf(m.withoutMedian)} y2={yLane1 + bandHeight / 2 + 1}
                    stroke={m.color} strokeWidth="1.4" />

              {/* With-Meridian band — solid fill */}
              <rect
                x={xOf(wMed - withWindow)}
                y={yLane2 - bandHeight / 2}
                width={xOf(wMed + withWindow) - xOf(wMed - withWindow)}
                height={bandHeight}
                fill={m.color}
                fillOpacity="0.55"
                stroke={m.color}
                strokeOpacity="0.95"
                strokeWidth="1"
                rx="2"
              />
              {/* With-Meridian median marker */}
              <line x1={xOf(wMed)} y1={yLane2 - bandHeight / 2 - 1}
                    x2={xOf(wMed)} y2={yLane2 + bandHeight / 2 + 1}
                    stroke={m.color} strokeWidth="1.8" />

              {/* Connecting line between paired medians (same domain, vertical thread) */}
              <line x1={xOf(m.withoutMedian)} y1={yLane1 + bandHeight / 2}
                    x2={xOf(wMed)} y2={yLane2 - bandHeight / 2}
                    stroke={m.color} strokeOpacity="0.3"
                    strokeWidth="0.7" strokeDasharray="2 2" />

              {/* Year labels — only on outer lanes to reduce clutter */}
              {(i === 0 || i === 3) && (
                <>
                  <text x={xOf(m.withoutMedian)} y={i === 0 ? yLane1 - 14 : yLane1 + 24}
                        fill={m.color} fillOpacity="0.85" fontSize="9"
                        fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                    {m.withoutMedian}
                  </text>
                  <text x={xOf(wMed)} y={i === 0 ? yLane2 - 14 : yLane2 + 24}
                        fill={m.color} fontSize="9"
                        fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                    {wMed.toFixed(0)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Two-stage slider — fundamentals + optimization */}
      <div className="mt-2 mb-5 p-4 rounded-sm border border-accent-base/40 bg-accent-light">
        <div className="flex items-baseline justify-between mb-2">
          <div className="t-label text-text">
            {variant === "patient" ? "Your journey" : "Engagement stage"}
          </div>
          <div className="t-mono text-[13px] text-accent-hover tabular-nums">
            {stageLabel}
          </div>
        </div>

        {/* Custom slider rail with stage midpoint marker */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value, 10))}
            className="w-full accent-accent-hover relative z-10"
            style={{ accentColor: "#7170ff" }}
          />
          {/* Stage divider tick at 50% */}
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className="w-[2px] h-4 bg-text-subtle/60" />
          </div>
        </div>

        {/* Stage labels */}
        <div className="flex justify-between t-mono text-[10px] mt-1">
          <span className="text-text-subtle">Start</span>
          <span className="text-text-muted">Fundamentals</span>
          <span className="text-text-muted">|</span>
          <span className="text-text-muted">Optimization</span>
          <span className="text-text-subtle">Full</span>
        </div>

        <div className="mt-3 text-[12px] text-text-muted leading-relaxed">
          {variant === "patient"
            ? <>At <span className="t-mono text-text-secondary">{stageLabel.toLowerCase()}</span>, this plan adds <span className="t-mono text-accent-hover">≈{(milestones.reduce((s, m) => s + shift(m), 0) / milestones.length).toFixed(1)} years</span> before these markers on average. Fundamentals alone gets you ~65% of the way — Optimization takes you the rest.</>
            : <>Piecewise linear: 0–50% → 0–65% of maxShift (fundamentals); 50–100% → 65–100% of maxShift (optimization). Uncertainty bands widen +40% at 0% engagement. Stage label documents patient-level commitment state for consent records.</>
          }
        </div>
      </div>

      {/* Milestone rows with sources */}
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-baseline pb-2 border-b border-border">
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle">Milestone</div>
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle text-right">Without</div>
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle text-right">With Meridian</div>
          <div className="t-mono text-[10px] uppercase tracking-wider text-text-subtle text-right">Gain</div>
        </div>
        {milestones.map((m) => {
          const label = variant === "patient" ? m.patient : m.physician;
          const s = shift(m);
          return (
            <div key={m.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-baseline py-2 border-b border-border-subtle last:border-0">
              <div className="flex items-baseline gap-2 min-w-0">
                <div className="w-2 h-2 rounded-sm shrink-0 translate-y-0.5" style={{ background: m.color, opacity: 0.85 }} />
                <div className="min-w-0">
                  <div className="text-[13px] text-text leading-snug">{label}</div>
                  <div className="t-mono text-text-subtle text-[10px] mt-0.5">{m.source}</div>
                </div>
              </div>
              <div className="t-mono text-text-muted text-[11px] tabular-nums text-right">
                {m.withoutMedian - m.withoutWindow}–{m.withoutMedian + m.withoutWindow}
              </div>
              <div className="t-mono text-[11px] tabular-nums text-right" style={{ color: m.color }}>
                → {withMedian(m).toFixed(0)}
              </div>
              <div className="t-mono text-text-secondary text-[11px] tabular-nums min-w-[48px] text-right">
                +{s.toFixed(1)}y
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
            ? "Based on published research on large groups of people with backgrounds similar to yours. Ages shown are where half of that group reached the milestone. Real-life range for each person is wider than the band shown. This is not a prediction about you personally — it is the best honest estimate of what you are buying with the plan. The two-stage split (Fundamentals ≈65% of achievable shift, Optimization ≈35%) is a modeling convention informed by CTT Collaboration, PREDIMED, HOPE-3, and SPRINT — not a single published estimate."
            : "PREVENT (CVD events) · SEER (cancer incidence) · Framingham functional health cohort · Studenski gait-speed decline. Per-milestone uncertainty ±3–5 years at median adherence. Cohort-level inference; individual-level prediction not claimed. Two-stage split (Fundamentals 65% / Optimization 35%) is a modeling convention synthesized from CTT, PREDIMED, HOPE-3, SPRINT — not a single published estimate. Optimization category scoped to evidence-backed interventions (ApoB titration, time-in-range glucose mgmt); vague precision-recovery claims excluded."
          }
        </div>
      </div>
    </div>
  );
}


// ─── Exported component ──────────────────────────────────────────────────────

export function RiskVisceralityConcepts() {
  const [variant, setVariant] = useState<"patient" | "physician">("patient");

  return (
    <div className="space-y-6">
      {/* Patient / Physician toggle */}
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
          Both views render from the same mock data. One calculation, two languages.
        </div>
      </div>

      {/* Grounding note */}
      <div className="mb-2">
        <p className="text-[12px] text-text-muted max-w-[78ch] leading-relaxed">
          <span className="t-mono text-text-subtle uppercase tracking-wider text-[10px] mr-2">Grounding</span>
          Cohort-level 50th-percentile event times for named clinical endpoints (MACE / incident malignancy / ADL-dependency / gait-speed decline) with visible 40–60 percentile bands. Reference cohort: ATM+ dyslipidemic males 45–50 (N≈7,412). Frame is &quot;people like you&quot; — individual-level prediction not claimed. Two-stage slider (Fundamentals + Optimization) makes the effort → years-back transaction physically tangible and documents conditional consent: the prediction is contingent on committed effort, not a promise.
        </p>
      </div>

      <MilestoneLadder variant={variant} />
    </div>
  );
}

export default RiskVisceralityConcepts;
