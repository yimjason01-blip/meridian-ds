import { useState } from "react";
import { SegmentedControl } from "../primitives/SegmentedControl";
import { PatientBanner } from "../clinical/PatientBanner";
import { CarePlan } from "./CarePlan";
import { RiskModels } from "./RiskModels";
import { EMR } from "./EMR";
import { patient } from "./data";
import { AskProvider, AskInline, AskPane, AskCommand } from "../primitives/Ask";

export function App() {
  return (
    <AskProvider>
      <AppShell />
    </AskProvider>
  );
}

function AppShell() {
  const [section, setSection] = useState("care-plan");

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <header className="border-b border-border-subtle bg-bg/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              style={{
                fontSize: 20,
                fontWeight: 400,
                letterSpacing: "-0.03em",
                color: "var(--text-secondary)",
                lineHeight: 1.08,
              }}
            >
              Meridian
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 510,
                letterSpacing: "-0.02em",
                color: "var(--text)",
                lineHeight: 1.08,
              }}
            >
              MD
            </span>
          </div>
          <SegmentedControl
            value={section}
            onChange={setSection}
            options={[
              { value: "care-plan",   label: "Care Plan"   },
              { value: "risk-models", label: "Risk Models" },
              { value: "emr",         label: "EMR"         },
            ]}
          />
        </div>
      </header>

      <PatientBanner
        identity={{
          name: patient.identity.name,
          mrn: patient.identity.mrn,
          dob: patient.identity.dob,
          age: patient.identity.age,
          sex: patient.identity.sex,
        }}
        vitals={patient.vitals}
        problems={patient.problems.active.map((p) => p.name)}
        medsAllergies={{ meds: patient.meds.active, allergies: patient.meds.allergies }}
      />

      {/* Canvas + AskPane as flex siblings. Pane never overlays. */}
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            {section === "care-plan"   && <CarePlan />}
            {section === "risk-models" && <RiskModels />}
            {section === "emr"         && <EMR />}
          </div>
        </main>
        <AskPane widthPx={400} />
      </div>

      {/* Overlays — live at app level */}
      <AskCommand />
      <AskInline />
    </div>
  );
}
