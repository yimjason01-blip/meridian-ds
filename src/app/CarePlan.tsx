import * as React from "react";
import { DecisionCard } from "../clinical/DecisionCard";
import { ReorderableList, type ReorderableItem } from "../primitives/ReorderableCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../primitives/Tabs";
import { AskTrigger, useAsk } from "../primitives/Ask";
import { patient } from "./data";
import { cn } from "../lib/cn";

type Severity = "High" | "Moderate" | "Low";

type Action = {
  do: string;
  why: string;
  goal: string;
  evidence: string;
  tone?: "urgent";
  kicker?: string;
  /** Marker for physician-authored candidates so we can distinguish origin if needed */
  author?: "meridian" | "physician";
};

/**
 * Care Plan — two sub-tabs:
 *   · Top 3  — read-only view of the first 3 actions in the master list.
 *   · All    — the full ranked queue (up to N) where reordering + new-action authoring happens.
 *
 * The master list lives on CarePlan. Top 3 reflects whatever the physician
 * has arranged in All. No separate state, no sync.
 */
export function CarePlan() {
  const [actions, setActions] = React.useState<Action[]>(
    (patient.actions as Action[]).map((a) => ({ ...a, author: "meridian" }))
  );
  const [tab, setTab] = React.useState("all");
  const { openPane } = useAsk();

  const reorder = (from: number, to: number) => {
    setActions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const addAction = (a: Action) => {
    setActions((prev) => [...prev, { ...a, author: "physician" }]);
  };

  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <div className="t-label mb-1">Care Plan</div>
          <p className="t-body max-w-[60ch] text-text-secondary">
            Arrange the top candidates in <span className="text-text">All</span>. The top three surface in <span className="text-text">Top 3</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="t-meta text-text-muted tabular-nums">
            {actions.length} candidates
          </span>
          <button
            onClick={() =>
              openPane({
                query: "Walk me through this care plan — rank rationale and what's missing.",
                anchor: { label: "this care plan" },
              })
            }
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border",
              "text-[12px] text-text-muted hover:text-text-secondary hover:border-border-strong",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            )}
            title="Open Ask pane with plan-level context"
          >
            <SparkleIcon /> Ask about this plan
          </button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="top3">Top 3</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="top3" className="pt-6">
          <Top3Pane actions={actions.slice(0, 3)} onJumpToAll={() => setTab("all")} />
        </TabsContent>

        <TabsContent value="all" className="pt-6">
          <AllPane
            actions={actions}
            onReorder={reorder}
            onAdd={addAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M6 0.5 L7 4.5 L11 5.5 L7 6.5 L6 10.5 L5 6.5 L1 5.5 L5 4.5 Z" opacity=".9" />
    </svg>
  );
}

// ─── Top 3 pane ──────────────────────────────────────────────────────────

function Top3Pane({ actions, onJumpToAll }: { actions: Action[]; onJumpToAll: () => void }) {
  if (actions.length === 0) {
    return (
      <p className="t-body text-text-muted">
        No candidates yet. Add one in{" "}
        <button onClick={onJumpToAll} className="underline hover:text-text">All</button>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="t-meta text-text-muted">
        Read-only. To change the top three, reorder in{" "}
        <button onClick={onJumpToAll} className="underline hover:text-text">All</button>.
      </p>
      <div className="flex flex-col gap-3">
        {actions.map((a, i) => (
          <article
            key={i}
            className="bg-white/[.02] border border-border rounded-card overflow-hidden"
          >
            <div className="flex items-baseline gap-3 px-4 h-[52px] border-b border-border-subtle">
              <span className="t-mono text-[15px] text-text w-6 tabular-nums text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate text-[15px] font-[510] text-text">{a.do}</span>
              <span className="t-meta">{metaFor(a).join(" · ")}</span>
            </div>
            <DecisionCard
              do={a.do}
              why={a.why}
              goal={a.goal}
              evidence={a.evidence}
              tone={a.tone}
              className="!rounded-none !border-0"
            />
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── All pane ────────────────────────────────────────────────────────────

function AllPane({
  actions,
  onReorder,
  onAdd,
}: {
  actions: Action[];
  onReorder: (from: number, to: number) => void;
  onAdd: (a: Action) => void;
}) {
  const [adding, setAdding] = React.useState(false);

  const items: ReorderableItem[] = actions.map((a, i) => ({
    id: `action-${i}-${a.do.slice(0, 28)}`,
    title: a.do,
    meta: metaFor(a),
    rowAction: <AskTrigger label={a.do} kind="action" />,
    body: (
      <DecisionCard
        do={a.do}
        why={a.why}
        goal={a.goal}
        evidence={a.evidence}
        tone={a.tone}
        evidenceAction={
          <AskTrigger
            label={a.evidence || `evidence for: ${a.do}`}
            kind="evidence"
            variant="link"
          />
        }
        className="!rounded-none !border-0"
      />
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="t-meta text-text-muted">
          Drag to reorder. Positions 1–3 become the Top 3.
        </p>
      </div>

      <ReorderableList
        items={items}
        onReorder={onReorder}
        ariaLabel="All care plan action candidates. Drag to reorder by priority."
      />

      {/* Add candidate — inline, never a modal */}
      <div className="pt-2">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3",
              "border border-dashed border-border rounded-card",
              "text-text-secondary hover:text-text hover:border-border-strong",
              "text-[13px] transition-colors",
              "focus-visible:outline-none focus-visible:border-border-strong"
            )}
          >
            <PlusIcon /> Add action candidate
          </button>
        ) : (
          <AddCandidateForm
            onSave={(a) => {
              onAdd(a);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </div>

      <p className="t-meta text-text-muted">
        New candidates land at the bottom of the list. Drag them to the position you want.
      </p>
    </div>
  );
}

// ─── Add Candidate form ──────────────────────────────────────────────────

function AddCandidateForm({
  onSave,
  onCancel,
}: {
  onSave: (a: Action) => void;
  onCancel: () => void;
}) {
  const [doText, setDoText] = React.useState("");
  const [why, setWhy] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [evidence, setEvidence] = React.useState("");
  const [severity, setSeverity] = React.useState<Severity>("Moderate");
  const [timing, setTiming] = React.useState("next visit");

  const valid = doText.trim().length > 0 && why.trim().length > 0;
  const doRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    doRef.current?.focus();
  }, []);

  const submit = () => {
    if (!valid) return;
    onSave({
      do: doText.trim(),
      why: why.trim(),
      goal: goal.trim() || "—",
      evidence: evidence.trim() || "Physician-authored",
      tone: severity === "High" ? "urgent" : undefined,
      // Store severity + timing on a kicker-like meta string for now.
      // Meta extraction reads these back via metaFor() using tone heuristic.
      kicker: `Added · ${severity} · ${timing}`,
      author: "physician",
    });
  };

  return (
    <article className="bg-white/[.02] border border-border rounded-card p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="t-label">New action candidate</span>
        <span className="t-meta text-text-muted">Inline form · Esc to cancel</span>
      </div>

      <Field label="Do">
        <textarea
          ref={doRef}
          value={doText}
          onChange={(e) => setDoText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
          rows={2}
          placeholder="Order, prescribe, counsel, refer…"
          className={cn(
            "w-full bg-transparent resize-none text-[14px] leading-snug text-text",
            "placeholder:text-text-muted focus:outline-none"
          )}
        />
      </Field>

      <Field label="Why">
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
          rows={2}
          placeholder="Clinical rationale — data, trend, guideline driver"
          className="w-full bg-transparent resize-none text-[14px] leading-snug text-text placeholder:text-text-muted focus:outline-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Goal (optional)">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
            placeholder="Target + by when"
            className="w-full bg-transparent text-[14px] text-text placeholder:text-text-muted focus:outline-none"
          />
        </Field>
        <Field label="Evidence (optional)">
          <input
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
            placeholder="Guideline / trial reference"
            className="w-full bg-transparent text-[14px] text-text placeholder:text-text-muted focus:outline-none"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Severity">
          <Segmented
            value={severity}
            onChange={(v) => setSeverity(v as Severity)}
            options={["High", "Moderate", "Low"]}
          />
        </Field>
        <Field label="Timing">
          <input
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
            placeholder="30 d · next visit · 90 d"
            className="w-full bg-transparent text-[14px] text-text placeholder:text-text-muted focus:outline-none"
          />
        </Field>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <button
          onClick={onCancel}
          className="t-meta text-text-secondary hover:text-text"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!valid}
          className={cn(
            "text-[13px] px-3 py-1.5 rounded-sm border border-border",
            "hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          )}
        >
          Add to queue
        </button>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="t-label">{label}</span>
      <div className="border border-border rounded-sm px-2 py-1.5 focus-within:border-border-strong bg-transparent">
        {children}
      </div>
    </label>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "text-[13px] px-2 py-1 rounded-sm border",
              active
                ? "border-border-strong text-text"
                : "border-border text-text-muted hover:text-text-secondary"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M7 1.5 v11 M1.5 7 h11" strokeLinecap="round" />
    </svg>
  );
}

// ─── Meta derivation (severity · timing) ────────────────────────────────

function metaFor(a: Action): string[] {
  // Physician-authored actions carry `kicker: "Added · Severity · timing"`
  if (a.author === "physician" && a.kicker?.startsWith("Added ·")) {
    const parts = a.kicker.split(" · ").slice(1);
    if (parts.length === 2) return parts;
  }
  // Meridian-authored: derive from tone
  const severity = a.tone === "urgent" ? "High" : "Moderate";
  const timing = a.tone === "urgent" ? "30 d" : "next visit";
  return [severity, timing];
}
