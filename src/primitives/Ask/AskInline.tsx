import * as React from "react";
import { CornerDownLeft, ArrowRight, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAsk } from "./AskProvider";

/**
 * AskInline — ephemeral popover bound to an anchor element.
 *
 * Positioning: fixed, computed from anchor rect. Flips to above if no room below.
 * Dismiss: outside click, Esc, submit, or "Continue in thread".
 * Max width: 380px. Never occludes more than one adjacent card.
 */
export function AskInline() {
  const { inlineAnchor, closeInline, graduateToPane } = useAsk();
  const [q, setQ] = React.useState("");
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const popRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Reset when anchor changes
  React.useEffect(() => {
    setQ("");
    setAnswer(null);
    setLoading(false);
    if (inlineAnchor) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [inlineAnchor]);

  // Outside click
  React.useEffect(() => {
    if (!inlineAnchor) return;
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        closeInline();
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [inlineAnchor, closeInline]);

  if (!inlineAnchor) return null;

  const rect = inlineAnchor.rect;
  const pos = rect
    ? computePosition(rect)
    : { top: 120, left: 120, placement: "below" as const };

  const submit = () => {
    if (!q.trim()) return;
    setLoading(true);
    setTimeout(() => {
      // Mock answer. Real product wires to LLM.
      setAnswer(mockAnswerFor(q, inlineAnchor.label));
      setLoading(false);
    }, 400);
  };

  return (
    <div
      ref={popRef}
      role="dialog"
      aria-label={`Ask about ${inlineAnchor.label}`}
      className={cn(
        "fixed z-[60] w-[380px] rounded-card border border-border-strong",
        "bg-bg-surface shadow-[0_20px_48px_-12px_rgba(0,0,0,0.7)]",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Header — anchor chip + close */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2 min-w-0">
          <span className="t-meta uppercase tracking-wider">Ask</span>
          <span className="t-meta truncate text-text-secondary">· {inlineAnchor.label}</span>
        </div>
        <button
          onClick={closeInline}
          className="text-text-muted hover:text-text focus-visible:outline-none"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Input */}
      {!answer && (
        <div className="px-4 py-3">
          <textarea
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholderFor(inlineAnchor.kind)}
            rows={2}
            className={cn(
              "w-full resize-none bg-transparent text-[14px] leading-snug text-text",
              "placeholder:text-text-muted focus:outline-none"
            )}
            disabled={loading}
          />
          <div className="flex items-center justify-between pt-2">
            <span className="t-meta text-text-muted">
              <CornerDownLeft size={11} className="inline align-[-2px]" /> to send
            </span>
            <button
              onClick={submit}
              disabled={!q.trim() || loading}
              className={cn(
                "t-meta px-2 py-1 rounded-sm border border-border",
                "hover:border-border-strong disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              )}
            >
              {loading ? "Thinking…" : "Ask"}
            </button>
          </div>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="px-4 py-3 space-y-3">
          <p className="t-body text-text">{answer}</p>
          <div className="t-meta text-text-muted">
            Source: Meridian CKD risk model v2.3 · Evidence bundle #127
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <button
              onClick={() => {
                setAnswer(null);
                setQ("");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="t-meta text-text-secondary hover:text-text"
            >
              Ask another
            </button>
            <button
              onClick={() => graduateToPane(q)}
              className={cn(
                "t-meta px-2 py-1 rounded-sm border border-border",
                "hover:border-border-strong flex items-center gap-1.5"
              )}
            >
              Continue in thread <ArrowRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function computePosition(rect: DOMRect): { top: number; left: number; placement: "below" | "above" } {
  const width = 380;
  const gap = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - rect.bottom;
  const placement: "below" | "above" = spaceBelow > 260 ? "below" : "above";

  let left = rect.left;
  if (left + width > vw - 16) left = vw - width - 16;
  if (left < 16) left = 16;

  const top = placement === "below" ? rect.bottom + gap : rect.top - gap - 260;
  return { top, left, placement };
}

function placeholderFor(kind?: string): string {
  switch (kind) {
    case "risk-model":
      return "Ask about this tier, the driver stack, or evidence…";
    case "action":
      return "Ask why, what breaks if deferred, or evidence…";
    case "value":
      return "Ask about trend, threshold, or context…";
    case "evidence":
      return "Ask about the study, population, or confidence…";
    default:
      return "Ask anything about this…";
  }
}

function mockAnswerFor(q: string, label: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("why") || lower.includes("reason")) {
    return `${label} is flagged by the CKD model because eGFR has declined 18% over 14 months while urine albumin trended from 32 to 108 mg/g. The model weights the combination 2.4× vs. either in isolation.`;
  }
  if (lower.includes("evidence") || lower.includes("source") || lower.includes("study")) {
    return `Threshold derives from KDIGO 2024 + Meridian's cohort calibration (n=48,200). AUC 0.84 at 5-year horizon. Delta vs. KFRE is +0.06 on the albuminuric subgroup.`;
  }
  if (lower.includes("defer") || lower.includes("break") || lower.includes("wait")) {
    return `Deferring this past 60 days shifts the tier from T2 → T3 in 34% of similar patients. Main driver: unmonitored albuminuria progression. Low reversibility once T3.`;
  }
  return `On ${label}: the relevant inputs are eGFR slope, UACR, and blood pressure control. The model weights BP control highest for 5-year horizon. Want me to show the driver stack?`;
}
