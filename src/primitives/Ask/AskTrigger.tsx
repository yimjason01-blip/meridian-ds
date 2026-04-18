import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAsk, type AskAnchorContext } from "./AskProvider";

/**
 * AskTrigger — a small "Ask" affordance that opens the Inline popover
 * anchored to itself. Use this wrapping or beside any physician-targeted
 * element (tier badge, action card, lab value, evidence line).
 *
 * Visual: neutral, 12px, text-muted. Hover = text-secondary. No accent.
 */
export function AskTrigger({
  label,
  kind,
  className,
  variant = "chip",
}: {
  label: string;
  kind?: AskAnchorContext["kind"];
  className?: string;
  variant?: "chip" | "icon" | "link";
}) {
  const { openInline } = useAsk();
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const onClick = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    openInline({ label, kind, rect });
  };

  if (variant === "icon") {
    return (
      <button
        ref={btnRef}
        onClick={onClick}
        aria-label={`Ask about ${label}`}
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded-sm",
          "text-text-muted hover:text-text-secondary",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong",
          className
        )}
      >
        <Sparkles size={11} />
      </button>
    );
  }

  if (variant === "link") {
    return (
      <button
        ref={btnRef}
        onClick={onClick}
        className={cn(
          "t-meta text-text-muted hover:text-text-secondary",
          "focus-visible:outline-none focus-visible:underline",
          className
        )}
      >
        Ask
      </button>
    );
  }

  // chip (default)
  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm",
        "border border-border text-[11px] text-text-muted",
        "hover:border-border-strong hover:text-text-secondary",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong",
        className
      )}
    >
      <Sparkles size={10} />
      Ask
    </button>
  );
}
