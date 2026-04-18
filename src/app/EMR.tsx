import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../primitives/Tabs";
import { Badge } from "../primitives/Badge";
import { Flowsheet } from "../clinical/Flowsheet";
import { Table, THead, TR, TH, TD } from "../primitives/Table";
import { patient } from "./data";

const SUB_TABS = [
  { id: "problems",  label: "Problems"  },
  { id: "orders",    label: "Orders"    },
  { id: "screening", label: "Screening" },
  { id: "meds",      label: "Meds"      },
  { id: "labs",      label: "Labs"      },
  { id: "vitals",    label: "Vitals"    },
  { id: "genetic",   label: "Genetic"   },
  { id: "family",    label: "Family"    },
  { id: "notes",     label: "Notes"     },
];

export function EMR() {
  const [tab, setTab] = useState("problems");
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex-wrap">
        {SUB_TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="problems"><Problems /></TabsContent>
      <TabsContent value="orders"><EmptyState label="Orders" /></TabsContent>
      <TabsContent value="screening"><EmptyState label="Screening" /></TabsContent>
      <TabsContent value="meds"><Meds /></TabsContent>
      <TabsContent value="labs"><Labs /></TabsContent>
      <TabsContent value="vitals"><Vitals /></TabsContent>
      <TabsContent value="genetic"><Genetic /></TabsContent>
      <TabsContent value="family"><EmptyState label="Family" /></TabsContent>
      <TabsContent value="notes"><EmptyState label="Notes" /></TabsContent>
    </Tabs>
  );
}

function Problems() {
  const p = patient.problems;
  return (
    <div className="space-y-6">
      <Section title="Active problems">
        <Table>
          <THead>
            <TR>
              <TH>Code</TH><TH>Problem</TH><TH>Onset</TH><TH>Status</TH>
            </TR>
          </THead>
          <tbody>
            {p.active.map((x, i) => (
              <TR key={i}>
                <TD className="t-mono">{x.code}</TD>
                <TD>{x.name}</TD>
                <TD className="t-mono text-text-secondary">{x.onset}</TD>
                <TD><Badge tone="accent">{x.status}</Badge></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section title="Risk factors / Z-codes">
        <Table>
          <THead><TR><TH>Code</TH><TH>Finding</TH></TR></THead>
          <tbody>
            {p.risk_codes.map((x, i) => (
              <TR key={i}><TD className="t-mono">{x.code}</TD><TD>{x.name}</TD></TR>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section title="Resolved">
        <Table>
          <THead><TR><TH>Code</TH><TH>Problem</TH><TH>Resolved</TH></TR></THead>
          <tbody>
            {p.resolved.map((x, i) => (
              <TR key={i}>
                <TD className="t-mono">{x.code}</TD>
                <TD>{x.name}</TD>
                <TD className="t-mono text-text-muted">{x.resolved}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Section>
    </div>
  );
}

function Meds() {
  const m = patient.meds;
  return (
    <div className="space-y-5">
      <Section title="Active medications">
        <ul className="divide-y divide-border-subtle">
          {m.active.map((x, i) => (
            <li key={i} className="py-2 t-ui text-text">{x}</li>
          ))}
        </ul>
      </Section>
      <Section title="Supplements">
        <ul className="divide-y divide-border-subtle">
          {m.supplements.map((x, i) => (
            <li key={i} className="py-2 t-ui text-text-secondary">{x}</li>
          ))}
        </ul>
      </Section>
      <Section title="Allergies">
        <div className="t-ui text-text">{m.allergies}</div>
      </Section>
    </div>
  );
}

function Labs() {
  return (
    <div className="space-y-5">
      <Flowsheet groupTitle="Lipid panel · 18-mo trend" dates={patient.labs.lipid.dates} rows={patient.labs.lipid.rows} />
      <Flowsheet groupTitle="Metabolic panel · 18-mo trend" dates={patient.labs.metabolic.dates} rows={patient.labs.metabolic.rows} />
    </div>
  );
}

function Vitals() {
  return (
    <div className="space-y-5">
      <Section title="In-office · Feb 2026">
        <div className="grid grid-cols-4 gap-6">
          <KV label="BP"  v={patient.vitals.bp} />
          <KV label="HR"  v={patient.vitals.hr} />
          <KV label="BMI" v={patient.vitals.bmi} />
          <KV label="Wt"  v={patient.vitals.weight} />
        </div>
      </Section>
      <Flowsheet groupTitle="Wearable · 4-mo trend" dates={patient.vitals_flow.dates} rows={patient.vitals_flow.rows} />
    </div>
  );
}

function Genetic() {
  const g = patient.genetic;
  return (
    <div className="space-y-5">
      <article className="rounded-card bg-white/[.02] border border-border border-l-2 border-l-status-warn p-4">
        <div className="t-label mb-2">Actionable finding</div>
        <div className="grid grid-cols-[120px_1fr] gap-y-2 gap-x-4 items-baseline">
          <span className="t-caption">Gene</span>
          <span className="t-h3">{g.positive.gene}</span>
          <span className="t-caption">Variant</span>
          <span className="t-mono">{g.positive.variant}</span>
          <span className="t-caption">Classification</span>
          <span className="t-ui text-text">{g.positive.classification}</span>
          <span className="t-caption">Zygosity</span>
          <span className="t-ui text-text-secondary">{g.positive.zygosity}</span>
          <span className="t-caption">Implications</span>
          <span className="t-body">{g.positive.implications}</span>
        </div>
      </article>
      <Section title="Panel">
        <div className="t-meta">{g.panel_status}</div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="t-label mb-2">{title}</div>
      {children}
    </section>
  );
}

function KV({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="t-caption mb-0.5">{label}</div>
      <div className="t-mono text-text text-[20px]">{v}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-border p-10 text-center">
      <div className="t-ui text-text-secondary mb-1">{label} — not yet populated</div>
      <div className="t-caption">Scaffolded. Wire data in next iteration.</div>
    </div>
  );
}
