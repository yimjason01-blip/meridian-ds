import * as React from "react";
import { CornerDownLeft, ArrowUpRight, MessageSquare } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAsk } from "./AskProvider";

/**
 * AskCommand — ⌘K palette.
 *
 * NOT a third AI surface. It's the keyboard accelerator that routes intent
 * into one of the two real surfaces:
 *   - Enter           → open the pane (thread mode) with the query
 *   - Shift+Enter     → newline in input
 *   - ⌘⏎ / Ctrl+Enter → (reserved) one-shot inline answer
 *
 * Dismiss: Esc, outside click, submit.
 */
export function AskCommand() {
  const { commandOpen, closeCommand, openPane } = useAsk();
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (commandOpen) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [commandOpen]);

  if (!commandOpen) return null;

  const suggestions = [
    "Walk me through this patient's cardiovascular story",
    "Re-rank the plan if cost is the primary constraint",
    "What breaks if I defer the top action 60 days?",
    "Draft the patient-facing version of the plan",
  ];

  const submit = (text: string) => {
    if (!text.trim()) return;
    closeCommand();
    openPane({ query: text });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] flex items-start justify-center pt-[14vh]",
        "bg-black/50 backdrop-blur-[2px]",
        "animate-in fade-in-0 duration-150"
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeCommand();
      }}
    >
      <div
        role="dialog"
        aria-label="Ask Meridian"
        className={cn(
          "w-[min(92vw,640px)] rounded-card border border-border-strong",
          "bg-bg-surface shadow-[0_24px_56px_-16px_rgba(0,0,0,0.8)]",
          "animate-in zoom-in-95 fade-in-0 duration-150"
        )}
      >
        <div className="px-4 pt-4 pb-2 border-b border-border-subtle">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="t-meta uppercase tracking-wider">Ask Meridian</span>
            <span className="t-meta text-text-muted">· ⌘K</span>
          </div>
          <textarea
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(q);
              }
            }}
            placeholder="Ask about risk, actions, evidence…"
            rows={2}
            className="w-full resize-none bg-transparent text-[16px] leading-snug text-text placeholder:text-text-muted focus:outline-none"
          />
        </div>

        <div className="p-2">
          <div className="t-meta text-text-muted px-2 py-1.5">Suggestions</div>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className={cn(
                "w-full text-left flex items-center gap-3 px-2 py-2 rounded-sm",
                "text-[14px] text-text-secondary",
                "hover:bg-white/[.03] hover:text-text",
                "focus-visible:outline-none focus-visible:bg-white/[.03] focus-visible:text-text"
              )}
            >
              <MessageSquare size={13} className="text-text-muted shrink-0" />
              <span className="flex-1 truncate">{s}</span>
              <ArrowUpRight size={13} className="text-text-muted shrink-0" />
            </button>
          ))}
        </div>

        <div className="border-t border-border-subtle px-4 py-2 flex items-center justify-between">
          <span className="t-meta text-text-muted">
            <CornerDownLeft size={11} className="inline align-[-2px]" /> open in thread
          </span>
          <span className="t-meta text-text-muted">Esc to close</span>
        </div>
      </div>
    </div>
  );
}
