import { useState } from "react";
import { SegmentedControl } from "../primitives/SegmentedControl";
import { PatientBanner } from "../clinical/PatientBanner";
import { CarePlan } from "./CarePlan";
import { RiskModels } from "./RiskModels";
import { EMR } from "./EMR";
import { patient } from "./data";

export function App() {
  const [section, setSection] = useState("care-plan");

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border-subtle bg-bg/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[17px]" style={{ fontWeight: 400, color: "var(--text-muted)" }}>Meridian</span>
            <span className="text-[17px]" style={{ fontWeight: 590, color: "var(--text)" }}>MD</span>
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

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {section === "care-plan"   && <CarePlan />}
        {section === "risk-models" && <RiskModels />}
        {section === "emr"         && <EMR />}
      </main>
    </div>
  );
}
