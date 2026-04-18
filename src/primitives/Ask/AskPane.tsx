import * as React from "react";
import { X, CornerDownLeft, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAsk } from "./AskProvider";

/**
 * AskPane — persistent thread pane.
 *
 * NOT a portal. NOT an overlay. It is a sibling flex child of the canvas.
 * When open, the canvas narrows. When closed, it collapses to 0 width.
 * This is the ONLY correct rendering model — if you portal this, you've
 * broken the zero-occlusion contract.
 *
 * Place inside a parent with `display: flex` next to the canvas:
 *   <div className="flex">
 *     <Canvas className="flex-1 min-w-0" />
 *     <AskPane />
 *   </div>
 */
export function AskPane({ widthPx = 420 }: { widthPx?: number }) {
  const { paneOpen, closePane, thread, appendMessage, resetThread } = useAsk();
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-respond to user messages (mock)
  React.useEffect(() => {
    const last = thread[thread.length - 1];
    if (!last || last.role !== "user") return;
    setLoading(true);
    const t = setTimeout(() => {
      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        text: mockAnswer(last.text, last.anchorLabel),
        source: sourceFor(last.anchorLabel),
        anchorLabel: last.anchorLabel,
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.length]);

  // Auto-scroll
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread, loading]);

  const submit = () => {
    if (!q.trim()) return;
    appendMessage({ id: crypto.randomUUID(), role: "user", text: q });
    setQ("");
  };

  return (
    <aside
      aria-hidden={!paneOpen}
      style={{ width: paneOpen ? widthPx : 0 }}
      className={cn(
        "shrink-0 border-l border-border-subtle bg-bg-surface",
        "transition-[width] duration-200 ease-out overflow-hidden",
        "flex flex-col"
      )}
    >
      <div className="flex flex-col h-full" style={{ width: widthPx }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-border-subtle shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-[510] text-text">Ask Meridian</span>
            <span className="t-meta text-text-muted">{thread.length ? `· ${thread.length} turns` : ""}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetThread}
              className="t-meta text-text-muted hover:text-text px-1.5 py-1"
              aria-label="Clear thread"
              title="Clear thread"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={closePane}
              className="text-text-muted hover:text-text p-1"
              aria-label="Close pane"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {thread.length === 0 && <EmptyState />}
          {thread.map((m) => (
            <Message key={m.id} m={m} />
          ))}
          {loading && <LoadingBubble />}
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle p-3 shrink-0">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about risk, actions, evidence…"
            rows={2}
            className={cn(
              "w-full resize-none bg-transparent text-[14px] leading-snug text-text",
              "placeholder:text-text-muted focus:outline-none"
            )}
          />
          <div className="flex items-center justify-between pt-2">
            <span className="t-meta text-text-muted">
              <CornerDownLeft size={11} className="inline align-[-2px]" /> send · Shift+Enter newline
            </span>
            <button
              onClick={submit}
              disabled={!q.trim()}
              className={cn(
                "t-meta px-2 py-1 rounded-sm border border-border",
                "hover:border-border-strong disabled:opacity-50"
              )}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Message({ m }: { m: { role: "user" | "assistant"; text: string; source?: string; anchorLabel?: string } }) {
  const isUser = m.role === "user";
  return (
    <div className={cn("space-y-1", isUser && "pl-6")}>
      {m.anchorLabel && (
        <div className="t-meta text-text-muted">Re: {m.anchorLabel}</div>
      )}
      <div
        className={cn(
          "text-[14px] leading-relaxed",
          isUser ? "text-text-secondary" : "text-text"
        )}
      >
        {m.text}
      </div>
      {m.source && <div className="t-meta text-text-muted pt-0.5">{m.source}</div>}
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex items-center gap-1.5 text-text-muted">
      <span className="t-meta">Thinking</span>
      <span className="flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-text-muted animate-pulse [animation-delay:0ms]" />
        <span className="w-1 h-1 rounded-full bg-text-muted animate-pulse [animation-delay:150ms]" />
        <span className="w-1 h-1 rounded-full bg-text-muted animate-pulse [animation-delay:300ms]" />
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-text-muted space-y-2">
      <p className="t-body">No turns yet. Try:</p>
      <ul className="t-meta space-y-1">
        <li>· Walk me through the cardiovascular story for this patient</li>
        <li>· Re-rank these actions if cost was the primary constraint</li>
        <li>· Draft a patient-facing version of the plan</li>
      </ul>
    </div>
  );
}

function mockAnswer(q: string, anchorLabel?: string): string {
  const subject = anchorLabel ?? "this patient";
  const lower = q.toLowerCase();
  if (lower.includes("rank") || lower.includes("priori") || lower.includes("order") || lower.includes("cost")) {
    return `If cost-to-impact is the constraint, I'd re-rank: 1) Pancreatic MRCP (high impact, surveillance-only cost), 2) Statin step-up (cheap, high yield), 3) CGM trial (moderate cost, informs #4). GLP-1 drops to #6; highest cost per unit impact at this stage.`;
  }
  if (lower.includes("missing") || lower.includes("gap")) {
    return `Gaps vs. risk profile: no colorectal surveillance plan (age 52, ATM carrier — consider colonoscopy interval review), no thyroid screen (autoimmune risk with peri-menopause), and no cardiac calcium score despite ApoB 132 × 18 mo. Want me to draft candidates for these?`;
  }
  if (lower.includes("draft") || lower.includes("patient")) {
    return `"Three priorities we're locking in today: (1) a one-time pancreatic MRI because of your ATM result and your dad's history, (2) a step-up on the cholesterol medication you're on, and (3) starting a weekly injection to help with the blood-sugar trend we've been watching. We'll recheck labs in 12 weeks."`;
  }
  if (lower.includes("defer") || lower.includes("break") || lower.includes("wait")) {
    return `Deferring the top action 60 days: if #1 is the MRCP, low incremental risk at 60 d (surveillance window tolerates it). If #1 is the statin step-up, ApoB stays ~132 — adds ~0.4% to 10-yr CV risk. Deferring both past 90 days moves the care plan out of guideline-concordant range.`;
  }
  if (lower.includes("why")) {
    return `${subject} is in the queue because the model weights it as one of the highest preventable-risk deltas at 12 months for this patient's driver stack. Top contributors are ATM heterozygous status, ApoB 132 on treatment, and HOMA-IR 4.2 trajectory.`;
  }
  if (lower.includes("alternative") || lower.includes("instead")) {
    return `Alternatives to ${subject}: if first-line is contraindicated or declined, the model surfaces step-therapy options scored by same-mechanism efficacy. For statin intolerance: ezetimibe mono → bempedoic acid → PCSK9 inhibitor. For GLP-1: tirzepatide, or lifestyle-only with CGM-guided iteration.`;
  }
  if (lower.includes("evidence") || lower.includes("study") || lower.includes("source")) {
    return `Threshold for ${subject} derives from the cited guidelines and Meridian's cohort calibration (n=48,200). AUC on this subgroup is 0.82 at 5-year horizon. Full evidence bundle with study-by-study pull is one click away.`;
  }
  return `On ${subject}: the relevant inputs are the patient's current driver stack (ATM carrier, lipid profile, metabolic trajectory) and the goal horizon (12 mo preventable risk). Want the driver decomposition or the evidence bundle?`;
}

function sourceFor(anchorLabel?: string): string {
  if (!anchorLabel) return "Source: Meridian composite risk models v2.3";
  if (anchorLabel.toLowerCase().includes("cv")) return "Source: Meridian CVD model v2.3 · ASCVD + Meridian cohort calibration";
  if (anchorLabel.toLowerCase().includes("ckd")) return "Source: Meridian CKD model v2.3 · KDIGO 2024 + cohort (n=48,200)";
  return "Source: Meridian composite risk models v2.3";
}
