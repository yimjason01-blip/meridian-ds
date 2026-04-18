import * as React from "react";
import { cn } from "../../lib/cn";
import { useAsk } from "./AskProvider";

/**
 * AskLauncher — persistent, icon-only FAB for opening the Ask pane.
 *
 * Fixed to the bottom-right corner. Inverted colors so it stands out:
 * bg = text, icon = bg. No copy. Sparkle icon only. The physician figures
 * it out on encounter #1 and never needs to read a label after that.
 *
 * Hides itself when the pane is open (the pane has its own close X).
 *
 * Layout: `position: fixed` at the document body level. Render it once at
 * the app root (inside AskProvider, beside AskPane / AskCommand / AskInline).
 */
export function AskLauncher({
  shape = "square",
  corner = "bottom-right",
  contained = false,
  className,
}: {
  shape?: "circle" | "square";
  corner?: "bottom-right" | "bottom-left";
  /** When true, positions absolutely within the nearest positioned ancestor (for demos). Default: fixed to viewport. */
  contained?: boolean;
  className?: string;
}) {
  const { openPane, paneOpen } = useAsk();

  const position =
    corner === "bottom-right"
      ? "bottom-5 right-5"
      : "bottom-5 left-5";

  return (
    <button
      type="button"
      onClick={() => openPane()}
      aria-label="Ask Meridian"
      aria-hidden={paneOpen || undefined}
      className={cn(
        contained ? "absolute" : "fixed",
        "z-[55] flex items-center justify-center",
        "w-11 h-11",
        shape === "circle" ? "rounded-full" : "rounded-[10px]",
        "bg-text text-bg",
        "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]",
        "transition-[opacity,transform,box-shadow] duration-200",
        "hover:scale-[1.04] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)]",
        "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        paneOpen && "opacity-0 pointer-events-none translate-x-4",
        position,
        className
      )}
    >
      <SparkleIcon />
    </button>
  );
}

function SparkleIcon() {
  // Same 4-point star path used by AskTrigger / AskCommand, sized for the FAB.
  return (
    <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M6 0.75 L7.15 4.85 L11.25 6 L7.15 7.15 L6 11.25 L4.85 7.15 L0.75 6 L4.85 4.85 Z" />
    </svg>
  );
}
