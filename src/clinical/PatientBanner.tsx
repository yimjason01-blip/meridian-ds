import * as React from "react";
import { cn } from "../lib/cn";

/**
 * PatientBanner — persistent patient context strip above EMR sub-tabs.
 * Clinical component. 4-column grid: Identity · Biometrics+BP · Active Problems · Current Rx+Allergies.
 * See emr-flowsheet-component skill for the canonical banner structure.
 */
export interface PatientBannerProps {
  identity: { name: string; mrn: string; dob: string; age: number; sex: string };
  vitals: { weight: string; bmi: string; bp: string; hr: string };
  problems: string[];
  medsAllergies: { meds: string[]; allergies: string };
  className?: string;
}

export function PatientBanner({ identity, vitals, problems, medsAllergies, className }: PatientBannerProps) {
  return (
    <section
      className={cn(
        "grid grid-cols-4 gap-6 px-6 py-4 bg-bg-panel border-y border-border-subtle",
        className
      )}
      aria-label="Patient summary"
    >
      <BannerCol label="Identity">
        <div className="t-h3 mb-0.5">{identity.name}</div>
        <div className="t-meta">
          MRN {identity.mrn} · {identity.age}{identity.sex} · DOB {identity.dob}
        </div>
      </BannerCol>

      <BannerCol label="Biometrics">
        <KV k="Wt" v={vitals.weight} />
        <KV k="BMI" v={vitals.bmi} />
        <KV k="BP" v={vitals.bp} />
        <KV k="HR" v={vitals.hr} />
      </BannerCol>

      <BannerCol label="Active Problems">
        <ul className="space-y-0.5">
          {problems.map((p) => (
            <li key={p} className="t-ui text-text">{p}</li>
          ))}
        </ul>
      </BannerCol>

      <BannerCol label="Medications · Allergies">
        <ul className="space-y-0.5">
          {medsAllergies.meds.map((m) => (
            <li key={m} className="t-ui text-text-secondary">{m}</li>
          ))}
        </ul>
        <div className="t-meta mt-1.5">Allergies: {medsAllergies.allergies}</div>
      </BannerCol>
    </section>
  );
}

function BannerCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="t-label mb-2">{label}</div>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="t-caption w-8 shrink-0">{k}</span>
      <span className="t-mono text-text">{v}</span>
    </div>
  );
}
