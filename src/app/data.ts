// Maya Chen — Meridian physician app demo patient.
// 52F, ATM heterozygous, hyperlipidemia, pre-diabetes. Established persona across sessions.

export const patient = {
  identity: {
    name: "Chen, Maya K.",
    mrn: "0041829",
    dob: "Jul 11 1973",
    age: 52,
    sex: "F" as const,
  },
  vitals: {
    weight: "68.4 kg",
    bmi: "24.1",
    bp: "124/78",
    hr: "62",
  },
  problems: {
    active: [
      { code: "Z15.04",  name: "ATM heterozygous (pathogenic)", onset: "Jun 2024", status: "Active" },
      { code: "E78.5",   name: "Hyperlipidemia",                onset: "Mar 2022", status: "Active" },
      { code: "R73.03",  name: "Pre-diabetes (A1c 5.8)",        onset: "Feb 2025", status: "Active" },
      { code: "Z80.3",   name: "Fam hx malignant neo of breast",onset: "Apr 2024", status: "Active" },
    ],
    risk_codes: [
      { code: "Z72.0", name: "Tobacco use (former, quit 2018)" },
      { code: "Z63.4", name: "Primary caregiver burden (father)" },
    ],
    resolved: [
      { code: "M54.5", name: "Low back pain",               resolved: "Jan 2024" },
    ],
  },
  meds: {
    active: [
      "Atorvastatin 20 mg qHS",
      "Metformin 500 mg BID",
      "Vitamin D3 2000 IU daily",
    ],
    supplements: ["Omega-3 1 g daily", "Magnesium glycinate 400 mg qHS"],
    allergies: "NKDA",
  },
  labs: {
    lipid: {
      dates: ["Oct '24", "Feb '25", "Aug '25", "Feb '26"],
      rows: [
        { analyte: "ApoB",  unit: "mg/dL",   range: "< 90",  values: ["142", "138", "132", "132"], flag: "crit" as const },
        { analyte: "LDL-C", unit: "mg/dL",   range: "< 100", values: ["168", "152", "148", "148"], flag: "crit" as const },
        { analyte: "HDL-C", unit: "mg/dL",   range: "> 40",  values: ["48", "50", "51", "52"],     flag: null },
        { analyte: "TG",    unit: "mg/dL",   range: "< 150", values: ["110", "104", "98", "92"],   flag: null },
        { analyte: "Lp(a)", unit: "nmol/L",  range: "< 50",  values: [null, "78", null, "78"],     flag: "warn" as const },
      ],
    },
    metabolic: {
      dates: ["Oct '24", "Feb '25", "Aug '25", "Feb '26"],
      rows: [
        { analyte: "HbA1c",   unit: "%",      range: "< 5.7",    values: ["5.6", "5.7", "5.8", "5.8"], flag: "warn" as const },
        { analyte: "Glucose", unit: "mg/dL",  range: "70–99",    values: ["98",  "102", "104", "101"], flag: "warn" as const },
        { analyte: "Insulin", unit: "μIU/mL", range: "2.6–24.9", values: ["14",  "16",  "18",  "17"],  flag: null },
        { analyte: "HOMA-IR", unit: "",       range: "< 2.0",    values: ["3.4", "4.0", "4.6", "4.2"], flag: "warn" as const },
      ],
    },
  },
  vitals_flow: {
    dates: ["Jan", "Feb", "Mar", "Apr"],
    rows: [
      { analyte: "Resting HR", unit: "bpm",    range: "50–70",    values: ["64", "62", "63", "62"], flag: null },
      { analyte: "HRV (rMSSD)",unit: "ms",     range: "≥ 40",     values: ["42", "45", "48", "51"], flag: null },
      { analyte: "Sleep",       unit: "h",      range: "7–9",      values: ["6.8", "7.2", "7.4", "7.6"], flag: null },
      { analyte: "Deep sleep",  unit: "%",      range: "> 15",     values: ["14", "16", "17", "18"], flag: null },
      { analyte: "VO₂max",      unit: "ml/kg/m",range: "> 35",     values: ["38", "38", "39", "40"], flag: null },
      { analyte: "Steps",       unit: "k/day",  range: "> 7",      values: ["8.2", "8.9", "9.4", "9.1"], flag: null },
    ],
  },
  genetic: {
    positive: {
      gene: "ATM",
      variant: "c.7271T>G (p.Val2424Gly)",
      classification: "Pathogenic",
      zygosity: "Heterozygous",
      implications: "↑ breast, pancreatic, gastric cancer risk. Radiation sensitivity. Surveillance indicated.",
    },
    panel_status: "163-gene preventive panel · Invitae · Nov 2024",
  },
  risk: {
    cv: {
      value: "14.2%",
      label: "10-yr ASCVD risk",
      delta: "+2.1 vs prior",
      trend: "up" as const,
      drivers: [
        { label: "ApoB 132 mg/dL",       weight: "HR 1.42", contribution: "+3.8%" },
        { label: "Lp(a) 78 nmol/L",      weight: "HR 1.24", contribution: "+2.1%" },
        { label: "Systolic BP 128 mmHg", weight: "HR 1.18", contribution: "+1.4%" },
        { label: "Pre-diabetes A1c 5.8", weight: "HR 1.12", contribution: "+0.9%" },
      ],
      evidence: "PREVENT (AHA 2023) · ACC/AHA 2019 · ESC 2021",
    },
    metabolic: {
      value: "32%",
      label: "5-yr T2DM risk",
      delta: "+6 vs prior",
      trend: "up" as const,
      drivers: [
        { label: "HOMA-IR 4.2",          weight: "HR 1.48", contribution: "+11%" },
        { label: "A1c 5.8%",             weight: "HR 1.32", contribution: "+8%" },
        { label: "BMI 24.1 (visceral)",  weight: "HR 1.10", contribution: "+3%" },
        { label: "Sleep debt trend",      weight: "HR 1.08", contribution: "+2%" },
      ],
      evidence: "ADA 2024 · DPP · Framingham Offspring",
    },
    ckd: {
      value: "3.1%",
      label: "10-yr CKD risk",
      delta: "+0.4 vs prior",
      trend: "up" as const,
      drivers: [
        { label: "eGFR 87 (stable)",     weight: "HR 1.05", contribution: "+0.8%" },
        { label: "UACR 9 mg/g",          weight: "HR 1.08", contribution: "+0.9%" },
        { label: "Pre-DM trajectory",    weight: "HR 1.14", contribution: "+1.2%" },
      ],
      evidence: "KDIGO 2024 · CKD-PC",
    },
    neuro: {
      value: "11%",
      label: "Lifetime dementia risk",
      delta: "flat",
      trend: "flat" as const,
      drivers: [
        { label: "APOE 3/3 (neutral)",   weight: "HR 1.00", contribution: "0%" },
        { label: "Metabolic trajectory", weight: "HR 1.22", contribution: "+3%" },
        { label: "Sleep debt trend",     weight: "HR 1.10", contribution: "+1%" },
        { label: "Social engagement",    weight: "HR 0.92", contribution: "−2%" },
      ],
      evidence: "Lancet Commission 2024 · FINGER",
    },
  },
  actions: [
    {
      kicker: "Action 01 · Cardiovascular",
      do: "Intensify statin: atorva 20 → rosuva 10 mg qHS",
      why: "ApoB 132 (goal < 90) on current regimen × 18 mo. Plateau indicates need for step-up.",
      goal: "ApoB < 90 mg/dL by Oct 2026 · LDL-C < 100",
      evidence: "PREVENT (AHA 2023) · ACC/AHA 2019",
    },
    {
      kicker: "Action 02 · Screening",
      tone: "urgent" as const,
      do: "Order pancreatic MRCP — schedule within 30 d",
      why: "ATM heterozygous + paternal pancreatic ca hx. No prior pancreas imaging.",
      goal: "MRCP complete by Jun 2026, then annually",
      evidence: "NCCN Genetic/Familial v2.2025 · CAPS Consortium",
    },
    {
      kicker: "Action 03 · Metabolic",
      do: "Add GLP-1 agonist trial: semaglutide 0.25 mg SQ weekly × 4 wk titration",
      why: "HOMA-IR 4.2, A1c 5.8 on metformin × 12 mo. Pre-DM trajectory upward.",
      goal: "A1c < 5.7, HOMA-IR < 2.0 by Dec 2026",
      evidence: "SUSTAIN-6 · STEP-1 · ADA 2024",
    },
    {
      kicker: "Action 04 · Breast surveillance",
      do: "Continue annual MRI + mammogram (alternating q6mo)",
      why: "ATM heterozygous. Lifetime breast ca risk 25-30%.",
      goal: "Next MRI: Jul 2026. Last clear: Jan 2026.",
      evidence: "NCCN Breast Screen v2.2025 · ACR",
    },
    {
      kicker: "Action 05 · Sleep & recovery",
      do: "Continue sleep hygiene protocol; add AM light therapy 10k lux × 20 min",
      why: "Deep sleep trending ↑ (14 → 18%). HRV improving. Reinforce before adding pharmacotherapy.",
      goal: "Deep sleep ≥ 20%, HRV ≥ 55 ms by Aug 2026",
      evidence: "AASM · CBT-I consensus",
    },
    {
      kicker: "Action 06 · Cardiovascular",
      do: "Add ezetimibe 10 mg qHS if ApoB not at goal on rosuva at 12 wk",
      why: "Second-line LDL-lowering. Additive 15-20% ApoB reduction. Prepares ground for PCSK9 if needed.",
      goal: "Conditional trigger: ApoB > 90 at 12-wk recheck",
      evidence: "IMPROVE-IT · ACC/AHA 2019",
    },
    {
      kicker: "Action 07 · Lp(a)",
      do: "Counsel on Lp(a) 78 nmol/L as lifelong CV risk factor; consider family cascade testing",
      why: "Lp(a) is genetic, non-modifiable, independent of LDL. Affects familial risk stratification.",
      goal: "Patient + first-degree relatives informed by Jul 2026",
      evidence: "ESC Lp(a) Consensus 2022 · NHLBI",
    },
    {
      kicker: "Action 08 · Metabolic",
      do: "CGM 14-day trial to characterize postprandial glucose excursions",
      why: "HOMA-IR 4.2 + A1c 5.8 + rising HOMA-IR trend. CGM data refines GLP-1 vs lifestyle decision.",
      goal: "Data return by May 2026; review at visit",
      evidence: "ADA 2024 · Hall et al. 2023",
    },
    {
      kicker: "Action 09 · Hereditary surveillance",
      do: "Refer to genetic counseling for cascade testing discussion (father, siblings, daughter)",
      why: "ATM pathogenic variant. First-degree relatives 50% carriers. Cascade testing indicated.",
      goal: "Referral placed by Jun 2026; counseling complete by Sep 2026",
      evidence: "NCCN Genetic/Familial v2.2025 · ACMG",
    },
    {
      kicker: "Action 10 · Bone health",
      do: "Baseline DEXA — no prior scan, peri-menopausal transition",
      why: "Age 52, ATM (radiation sensitivity informs surveillance imaging), low-dose statin, no baseline.",
      goal: "DEXA complete by Aug 2026",
      evidence: "USPSTF 2025 · ISCD",
    },
  ],
};

export type Patient = typeof patient;
