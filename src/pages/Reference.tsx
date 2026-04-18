import * as React from "react";
import tokens from "../tokens/tokens.json";
import { cn } from "../lib/cn";
import { contrastRatio, wcagBadge } from "../lib/contrast";
import { Button } from "../primitives/Button";
import { Card, CardHeader, CardBody } from "../primitives/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../primitives/Tabs";
import { Badge } from "../primitives/Badge";
import { Input } from "../primitives/Input";
import { Table, THead, TR, TH, TD } from "../primitives/Table";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "../primitives/Dialog";
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "../primitives/DropdownMenu";
import { SegmentedControl } from "../primitives/SegmentedControl";
import { PatientBanner } from "../clinical/PatientBanner";
import { Flowsheet } from "../clinical/Flowsheet";
import { DomainPane } from "../clinical/DomainPane";
import { DecisionCard } from "../clinical/DecisionCard";

export default function Reference() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-10 space-y-16">
        <TokensSection />
        <PairingsSection />
        <TypographySection />
        <AnswerShapeSection />
        <VoiceSection />
        <ElevationSection />
        <SeparationSection />
        <PrimitivesSection />
        <StateMatrixSection />
        <BannedPatternsSection />
        <ClinicalSection />
      </main>
      <footer className="max-w-[1200px] mx-auto px-6 py-10 border-t border-border-subtle mt-16">
        <div className="t-meta">Meridian MD DS v1.3 · Locked 2026-04-18 · tokens.json is source of truth</div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur border-b border-border-subtle">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-baseline justify-between">
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
          <span className="t-ui text-text-muted ml-3">Design System</span>
        </div>
        <span className="t-meta">v1.3 · dark-only · Linear-native · shadcn/Radix primitives</span>
      </div>
    </header>
  );
}

// ───── Section wrapper ───────────────────────────────────────────────────

function Section({ n, title, rule, children }: { n: string; title: string; rule?: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-20">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="t-caption tabular-nums">{n}</span>
        <h2 className="t-h2">{title}</h2>
      </div>
      {rule && <p className="t-body max-w-[60ch] mb-6 text-text-secondary">{rule}</p>}
      {children}
    </section>
  );
}

// ───── Tokens ─────────────────────────────────────────────────────────────

function TokensSection() {
  const groups = [
    { label: "Surface", items: tokens.color.surface },
    { label: "Text", items: tokens.color.text },
    { label: "Accent", items: tokens.color.accent },
    { label: "Status", items: tokens.color.status },
    { label: "Border", items: tokens.color.border },
  ];
  return (
    <Section n="01" title="Tokens" rule="Raw values. Do not use directly in product code — always reach through semantic aliases (surface.card, text.primary, etc).">
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="t-label mb-3">{g.label}</div>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(g.items).map(([name, meta]: [string, any]) => (
                <div key={name} className="rounded-card border border-border bg-white/[.02] p-3">
                  <div className="h-12 w-full rounded-sm border border-border-subtle" style={{ background: meta.$value }} />
                  <div className="t-ui mt-2.5 text-text">{g.label.toLowerCase()}.{name}</div>
                  <div className="t-mono text-text-muted">{meta.$value}</div>
                  {meta._use && <div className="t-caption mt-1">{meta._use}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ───── Pairings matrix ───────────────────────────────────────────────────

function PairingsSection() {
  const texts = [
    { name: "primary",   hex: tokens.color.text.primary.$value },
    { name: "secondary", hex: tokens.color.text.secondary.$value },
    { name: "muted",     hex: tokens.color.text.muted.$value },
  ];
  const surfaces = [
    { name: "canvas", hex: tokens.color.surface.canvas.$value },
    { name: "panel",  hex: tokens.color.surface.panel.$value },
    { name: "card",   hex: tokens.color.surface.card.$value },
    { name: "hover",  hex: tokens.color.surface.hover.$value },
  ];
  // Rule lookup keyed by text.<name>+on.<name>
  const ruleFor = (t: string, s: string) => {
    const key = `text.${t}`;
    const onKey = `surface.${s}`;
    return tokens.pairings.rules.find((r: any) => r.text === key && r.on === onKey);
  };
  return (
    <Section n="02" title="Pairings Matrix" rule="Live contrast ratios. AAA required for text <18px (≥7:1). A pair that passes AAA numerically can still be BANNED by rule (e.g. muted on elevated surfaces — drove the Evidence-strip bug).">
      <div className="grid grid-cols-[120px_repeat(4,1fr)] gap-px bg-border-subtle border border-border-subtle rounded-card overflow-hidden">
        <div className="bg-bg-panel" />
        {surfaces.map((s) => (
          <div key={s.name} className="bg-bg-panel p-3">
            <div className="t-label">surface.{s.name}</div>
            <div className="t-mono text-text-muted">{s.hex}</div>
          </div>
        ))}

        {texts.map((t) => (
          <React.Fragment key={t.name}>
            <div className="bg-bg-panel p-3">
              <div className="t-label">text.{t.name}</div>
              <div className="t-mono text-text-muted">{t.hex}</div>
            </div>
            {surfaces.map((s) => {
              const r = contrastRatio(t.hex, s.hex);
              const wcag = wcagBadge(r);
              const rule = ruleFor(t.name, s.name);
              const banned = rule && rule.allowed === false;
              return (
                <div key={s.name} style={{ background: s.hex, color: t.hex }} className={cn("p-4 relative", banned && "ring-2 ring-inset ring-status-crit/60")}>
                  <div className="t-body mb-2">The quick brown fox 015 · 4.2 mmol/L</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="t-mono text-[11px]">{r.toFixed(2)}:1</span>
                    {banned ? (
                      <Badge tone="crit">BANNED</Badge>
                    ) : (
                      <Badge tone={wcag === "AAA" ? "ok" : wcag === "AA" ? "warn" : "crit"}>{wcag}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </Section>
  );
}

// ───── Typography roles ──────────────────────────────────────────────────

function TypographySection() {
  return (
    <Section n="03" title="Typography Roles" rule="Four roles: Header, Body, Label, Meta. Rule: a Header is never dimmer/lighter/smaller than its Body. Uppercase-tracked-muted is Label or Meta, NEVER a header.">
      <div className="space-y-6">
        <Card>
          <div className="t-display">Display / 48 / 510</div>
          <div className="t-h1 mt-3">H1 / 32 / 510</div>
          <div className="t-h2 mt-2">H2 / 24 / 510</div>
          <div className="t-h3 mt-2">H3 / 20 / 590</div>
          <div className="t-body-lg mt-3">Body-lg 18 / 400 — only for spec and summary prose.</div>
          <div className="t-body mt-1">Body 15 / 400 — default reading text for cards and descriptions.</div>
          <div className="t-ui mt-1">UI 13 / 510 — tab labels, buttons, nav.</div>
          <div className="t-caption mt-1">Caption 12 / 510 — metadata, units, micro-labels.</div>
          <div className="t-label mt-1">LABEL · SPACED · UPPERCASE</div>
          <div className="t-mono mt-1">Mono 13 / 400 · 128 mg/dL · 4.2 mmol/L</div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>✓ correct — header dominates</CardHeader>
            <div>
              <div className="t-meta mb-1">Feb 28 2026 · Run #127</div>
              <div className="t-h3 mb-1">Statin for CV risk reduction</div>
              <div className="t-body">Atorvastatin 20 mg qHS. 10-year ASCVD risk 14.2%, ApoB 132.</div>
            </div>
          </Card>
          <Card className="border-status-crit/30">
            <CardHeader>✗ wrong — inverted hierarchy</CardHeader>
            <div>
              <div className="t-h3 text-text-muted mb-1">Statin for CV risk reduction</div>
              <div className="t-body text-text">Atorvastatin 20 mg qHS. 10-year ASCVD risk 14.2%, ApoB 132.</div>
              <div className="t-meta mt-1">Header is dimmer than body. Banned.</div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}

// ───── Answer shape: SOAP vs Do/Why/Goal ─────────────────────────────────

function AnswerShapeSection() {
  return (
    <Section n="04" title="Answer Shape" rule="Decision cards must answer-shape (one thing lands first). Equal-weight labeled fields (SOAP-style) force the eye to scan 6 labels before finding the action. Banned by tokens.json › soap-field-template.">
      <div className="grid grid-cols-2 gap-4 items-start">
        {/* WRONG — SOAP 6-field */}
        <div>
          <div className="t-label mb-2 text-status-crit">✗ Banned — SOAP field template</div>
          <article className="bg-white/[.02] border border-border rounded-card p-4 space-y-3">
            <div>
              <div className="t-label mb-0.5">Pattern</div>
              <div className="text-ui text-text-secondary">ApoB 132 with elevated Lp(a) 78, pre-diabetes A1c 5.8</div>
            </div>
            <div>
              <div className="t-label mb-0.5">Mechanism</div>
              <div className="text-ui text-text-secondary">Genetic hyperlipidemia + insulin resistance elevates 10-yr ASCVD</div>
            </div>
            <div>
              <div className="t-label mb-0.5">Intervention</div>
              <div className="text-ui text-text-secondary">Rosuvastatin 10 mg qHS + metformin 500 mg BID</div>
            </div>
            <div>
              <div className="t-label mb-0.5">Tracking metric</div>
              <div className="text-ui text-text-secondary">ApoB, LDL-C, HbA1c q3mo</div>
            </div>
            <div>
              <div className="t-label mb-0.5">Evidence</div>
              <div className="text-ui text-text-muted">PREVENT, UKPDS, ACC/AHA 2019…</div>
            </div>
            <div>
              <div className="t-label mb-0.5">Orders</div>
              <div className="text-ui text-text-secondary">Pharmacy + labs q3mo</div>
            </div>
          </article>
          <p className="t-caption mt-2">Six equal-weight labeled blocks. Eye has to scan all six to find the action. Every block competes.</p>
        </div>

        {/* RIGHT — 3-row answer-shape */}
        <div>
          <div className="t-label mb-2 text-status-ok">✓ Correct — DecisionCard (Do / Why / Goal)</div>
          <DecisionCard
            kicker="Action 02 · Cardiovascular"
            do="Rosuvastatin 10 mg qHS + metformin 500 mg BID"
            why="ApoB 132 + Lp(a) 78 + A1c 5.8 → 10-yr ASCVD 14.2% (high). Both genetic & metabolic drivers tractable."
            goal="ApoB < 90 mg/dL, A1c < 5.7 by Oct 2026"
            evidence="PREVENT (AHA 2023) · UKPDS · ACC/AHA 2019"
          />
          <p className="t-caption mt-2">Verb lands first. Why and Goal subordinate. Evidence is a footer, not a row.</p>
        </div>
      </div>
    </Section>
  );
}

// ───── Voice: physician vs patient ───────────────────────────────────────

function VoiceSection() {
  return (
    <Section n="05" title="Voice" rule="Physician surfaces are terse clinical labels, scannable rows, abbreviated units. No hero titles. No second-person 'your body' prose. Banned by tokens.json › patient-marketing-voice.">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="t-label mb-2 text-status-crit">✗ Patient marketing voice</div>
          <article className="bg-white/[.02] border border-border rounded-card p-4">
            <div className="t-h3 mb-1">Your cardiovascular health</div>
            <div className="t-body">What your body does day to day matters. Here's how Maya is doing: her numbers are a little high, but with some small lifestyle tweaks she can bring things into a healthier range.</div>
          </article>
        </div>
        <div>
          <div className="t-label mb-2 text-status-ok">✓ Physician voice</div>
          <article className="bg-white/[.02] border border-border rounded-card p-4">
            <div className="t-label mb-1">Cardiovascular</div>
            <div className="flex items-baseline gap-3">
              <span className="t-h2 text-text">14.2%</span>
              <span className="t-caption">10-yr ASCVD · PREVENT</span>
            </div>
            <ul className="mt-2 space-y-0.5 t-ui text-text-secondary">
              <li>ApoB 132 · Lp(a) 78 · A1c 5.8</li>
              <li>Rx: atorvastatin 20 qHS · metformin 500 BID</li>
            </ul>
          </article>
        </div>
      </div>
    </Section>
  );
}

// ───── Elevation ladder ──────────────────────────────────────────────────

function ElevationSection() {
  return (
    <Section n="06" title="Elevation" rule="Dark-mode elevation = lighter surface + thin white border. Shadows are only for modals. Max card nesting depth = 1.">
      <div className="grid grid-cols-4 gap-3">
        {[
          { level: 0, name: "canvas", bg: "var(--bg)", border: "transparent", use: "Page background" },
          { level: 1, name: "panel", bg: "var(--bg-panel)", border: "var(--border-subtle)", use: "Side panels" },
          { level: 2, name: "card", bg: "rgba(255,255,255,0.02)", border: "var(--border)", use: "Cards, inputs" },
          { level: 3, name: "pop", bg: "var(--bg-surface)", border: "var(--border)", use: "Dropdowns, popovers" },
        ].map((e) => (
          <div key={e.name} style={{ background: e.bg, borderColor: e.border }} className="rounded-card border p-4 min-h-[120px] flex flex-col justify-between">
            <div>
              <div className="t-label">L{e.level}</div>
              <div className="t-ui mt-1">{e.name}</div>
            </div>
            <div className="t-caption">{e.use}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ───── Separation grammar ────────────────────────────────────────────────

function SeparationSection() {
  const items = ["Problems", "Orders", "Meds", "Labs"];
  return (
    <Section n="07" title="Separation Grammar" rule="Priority: whitespace → background shift → divider → border. Reach for the quietest tool that works. Never stack two.">
      <div className="grid grid-cols-4 gap-3">
        <SepDemo label="Whitespace">
          <ul className="space-y-3">{items.map((i) => <li key={i} className="t-ui">{i}</li>)}</ul>
        </SepDemo>
        <SepDemo label="Background">
          <ul>{items.map((i, k) => <li key={i} className={"t-ui px-3 py-2 " + (k % 2 ? "bg-white/[.02]" : "")}>{i}</li>)}</ul>
        </SepDemo>
        <SepDemo label="Divider">
          <ul className="divide-y divide-border-subtle">{items.map((i) => <li key={i} className="t-ui py-2">{i}</li>)}</ul>
        </SepDemo>
        <SepDemo label="Border (loudest)">
          <ul className="space-y-2">{items.map((i) => <li key={i} className="t-ui px-3 py-2 border border-border rounded-sm">{i}</li>)}</ul>
        </SepDemo>
      </div>
    </Section>
  );
}

function SepDemo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="t-label mb-2">{label}</div>
      <div className="rounded-card bg-bg-panel/40 p-3">{children}</div>
    </div>
  );
}

// ───── Primitives ────────────────────────────────────────────────────────

function PrimitivesSection() {
  return (
    <Section n="08" title="Primitives" rule="shadcn/Radix foundation, re-skinned to Linear dark. Copy-paste owned in src/primitives. Every primitive exposes all states below.">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>Button</CardHeader>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>Input</CardHeader>
          <div className="space-y-2">
            <Input placeholder="Search patients…" />
            <Input placeholder="Focused" autoFocus />
            <Input placeholder="Disabled" disabled />
          </div>
        </Card>

        <Card>
          <CardHeader>Badges</CardHeader>
          <div className="flex gap-2 flex-wrap">
            <Badge>Neutral</Badge>
            <Badge tone="ok">In range</Badge>
            <Badge tone="warn">Borderline</Badge>
            <Badge tone="crit">Out of range</Badge>
            <Badge tone="accent">Selected</Badge>
          </div>
        </Card>

        <Card>
          <CardHeader>SegmentedControl (top-level mode switch)</CardHeader>
          <SegmentedControlDemo />
          <div className="t-caption mt-3">For 2–4 peer product sections. Different semantic from &lt;Tabs&gt; (in-page group). Prototype pattern, lives in header-right.</div>
        </Card>

        <Card>
          <CardHeader>Tabs (in-page)</CardHeader>
          <Tabs defaultValue="problems">
            <TabsList>
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="meds">Meds</TabsTrigger>
              <TabsTrigger value="labs">Labs</TabsTrigger>
            </TabsList>
            <TabsContent value="problems"><span className="t-body">Problems tab panel</span></TabsContent>
            <TabsContent value="orders"><span className="t-body">Orders tab panel</span></TabsContent>
            <TabsContent value="meds"><span className="t-body">Meds tab panel</span></TabsContent>
            <TabsContent value="labs"><span className="t-body">Labs tab panel</span></TabsContent>
          </Tabs>
        </Card>

        <Card>
          <CardHeader>Dialog</CardHeader>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Sign orders</DialogTitle>
              <DialogDescription>5 orders pending signature. Confirm to send to pharmacy and scheduling.</DialogDescription>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Sign all</Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        <Card>
          <CardHeader>Dropdown</CardHeader>
          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="ghost">Row actions ▾</Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem>View detail</DropdownItem>
              <DropdownItem>Add to problem list</DropdownItem>
              <DropdownSeparator />
              <DropdownItem>Annotate</DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        </Card>

        <Card className="col-span-2">
          <CardHeader>Table</CardHeader>
          <Table>
            <THead>
              <TR>
                <TH>Analyte</TH>
                <TH>Range</TH>
                <TH className="text-right">Value</TH>
                <TH className="text-right">Prior</TH>
                <TH>Flag</TH>
              </TR>
            </THead>
            <tbody>
              <TR><TD>ApoB</TD><TD>&lt; 90 mg/dL</TD><TD numeric>132</TD><TD numeric>128</TD><TD><Badge tone="crit">High</Badge></TD></TR>
              <TR><TD>LDL-C</TD><TD>&lt; 100 mg/dL</TD><TD numeric>148</TD><TD numeric>142</TD><TD><Badge tone="crit">High</Badge></TD></TR>
              <TR><TD>HDL-C</TD><TD>&gt; 40 mg/dL</TD><TD numeric>52</TD><TD numeric>51</TD><TD><Badge tone="ok">In range</Badge></TD></TR>
              <TR><TD>Lp(a)</TD><TD>&lt; 50 nmol/L</TD><TD numeric>78</TD><TD numeric>—</TD><TD><Badge tone="warn">Watch</Badge></TD></TR>
            </tbody>
          </Table>
        </Card>
      </div>
    </Section>
  );
}

// ───── State matrix ──────────────────────────────────────────────────────

function StateMatrixSection() {
  return (
    <Section n="09" title="State Matrix" rule="Every interactive component must handle default / hover / focus / active / disabled / loading / empty / error. Empty and loading are the most skipped.">
      <div className="grid grid-cols-3 gap-3">
        <StateDemo label="Default"><Button variant="primary">Sign order</Button></StateDemo>
        <StateDemo label="Hover (simulated)"><Button variant="primary" className="bg-accent-hover">Sign order</Button></StateDemo>
        <StateDemo label="Focus (Tab to focus)"><Button variant="primary">Sign order</Button></StateDemo>
        <StateDemo label="Disabled"><Button variant="primary" disabled>Sign order</Button></StateDemo>
        <StateDemo label="Loading"><Button variant="primary" disabled>Signing…</Button></StateDemo>
        <StateDemo label="Empty">
          <div className="rounded-card border border-dashed border-border p-4 text-center">
            <div className="t-ui text-text-secondary mb-1">No orders pending</div>
            <div className="t-caption">Nothing requires your signature.</div>
          </div>
        </StateDemo>
        <StateDemo label="Error">
          <div className="rounded-card border border-status-crit/40 bg-[rgba(232,96,76,0.06)] p-3">
            <div className="t-ui text-status-crit mb-0.5">Could not sign</div>
            <div className="t-caption">Pharmacy handoff failed. Retry or escalate.</div>
          </div>
        </StateDemo>
        <StateDemo label="Skeleton">
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded-sm bg-white/[.04] animate-pulse" />
            <div className="h-3 w-1/2 rounded-sm bg-white/[.04] animate-pulse" />
          </div>
        </StateDemo>
      </div>
    </Section>
  );
}

function StateDemo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border-subtle p-4">
      <div className="t-label mb-3">{label}</div>
      {children}
    </div>
  );
}

function SegmentedControlDemo() {
  const [v, setV] = React.useState("care-plan");
  return (
    <SegmentedControl
      value={v}
      onChange={setV}
      options={[
        { value: "care-plan", label: "Care Plan" },
        { value: "risk-models", label: "Risk Models" },
        { value: "emr", label: "EMR" },
      ]}
    />
  );
}

// ───── Banned patterns ──────────────────────────────────────────────────

function BannedPatternsSection() {
  return (
    <Section n="10" title="Banned Patterns" rule="Enforced by tests where possible, by code review otherwise. AI agents must read this list from tokens.json › banned_patterns before generating.">
      <ul className="space-y-2">
        {tokens.banned_patterns.map((p) => (
          <li key={p.id} className="flex gap-3 items-start rounded-card border border-border-subtle p-3">
            <Badge tone="crit">✗</Badge>
            <div className="min-w-0">
              <div className="t-ui text-text">{p.rule}</div>
              <div className="t-meta">id: {p.id}</div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ───── Clinical showcase ─────────────────────────────────────────────────

function ClinicalSection() {
  return (
    <Section n="11" title="Clinical Components" rule="Meridian-native. The 30% no off-the-shelf system ships. Each encodes a skill: PatientBanner, Flowsheet, DomainPane, DecisionCard.">
      <div className="space-y-8">
        <div>
          <div className="t-label mb-2">PatientBanner</div>
          <div className="rounded-card overflow-hidden border border-border">
            <PatientBanner
              identity={{ name: "Chen, Maya K.", mrn: "MRN 0041829", dob: "Jul 11 1973", age: 52, sex: "F" }}
              vitals={{ weight: "68.4 kg", bmi: "24.1", bp: "124/78", hr: "62" }}
              problems={["ATM heterozygous (pathogenic)", "Hyperlipidemia", "Pre-diabetes (A1c 5.8)"]}
              medsAllergies={{
                meds: ["Atorvastatin 20 mg qHS", "Metformin 500 mg BID", "Vit D3 2000 IU"],
                allergies: "NKDA",
              }}
            />
          </div>
        </div>

        <div>
          <div className="t-label mb-2">Flowsheet — Lipid panel</div>
          <Flowsheet
            groupTitle="Lipid Panel · 18-mo trend"
            dates={["Oct '24", "Feb '25", "Aug '25", "Feb '26"]}
            rows={[
              { analyte: "ApoB", unit: "mg/dL", range: "< 90", values: ["142", "138", "132", "132"], flag: "crit" },
              { analyte: "LDL-C", unit: "mg/dL", range: "< 100", values: ["168", "152", "148", "148"], flag: "crit" },
              { analyte: "HDL-C", unit: "mg/dL", range: "> 40", values: ["48", "50", "51", "52"], flag: null },
              { analyte: "TG", unit: "mg/dL", range: "< 150", values: ["110", "104", "98", "92"], flag: null },
              { analyte: "Lp(a)", unit: "nmol/L", range: "< 50", values: [null, "78", null, "78"], flag: "warn" },
            ]}
          />
        </div>

        <div>
          <div className="t-label mb-2">DomainPane — Cardiovascular</div>
          <DomainPane
            name="Cardiovascular"
            hero={{ value: "14.2%", label: "10-yr ASCVD risk", delta: "+2.1 vs prior", trend: "up" }}
            drivers={[
              { label: "ApoB 132 mg/dL",       weight: "HR 1.42", contribution: "+3.8%" },
              { label: "Lp(a) 78 nmol/L",      weight: "HR 1.24", contribution: "+2.1%" },
              { label: "Systolic BP 128 mmHg", weight: "HR 1.18", contribution: "+1.4%" },
              { label: "Pre-diabetes A1c 5.8", weight: "HR 1.12", contribution: "+0.9%" },
            ]}
            evidence="PREVENT (AHA 2023) · ACC/AHA 2019 · ESC 2021"
            onOpenCarePlan={() => alert("→ Care Plan")}
          />
        </div>

        <div>
          <div className="t-label mb-2">DecisionCard — Care Plan actions</div>
          <div className="grid grid-cols-2 gap-3">
            <DecisionCard
              kicker="Action 01 · Cardiovascular"
              do="Rosuvastatin 10 mg qHS"
              why="ApoB 132 + Lp(a) 78 → 10-yr ASCVD 14.2%. Statin is first-line."
              goal="ApoB < 90 mg/dL by Oct 2026"
              evidence="PREVENT (AHA 2023) · ACC/AHA 2019"
            />
            <DecisionCard
              tone="urgent"
              kicker="Action 02 · Screening"
              do="Pancreatic MRCP — schedule now"
              why="ATM heterozygous + pancreatic Ca family hx. Screening never completed."
              goal="MRCP complete by Jun 2026, annual thereafter"
              evidence="NCCN Genetic/Familial v2.2025"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}


