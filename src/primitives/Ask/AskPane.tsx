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
  if (lower.includes("walk") || lower.includes("story") || lower.includes("summary")) {
    return `${subject}: CKD tier T2 driven by eGFR slope (-18% / 14 mo) and rising UACR (32 → 108). BP control at target (128/76) is the strongest modifiable lever per the model. CV tier T2 is secondary — coupled to metabolic.`;
  }
  if (lower.includes("rank") || lower.includes("priori") || lower.includes("order")) {
    return `Re-ranked by cost-to-impact ratio: 1) ACEi titration (high impact, low cost), 2) UACR q3mo monitoring (diagnostic, low cost), 3) Nephrology referral (high cost, deferred if ACEi response at 8wk is adequate).`;
  }
  if (lower.includes("draft") || lower.includes("patient")) {
    return `"Your kidney numbers have shifted in a direction we want to address now, not wait on. Two steps: adjust a BP medication you're already on, and recheck a urine test in 3 months. We'll revisit at the next visit."`;
  }
  return `On ${subject}: the relevant drivers are eGFR slope, UACR, and BP control. The model weights BP control highest for 5-year horizon. Want the driver stack or evidence bundle?`;
}

function sourceFor(anchorLabel?: string): string {
  if (!anchorLabel) return "Source: Meridian composite risk models v2.3";
  if (anchorLabel.toLowerCase().includes("cv")) return "Source: Meridian CVD model v2.3 · ASCVD + Meridian cohort calibration";
  if (anchorLabel.toLowerCase().includes("ckd")) return "Source: Meridian CKD model v2.3 · KDIGO 2024 + cohort (n=48,200)";
  return "Source: Meridian composite risk models v2.3";
}
