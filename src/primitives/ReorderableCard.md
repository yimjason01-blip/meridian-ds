# ReorderableCard — spec

**Role:** A container that lets a physician drag-reorder the active-queue cards in the Care Plan tab. Wraps `DecisionCard` (or any clinical card) and adds grip + expand/collapse + drag behavior.

**Status:** draft v1 — 2026-04-18

## When to use

- An ordered list of peer action items where the user authors the order.
- The ordering itself is a clinical decision (priority).
- Reorder must be cheap — no modal, no confirm.

**Do not use for:**
- Lists ordered by a system field (date, value, status). That's a sort, not a reorder.
- Deferred / declined / superseded items — they carry a status reason, not a priority.
- Flowsheets, tables, tabs. ReorderableCard is for clinical cards only.

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ ⠿  01  Autonomic load workup…           High · 2 wk    ⌄    │   ← collapsed (60px)
├──────────────────────────────────────────────────────────────┤
│ ⠿  02  Initiate low-dose rosuvastatin…  High · visit   ⌄    │
└──────────────────────────────────────────────────────────────┘
  │    │   │                                │            │
  │    │   │                                │            └─ disclosure caret (⌄ collapsed, ⌃ expanded)
  │    │   │                                └─ meta tokens (2–3 max, dot-separated)
  │    │   └─ one-line title, truncates
  │    └─ priority number, monospace, auto-renumbered after reorder
  └─ grip handle (⠿ six-dot), 24px hit area, var(--text-muted) → secondary on hover
```

### Collapsed state

- Height: 60px (fixed)
- Padding: 12px 16px
- Grip: 24px wide left gutter, `⠿` glyph, `color: var(--text-muted)`, `cursor: grab`
- Priority number: monospace, `t-mono`, 15px, `var(--text)`, 24px fixed-width column
- Title: truncate with ellipsis, `t-body` weight 510, `var(--text)`
- Meta: `t-meta` style, dot-separated (`·`), max 2 tokens by default (severity · time-to-action, e.g. `High · 2 wk`), right-aligned. Triage shape — what a physician scans on first pass.
- Disclosure caret: 24px hit area, `var(--text-muted)`, rotates 180° when expanded
- Hover: row background shifts to `var(--bg-hover)` (the whole row — not just grip)

### Expanded state

- Accordion **in-line**. The row below it slides down.
- Expanded content = the full `DecisionCard` body (Do / Why / Goal rows + Orders strip + Accept/Modify/Defer)
- Entry animation: 180ms ease-out, height + opacity
- Only one card expanded at a time by default (accordion group). Override via prop.

### Drag behavior

- **Grip-only drag.** Click-elsewhere is click-to-expand. Never whole-card drag.
- Pickup:
  - Cursor: `grabbing`
  - Picked card: `box-shadow: 0 8px 24px rgba(0,0,0,0.4)`, `transform: translateY(-2px)`, `opacity: 0.92`
  - Drop indicator: thin 2px horizontal line in `var(--accent-hover)` between sibling cards at the insertion point. No band, no background shift. Precise placement signal, Linear-style.
- Drop:
  - Smooth FLIP animation, 180ms ease-out, for all sibling cards
  - Priority numbers re-number and crossfade (100ms)
- Cancel:
  - `Esc` during drag → card returns to origin with same FLIP timing
- Auto-scroll:
  - Near top / bottom 40px of scrollable viewport, container scrolls at 8px/frame

### Keyboard

- `Tab` focuses the card (focus ring on grip)
- `Space` on focused grip → enters "lift" mode (aria-grabbed=true)
- `↑ / ↓` → moves the card up/down one position, announces new position via aria-live
- `Space` → drops
- `Esc` → cancels
- `Enter` on body (anywhere except grip) → expand/collapse

### Accessibility

- Grip is a `<button>` with `aria-label="Drag to reorder {title}"`
- Position announcements via `aria-live="polite"` region: "Moved Autonomic load workup to position 2 of 5"
- Keyboard reorder is a first-class path, not a fallback
- Focus never lost during reorder — grip stays focused after drop

## State matrix

| State | Grip | Row bg | Shadow | Opacity |
|---|---|---|---|---|
| default | muted | bg-panel | none | 1 |
| hover (anywhere on row) | secondary | bg-hover | none | 1 |
| focus (tab to grip) | secondary + 2px accent ring | bg-panel | none | 1 |
| grabbing | text | bg-panel | 0 8px 24px / 40% | 0.92 |
| drop-target-above | — | — | — | — (sibling shows 16px accent-light band above) |
| expanded | muted | bg-panel | none | 1 |
| disabled (e.g. "being saved") | border-subtle | bg-panel | none | 0.55 |

## Props (when implemented)

```ts
interface ReorderableCardProps {
  id: string;
  priority: number;               // displayed; managed by parent list
  title: string;
  meta?: string[];                // max 3 tokens
  expanded?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  children: React.ReactNode;      // expanded body (usually <DecisionCard>)
}

interface ReorderableListProps {
  items: ReorderableCardProps[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  expandMode?: "accordion" | "multi"; // default "accordion"
  ariaLabel: string;
}
```

## Hard rules

1. **Grip is the only drag surface.** Do not allow whole-card drag when cards have click behavior.
2. **Only one card expanded by default.** Accordion mode. Multi-expand is opt-in.
3. **Priority numbers re-number after drop.** Don't just reorder visually and keep stale numbers.
4. **Reorder is save-on-drop.** No "Save order" button. If the parent persists async, show a quiet "Saved" flash, not a confirm.
5. **Never disable the grip during expand.** Physician may want to reorder without collapsing first.
6. **Do not nest ReorderableCard inside ReorderableCard.** Reorder at one scope per surface.
7. **No drag for a list of 1.** Grip hides. No grip on disabled items either.

## What this is NOT

- Not a table row. Use `Table` primitive for tabular data.
- Not a swipe-to-action card. Actions live inside the expanded body or as explicit buttons.
- Not a kanban column target. Reorder is intra-list only; cross-list drag is a separate primitive if we ever need it.

## Implementation notes (deferred)

- Vanilla HTML5 DnD is fine for MVP. Consider `@dnd-kit/sortable` if we need multi-container or virtualized lists later.
- Animations use the FLIP technique (First-Last-Invert-Play) — measure before/after, apply inverse transform, transition to identity.

## Open questions

- Should the priority number be editable inline (click → type `3` → Enter)? Not in v1.
- Should deferred cards be visible in the same list but un-draggable, or in a separate section? **Decision: separate section** (matches current prototype).
- Should multi-select drag be supported? Not in v1.
