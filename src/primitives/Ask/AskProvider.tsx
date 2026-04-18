import * as React from "react";

/**
 * Ask — Meridian's AI-assist primitive.
 *
 * Three entry points, two surfaces, one context:
 *   - ⌘K command palette (AskCommand)       → accelerator only, not a surface
 *   - Inline popover (AskInline)            → pointed, ephemeral, bound to an anchor
 *   - Push-pane (AskPane)                   → global, persistent, canvas RESIZES
 *
 * Hard rules:
 *   1. Pane never overlays clinical content. Parent layout must be flex;
 *      pane is a sibling of the canvas so the canvas narrows on open.
 *   2. Inline is bound to an anchor rect and dismisses on outside-click or Esc.
 *   3. Every AI response renders a source line (model version / evidence).
 *   4. Inline has a "Continue in thread" action that lifts the question into
 *      the pane with the anchor context preserved (graduation path).
 */

export type AskAnchorContext = {
  /** Short human label for what was clicked. Shows as the thread's subject. */
  label: string;
  /** Optional category: "risk-model" | "action" | "value" | "evidence". */
  kind?: string;
  /** Optional DOMRect for positioning the inline popover. */
  rect?: DOMRect;
};

export type AskMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Source citation line. Required on assistant messages. */
  source?: string;
  anchorLabel?: string;
};

type AskState = {
  commandOpen: boolean;
  inlineAnchor: AskAnchorContext | null;
  paneOpen: boolean;
  thread: AskMessage[];
};

type AskActions = {
  openCommand: () => void;
  closeCommand: () => void;
  openInline: (anchor: AskAnchorContext) => void;
  closeInline: () => void;
  openPane: (seed?: { query: string; anchor?: AskAnchorContext }) => void;
  closePane: () => void;
  /** Lift the current inline question into the pane. */
  graduateToPane: (query: string) => void;
  appendMessage: (msg: AskMessage) => void;
  resetThread: () => void;
};

const Ctx = React.createContext<(AskState & AskActions) | null>(null);

export function useAsk() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAsk must be used within AskProvider");
  return v;
}

export function AskProvider({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [inlineAnchor, setInlineAnchor] = React.useState<AskAnchorContext | null>(null);
  const [paneOpen, setPaneOpen] = React.useState(false);
  const [thread, setThread] = React.useState<AskMessage[]>([]);

  // ⌘K global hotkey
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
        setInlineAnchor(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<AskState & AskActions>(
    () => ({
      commandOpen,
      inlineAnchor,
      paneOpen,
      thread,
      openCommand: () => setCommandOpen(true),
      closeCommand: () => setCommandOpen(false),
      openInline: (anchor) => setInlineAnchor(anchor),
      closeInline: () => setInlineAnchor(null),
      openPane: (seed) => {
        setPaneOpen(true);
        if (seed?.query) {
          setThread((t) => [
            ...t,
            {
              id: crypto.randomUUID(),
              role: "user",
              text: seed.query,
              anchorLabel: seed.anchor?.label,
            },
          ]);
        }
      },
      closePane: () => setPaneOpen(false),
      graduateToPane: (query) => {
        const anchor = inlineAnchor;
        setInlineAnchor(null);
        setPaneOpen(true);
        setThread((t) => [
          ...t,
          {
            id: crypto.randomUUID(),
            role: "user",
            text: query,
            anchorLabel: anchor?.label,
          },
        ]);
      },
      appendMessage: (msg) => setThread((t) => [...t, msg]),
      resetThread: () => setThread([]),
    }),
    [commandOpen, inlineAnchor, paneOpen, thread]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
