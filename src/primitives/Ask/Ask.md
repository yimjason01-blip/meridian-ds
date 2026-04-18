# Ask — AI-assist primitive

## What it is

The single primitive that incorporates AI into Meridian MD. Two surfaces, one entry point.

- **AskInline** — ephemeral popover bound to a specific element (tier, value, action, evidence). Pointed. No memory. Dismisses on outside-click, Esc, submit, or graduation.
- **AskPane** — persistent right-docked pane. Thread with memory. **Canvas resizes; pane never overlays clinical content.**
- **AskCommand (⌘K)** — keyboard accelerator only. Routes intent into the pane (Enter) or the inline (⌘⏎, reserved). Not a third surface.

## Why this composition

Two real cognitive modes in physician workflow:

| Mode | Example | Surface |
|---|---|---|
| Pointed / scanning | "Why is CV tier 3?" (points at badge) | Inline |
| Deliberating / synthesizing | "Walk me through this patient" | Pane |

A single surface can't serve both without compromising one. Three surfaces exceeds what a physician can hold in working memory.

## Hard rules

1. **Pane must resize the canvas, never overlay it.** Parent layout is flex; pane is a sibling of the canvas. When open, canvas narrows. The original slider-over-content pattern is banned.
2. **Inline is anchor-bound.** It appears next to the element the physician clicked. Max width 380 px. Flips above if no room below.
3. **Every assistant message renders a source line.** Model name + version, or evidence bundle reference. No sourceless prose on a physician surface.
4. **Graduation path is explicit.** Inline has a "Continue in thread" action that lifts the question + anchor context into the pane. Without this, physicians re-type or lose the thread.
5. **No accent color as affordance chrome.** Ask triggers use neutral borders + `text-muted`. Accent is still reserved for CTA/active/selected per the DS contract.
6. **Max two surfaces.** ⌘K is an accelerator, not a surface. Adding a third (floating chatbot, sidebar toggle, etc.) is banned.

## API

### AskProvider

Wrap the app (or a demo region). Owns state: `commandOpen`, `inlineAnchor`, `paneOpen`, `thread`.

```tsx
<AskProvider>
  <div className="flex min-h-screen">
    <main className="flex-1 min-w-0">{/* canvas */}</main>
    <AskPane />          {/* sibling — resizes canvas */}
  </div>
  <AskCommand />         {/* portaled palette */}
  <AskInline />          {/* portaled popover */}
</AskProvider>
```

### AskTrigger

Place wrapping or next to any element the physician might ask about.

```tsx
<AskTrigger label="CKD tier 2" kind="risk-model" />
<AskTrigger label="eGFR 52" kind="value" variant="icon" />
<AskTrigger label="ACEi titration" kind="action" variant="link" />
```

`kind` is optional but changes the inline placeholder. Recognized: `risk-model`, `action`, `value`, `evidence`.

### useAsk

For app-level orchestration (opening the pane with a pre-filled query, clearing the thread, etc.).

## State matrix

| State | Inline | Pane | Command |
|---|---|---|---|
| idle | closed | closed | closed |
| scanning | triggered → open, anchor-bound | closed | closed |
| deliberating | closed | open (canvas narrow) | closed |
| graduating | closed (lifted into pane) | open + new turn | closed |
| accelerator | closed | closed | open (overlay) |

## Banned patterns (tokens.json)

- `ai-pane-overlay` — Pane must resize canvas, never overlay.
- `ai-without-source` — Every AI response cites the Meridian source.
- `three-ai-surfaces` — Max two AI surfaces. ⌘K is an accelerator.
- `ai-accent-chrome` — AI affordances never use accent color for chrome.

## Open decisions

- Inline → pane graduation: carries the query text, carries the anchor label, does NOT carry the anchor's full record. Right trade for first build; revisit when physicians want "pull this full record into the pane."
- Pane persistence: in-memory only for now. Thread survives pane-close but resets on app reload.
- Mock vs. live: mock responses are baked in for demo. Real integration is a single `onAsk(query, anchor)` prop when we wire it.
