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
import { ReorderableList } from "../primitives/ReorderableCard";
import { AskProvider, AskInline, AskPane, AskCommand, AskTrigger, AskLauncher, useAsk } from "../primitives/Ask";
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
        <ReorderableCardSection />
        <AskSection />
        <StateMatrixSection />
        <BannedPatternsSection />
        <ClinicalSection />
      </main>
      <footer className="max-w-[1200px] mx-auto px-6 py-10 border-t border-border-subtle mt-16">
        <div className="t-meta">Meridian MD DS v1.4 · Locked 2026-04-18 · tokens.json is source of truth</div>
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
        <span className="t-meta">v1.4 · dark-only · Linear-native · shadcn/Radix primitives</span>
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




// ───── ReorderableCard (dedicated section) ───────────────────────────────
// Self-contained: uses only Card/CardHeader/Badge/ReorderableList imports
// above. Does not mutate or depend on any other section. Iterable in place.

function ReorderableCardSection() {
  return (
    <Section
      n="09"
      title="ReorderableCard"
      rule="A thin-row card that lets the physician author the order of a list of peer clinical actions by drag. Grip-only drag, accordion-inline expand, keyboard-first reorder. Used in Care Plan (Top N active queue). Deferred / declined / superseded lists are NOT reorderable — they carry a status reason, not a priority."
    >
      <div className="grid grid-cols-1 gap-6">
        <RC_Anatomy />
        <RC_States />
        <RC_Variants />
        <RC_LiveDemo />
        <RC_Rules />
      </div>
    </Section>
  );
}

// ─── Anatomy ────────────────────────────────────────────────────────────

function RC_Anatomy() {
  return (
    <Card>
      <CardHeader>Anatomy — collapsed row (60 px)</CardHeader>
      <div className="flex flex-col gap-4">
        <div className="flex items-center h-[60px] px-2 gap-3 rounded-card border border-border bg-white/[.02] relative">
          <AnatomySpan label="grip" color="accent-hover">
            <div className="flex items-center justify-center w-6 h-10 text-text-muted">
              <Grip />
            </div>
          </AnatomySpan>
          <AnatomySpan label="priority" color="status-ok">
            <span className="t-mono text-[15px] text-text w-6 tabular-nums text-right">02</span>
          </AnatomySpan>
          <AnatomySpan label="title" color="accent-bright" className="flex-1 min-w-0">
            <span className="truncate text-[15px] font-[510] text-text block">Order pancreatic MRCP — schedule within 30 d</span>
          </AnatomySpan>
          <AnatomySpan label="meta" color="status-warn">
            <span className="t-meta">High · 30 d</span>
          </AnatomySpan>
          <AnatomySpan label="caret" color="text-muted">
            <div className="flex items-center justify-center w-6 h-6 text-text-muted"><Caret /></div>
          </AnatomySpan>
        </div>

        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-ui">
          <dt className="t-label">grip</dt>
          <dd className="text-text-secondary">24 px hit area · 6-dot glyph · <code className="t-mono text-text-muted">cursor: grab</code> → <code className="t-mono text-text-muted">grabbing</code>. Only draggable surface. Click-elsewhere routes to expand.</dd>

          <dt className="t-label">priority</dt>
          <dd className="text-text-secondary">Monospace, tabular numerals, 24 px column. Value = list index + 1. Re-renders on drop — never stale.</dd>

          <dt className="t-label">title</dt>
          <dd className="text-text-secondary">One line. Truncates with ellipsis. Click → expand. <code className="t-mono text-text-muted">font-weight: 510</code>.</dd>

          <dt className="t-label">meta</dt>
          <dd className="text-text-secondary">Max 2 tokens, dot-separated (<code className="t-mono text-text-muted">·</code>). Triage shape: severity · time-to-action.</dd>

          <dt className="t-label">caret</dt>
          <dd className="text-text-secondary">Disclosure indicator. Rotates 180° when expanded. Click toggles. <code className="t-mono text-text-muted">aria-expanded</code>.</dd>
        </dl>
      </div>
    </Card>
  );
}

function AnatomySpan({ label, color, children, className }: { label: string; color: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative group", className)}>
      {children}
      <span
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 translate-y-full t-meta whitespace-nowrap pointer-events-none"
        style={{ color: `var(--${color})` }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── State matrix ──────────────────────────────────────────────────────

function RC_States() {
  const demo = (extraClass = "", opts?: { dragging?: boolean; focus?: boolean; disabled?: boolean; expanded?: boolean }) => (
    <article
      className={cn(
        "bg-white/[.02] border border-border rounded-card overflow-hidden",
        opts?.dragging && "shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
        opts?.focus && "ring-1 ring-[var(--border-strong)]",
        opts?.disabled && "opacity-55",
        extraClass
      )}
    >
      <div className={cn("flex items-center h-[60px] px-2 gap-3", opts?.dragging && "bg-white/[.02]")}>
        <div className="flex items-center justify-center w-6 h-10 text-text-muted"><Grip /></div>
        <span className="t-mono text-[15px] text-text w-6 tabular-nums text-right">02</span>
        <span className="truncate text-[15px] font-[510] text-text flex-1">Order pancreatic MRCP</span>
        <span className="t-meta">High · 30 d</span>
        <div className={cn("flex items-center justify-center w-6 h-6 text-text-muted transition-transform", opts?.expanded && "rotate-180")}><Caret /></div>
      </div>
      {opts?.expanded && (
        <div className="border-t border-border-subtle p-4 t-body text-text-secondary">
          Expanded body (DecisionCard renders here in product).
        </div>
      )}
    </article>
  );

  return (
    <Card>
      <CardHeader>State matrix</CardHeader>
      <div className="grid grid-cols-2 gap-4">
        <StateCell label="default">{demo()}</StateCell>
        <StateCell label="hover" note="row bg → bg-hover">
          <div style={{ background: "var(--bg-hover)" }} className="rounded-card">
            {demo("!bg-transparent")}
          </div>
        </StateCell>
        <StateCell label="focus" note="1 px neutral ring on grip">{demo("", { focus: true })}</StateCell>
        <StateCell label="grabbing" note="card translates with cursor; shadow for lift (no accent, no opacity)">{demo("", { dragging: true })}</StateCell>
        <StateCell label="expanded" note="accordion inline, 180 ms">{demo("", { expanded: true })}</StateCell>
        <StateCell label="disabled" note="grip not draggable; opacity 0.55">{demo("", { disabled: true })}</StateCell>

        <StateCell label="siblings-shift" note="on drag, siblings translate to make room — no drop line, no accent color" className="col-span-2">
          <div className="flex flex-col gap-1.5">
            <div style={{ transform: "translateY(-66px)", transition: "transform 180ms ease-out" }}>{demo()}</div>
            <div style={{ transform: "translateY(24px)", transition: "none", zIndex: 2, position: "relative" }} className="shadow-[0_8px_24px_rgba(0,0,0,0.4)]">{demo()}</div>
            <div>{demo()}</div>
          </div>
        </StateCell>
      </div>
    </Card>
  );
}

function StateCell({ label, note, children, className }: { label: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline gap-3">
        <span className="t-label">{label}</span>
        {note && <span className="t-meta">{note}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Variants ──────────────────────────────────────────────────────────

function RC_Variants() {
  return (
    <Card>
      <CardHeader>Variants</CardHeader>
      <div className="grid grid-cols-[160px_1fr] gap-x-4 gap-y-4 text-ui items-start">
        <span className="t-label pt-1">list of 1</span>
        <p className="text-text-secondary">Grip hides. No reorder possible. Expand + interact still work. Priority number still renders (always <code className="t-mono text-text-muted">01</code>).</p>

        <span className="t-label pt-1">accordion (default)</span>
        <p className="text-text-secondary">Only one card expanded at a time. Opening a second collapses the first.</p>

        <span className="t-label pt-1">multi-expand (opt-in)</span>
        <p className="text-text-secondary">Multiple cards expanded simultaneously. Use only when comparing peer items side-by-side.</p>

        <span className="t-label pt-1">with-status-strip</span>
        <p className="text-text-secondary">Left 2 px border marker to encode tone (<Badge tone="crit">urgent</Badge> = status-crit). Passes through <code className="t-mono text-text-muted">tone</code> to the expanded DecisionCard so they match.</p>
      </div>
    </Card>
  );
}

// ─── Live demo ──────────────────────────────────────────────────────────

function RC_LiveDemo() {
  const [items, setItems] = React.useState([
    { id: "a", title: "Intensify statin: atorva 20 → rosuva 10 mg qHS",           meta: ["Moderate", "next visit"], body: <DemoBody n={1} /> },
    { id: "b", title: "Order pancreatic MRCP — schedule within 30 d",             meta: ["High", "30 d"],           body: <DemoBody n={2} /> },
    { id: "c", title: "Add GLP-1 agonist trial: semaglutide 0.25 mg SQ weekly",   meta: ["Moderate", "next visit"], body: <DemoBody n={3} /> },
    { id: "d", title: "Continue annual MRI + mammogram (alternating q6mo)",       meta: ["Moderate", "next visit"], body: <DemoBody n={4} /> },
    { id: "e", title: "Continue sleep hygiene protocol; add AM light therapy",    meta: ["Low", "ongoing"],         body: <DemoBody n={5} /> },
  ]);
  const onReorder = (from: number, to: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  };
  return (
    <Card>
      <CardHeader>Live demo</CardHeader>
      <p className="t-body text-text-secondary mb-4 max-w-[70ch]">
        Drag the grip. Or: Tab to a grip → Space to lift → ↑/↓ to move → Space to drop → Esc cancels. Priority numbers re-render on drop.
      </p>
      <ReorderableList items={items} onReorder={onReorder} ariaLabel="ReorderableCard demo" />
    </Card>
  );
}

function DemoBody({ n }: { n: number }) {
  return (
    <div className="p-4 grid grid-cols-[56px_1fr] gap-3 items-baseline">
      <span className="t-label">Do</span>
      <span className="text-[15px] text-text">Stand-in DecisionCard body #{n}. Product consumer renders the real Do/Why/Goal here.</span>
    </div>
  );
}

// ─── Rules ──────────────────────────────────────────────────────────────

function RC_Rules() {
  const rules = [
    ["Grip-only drag", "Cards with click-to-expand are not whole-card draggable. Prevents drag/click conflict."],
    ["Save-on-drop", "No confirm dialog. No Save Order button. Parent persists async; show a quiet flash if needed."],
    ["Priority re-renders", "Numbers always = index + 1. Never stale after drop."],
    ["One scope per surface", "Do not nest ReorderableCard inside ReorderableCard."],
    ["Deferred is not reorderable", "Deferred / declined / superseded items sort by status reason, not priority. Render in a separate non-draggable section."],
    ["No reorder on list of 1", "Grip hides. No phantom drag affordance."],
    ["Focus stays on grip after drop", "Keyboard reorder must not lose focus."],
    ["Accordion by default", "Only one card expanded at a time unless multi-expand is explicitly opted-in."],
  ];
  return (
    <Card>
      <CardHeader>Hard rules</CardHeader>
      <ul className="space-y-2">
        {rules.map(([name, desc]) => (
          <li key={name} className="grid grid-cols-[200px_1fr] gap-x-4 items-baseline">
            <span className="t-label">{name}</span>
            <span className="t-body text-text-secondary">{desc}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Icons (local, to avoid cross-section imports) ─────────────────────

function Grip() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden>
      <circle cx="2" cy="3" r="1.2" />
      <circle cx="8" cy="3" r="1.2" />
      <circle cx="2" cy="8" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="2" cy="13" r="1.2" />
      <circle cx="8" cy="13" r="1.2" />
    </svg>
  );
}
function Caret() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M1 1.5 L6 6.5 L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Ask section ───────────────────────────────────────────────────────

function AskSection() {
  return (
    <Section
      n="10"
      title="Ask — AI-assist"
      rule="How AI lives inside Meridian. One persistent launcher (icon-only, bottom-right) plus two surfaces: Inline popover for pointed questions bound to a specific element, and a push-pane for deliberation with memory. ⌘K is the keyboard accelerator, not a third surface."
    >
      <div className="grid grid-cols-1 gap-6">
        <AskModelCard />
        <AskLauncherDemo />
        <AskLiveDemo />
        <AskAnchors />
        <AskRules />
      </div>
    </Section>
  );
}

function AskModelCard() {
  const rows = [
    {
      name: "AskLauncher",
      when: "Always present, icon-only FAB",
      example: "Bottom-right corner, sparkle, inverted colors",
      memory: "n/a (opens the pane)",
      dismiss: "Hides itself when pane is open",
    },
    {
      name: "AskInline",
      when: "Pointed, ephemeral, anchor-bound",
      example: "Click tier badge → 'why T2?'",
      memory: "None",
      dismiss: "Outside click, Esc, submit, graduate",
    },
    {
      name: "AskPane",
      when: "Deliberating, persistent, global",
      example: "'Walk me through this patient'",
      memory: "Thread (survives close)",
      dismiss: "Explicit close (X) or collapse",
    },
    {
      name: "AskCommand (⌘K)",
      when: "Accelerator — keyboard entry",
      example: "⌘K → type → Enter → opens pane",
      memory: "Routes to pane",
      dismiss: "Esc, outside click",
    },
  ];
  return (
    <Card>
      <CardHeader>Model — two surfaces, one entry</CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>Surface</TH>
              <TH>When</TH>
              <TH>Example</TH>
              <TH>Memory</TH>
              <TH>Dismiss</TH>
            </TR>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.name}>
                <TD><span className="t-mono text-text">{r.name}</span></TD>
                <TD className="text-text-secondary">{r.when}</TD>
                <TD className="text-text-secondary">{r.example}</TD>
                <TD className="text-text-secondary">{r.memory}</TD>
                <TD className="text-text-secondary">{r.dismiss}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}

function AskLauncherDemo() {
  return (
    <Card>
      <CardHeader>Launcher — persistent, icon-only, bottom-right</CardHeader>
      <AskProvider>
        <div className="space-y-4">
          <div className="grid grid-cols-[160px_1fr] gap-x-4 gap-y-3 text-[13px] items-center">
            <span className="t-label">square (default)</span>
            <div className="flex items-center gap-4">
              <InlineLauncherPreview shape="square" />
              <span className="t-meta text-text-muted">44 × 44, rounded 10px, inverted colors</span>
            </div>

            <span className="t-label">circle</span>
            <div className="flex items-center gap-4">
              <InlineLauncherPreview shape="circle" />
              <span className="t-meta text-text-muted">Same footprint, fully round</span>
            </div>
          </div>

          <div className="relative rounded-card border border-border overflow-hidden h-[260px] bg-bg flex">
            <div className="flex-1 min-w-0 relative overflow-y-auto p-5 space-y-2">
              <div className="t-meta text-text-muted">MOCK CANVAS</div>
              <p className="t-body text-text-secondary max-w-[40ch]">
                Any surface. The launcher is present in the bottom-right regardless of what's here. Click it to open the pane.
              </p>
              <AskLauncher contained />
            </div>
            <AskPane widthPx={300} />
            <AskCommand />
            <AskInline />
          </div>

          <p className="t-meta text-text-muted">
            Click the launcher. Pane opens from the right edge. The launcher itself fades out while the pane is open — the pane has its own close X. Close the pane and the launcher returns.
          </p>
        </div>
      </AskProvider>
    </Card>
  );
}

function InlineLauncherPreview({ shape }: { shape: "square" | "circle" }) {
  // Static visual reference (not the live FAB) — rendered inline for compare.
  return (
    <div
      className={cn(
        "w-11 h-11 flex items-center justify-center",
        shape === "circle" ? "rounded-full" : "rounded-[10px]",
        "bg-text text-bg",
        "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]"
      )}
    >
      <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <path d="M6 0.75 L7.15 4.85 L11.25 6 L7.15 7.15 L6 11.25 L4.85 7.15 L0.75 6 L4.85 4.85 Z" />
      </svg>
    </div>
  );
}

function AskLiveDemo() {
  return (
    <Card>
      <CardHeader>Live demo — canvas resizes, pane never overlays</CardHeader>
      <AskProvider>
        <AskDemoBody />
        <AskInline />
        <AskCommand />
      </AskProvider>
    </Card>
  );
}

function AskDemoBody() {
  const { openCommand, paneOpen, openPane, closePane } = useAsk();
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={openCommand}
          className="t-meta px-2 py-1 rounded-sm border border-border hover:border-border-strong"
        >
          ⌘K command palette
        </button>
        <button
          onClick={() => (paneOpen ? closePane() : openPane())}
          className="t-meta px-2 py-1 rounded-sm border border-border hover:border-border-strong"
        >
          {paneOpen ? "Close pane" : "Open pane"}
        </button>
        <span className="t-meta text-text-muted">
          Click any <span className="t-mono text-text-secondary">Ask</span> chip below to open inline.
        </span>
      </div>

      {/* Layout: canvas + pane. This is the contract. */}
      <div className="flex h-[520px] rounded-card border border-border overflow-hidden bg-bg">
        <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-4">
          <div className="t-meta text-text-muted">MOCK EMR CANVAS</div>

          <article className="rounded-card border border-border bg-white/[.02] p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-[510] text-text">Chronic Kidney Disease</span>
              <div className="flex items-center gap-2">
                <span className="t-mono text-[12px] text-text-secondary">Tier T2</span>
                <AskTrigger label="CKD tier T2" kind="risk-model" />
              </div>
            </div>
            <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-1.5 text-[13px]">
              <dt className="t-label">eGFR</dt>
              <dd className="text-text-secondary flex items-center gap-1.5">
                52 mL/min/1.73m² <span className="t-meta text-text-muted">(−18% / 14 mo)</span>
                <AskTrigger label="eGFR 52 mL/min" kind="value" variant="icon" />
              </dd>
              <dt className="t-label">UACR</dt>
              <dd className="text-text-secondary flex items-center gap-1.5">
                108 mg/g <span className="t-meta text-text-muted">(was 32)</span>
                <AskTrigger label="UACR 108 mg/g" kind="value" variant="icon" />
              </dd>
              <dt className="t-label">BP</dt>
              <dd className="text-text-secondary">128 / 76 · at target</dd>
            </dl>
          </article>

          <article className="rounded-card border border-border bg-white/[.02] p-4 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="t-mono text-[13px] text-text-secondary">01</span>
                <span className="text-[15px] font-[510] text-text">Titrate ACEi to max-tolerated dose</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="t-meta">High · 2 wk</span>
                <AskTrigger label="ACEi titration action" kind="action" />
              </div>
            </div>
            <p className="t-meta text-text-muted">
              Source: Meridian CKD model v2.3 · Evidence bundle #127 <AskTrigger label="Evidence bundle #127" kind="evidence" variant="link" className="ml-2" />
            </p>
          </article>

          <article className="rounded-card border border-border bg-white/[.02] p-4 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="t-mono text-[13px] text-text-secondary">02</span>
                <span className="text-[15px] font-[510] text-text">Order UACR q3mo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="t-meta">Mod · 90 d</span>
                <AskTrigger label="UACR q3mo action" kind="action" />
              </div>
            </div>
          </article>
        </div>

        {/* The pane is a SIBLING of the canvas. Canvas narrows when open. */}
        <AskPane widthPx={380} />
      </div>

      <p className="t-meta text-text-muted">
        Notice: when the pane opens, the canvas narrows from the left. Nothing is hidden behind an overlay. The inline popover appears next to whatever you clicked.
      </p>
    </div>
  );
}

function AskAnchors() {
  return (
    <Card>
      <CardHeader>Trigger variants</CardHeader>
      <AskProvider>
        <div className="space-y-4">
          <div className="grid grid-cols-[160px_1fr] gap-x-4 gap-y-3 text-[13px] items-center">
            <span className="t-label">chip (default)</span>
            <div><AskTrigger label="Demo chip" /></div>

            <span className="t-label">icon</span>
            <div><AskTrigger label="Demo icon" variant="icon" /></div>

            <span className="t-label">link</span>
            <div><AskTrigger label="Demo link" variant="link" /></div>
          </div>
          <p className="t-meta text-text-muted">
            Place the chip beside a header. Use the icon inside dense rows (lab values, timeline nodes). Use the link in evidence footers.
          </p>
        </div>
        <AskInline />
      </AskProvider>
    </Card>
  );
}

function AskRules() {
  const rules: [string, string][] = [
    ["launcher-icon-only", "The persistent launcher is icon-only. No copy, no label. Sparkle glyph in the bottom-right corner. Physicians figure it out once."],
    ["launcher-inverted-chrome", "The launcher uses inverted colors (bg-text on text-bg surface) to stand out. It is the one exception to the neutral-chrome rule for AI — because it's the only always-present entry point, it must register."],
    ["launcher-autohide", "When the pane is open, the launcher fades out. The pane's own close X is the way back. Two close affordances at once is noise."],
    ["no-pane-overlay-on-primary-canvas", "Where it fits, pane is a flex sibling of the primary canvas and narrows it. Where the primary canvas is complex or fixed (e.g. cross-section app chrome), the pane is fixed right-dock with a shadow — still no content is hidden behind it, because the primary canvas accounts for the pane width."],
    ["source-on-every-answer", "Every assistant message renders a source line (model name + version, or evidence bundle reference)."],
    ["two-surfaces-max", "Inline + Pane. ⌘K is an accelerator. Launcher is an entry button. No floating chatbots, no sidebar toggles, no third panel."],
    ["graduation-path", "Inline has a 'Continue in thread' action that lifts query + anchor label into the pane. Without it, physicians re-type or lose the thread."],
    ["neutral-chrome-everywhere-else", "Ask triggers inside content use neutral borders + text-muted. No accent color. Accent is reserved for CTA / active / selected."],
    ["anchor-bound", "Inline appears next to the element the physician clicked — max 380 px wide, flips above if no room below."],
  ];
  return (
    <Card>
      <CardHeader>Hard rules</CardHeader>
      <ul className="space-y-3">
        {rules.map(([name, desc]) => (
          <li key={name} className="grid grid-cols-[200px_1fr] gap-x-4 items-baseline">
            <span className="t-label">{name}</span>
            <span className="t-body text-text-secondary">{desc}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

