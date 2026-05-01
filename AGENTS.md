# AGENTS.md — Meridian MD Design System

**Read this before generating any UI for Meridian.** This file is the front-loader for every AI session (Claude, Cursor, v0, Codex, OpenCode).

## TL;DR

- **Stack:** React + TypeScript + Tailwind + shadcn/Radix primitives + DTCG tokens.
- **Theme:** Linear-native dark. Single accent (`#7170ff`). No second chromatic color in UI chrome.
- **Density:** comfortable (not compact). Reading > scanning.
- **Voice:** physician, terse, clinical. No patient marketing.

## Source of truth

1. **`src/tokens/tokens.json`** — DTCG tokens + `pairings` matrix + `banned_patterns` + `agent_contract`. Machine-readable. Never hardcode hex.
2. **`public/registry.json`** — installable component contracts for AI agents and shadcn-style registry flows.
3. **`docs/agent-interface.md`** — reproduction prompts and Figma MCP naming contract.
4. **`src/primitives/*`** — Button, Card, Tabs, Table, Badge, Input, Dialog, DropdownMenu. Use these. Do not re-create.
5. **`src/clinical/*`** — PatientBanner, Flowsheet, DomainPane, **DecisionCard** (Care Plan action card: Do / Why / Goal — do NOT recreate the SOAP 6-field template). Clinical primitives. Extend, do not fork.
6. **`DESIGN_SYSTEM.md`** (in `../design-system/`) — the written rules. Human canonical reference.
7. **`http://localhost:8088`** — visual reference. Every rule rendered live.

## Hard rules (banned_patterns — auto-reject)

From `tokens.json › banned_patterns`:

- No nested cards (max depth = 1)
- No `#fff` as text color (use `var(--text)`)
- No solid dark borders (use semi-transparent white via border tokens)
- No font-weight > 590
- No em dashes in UI copy (OK in chat)
- No decorative accent color (CTAs / active / selected only)
- No font size < 12px
- No inverted hierarchy (header never dimmer/smaller than body)
- No patient marketing voice on physician surfaces (no "your body" / hero titles)
- No cards for 4+ peer categories (use tabs)
- No second chromatic color in UI chrome
- No equal-weight labeled blocks (use answer-shaped hierarchy: Do/Why/Goal)
- **No SOAP-field card template** (Pattern/Mechanism/Intervention/Tracking — use `<DecisionCard>`)
- **No muted text on elevated surfaces** (`text.muted` only on `surface.canvas`)
- **Cut, don't mute** — if content can't earn high contrast, remove it
- **Evidence is a single-line footer, never a row**

## How to compose a new surface

1. **Pick a pairing** from `tokens.json › pairings`. Never invent a text-on-surface combination not in the matrix.
2. **Use a typographic role** (Header / Body / Label / Meta) via `.t-*` classes. Never reach for arbitrary Tailwind text sizes.
3. **Reach for the quietest separator that works:** whitespace → background shift → divider → border. Never stack two.
4. **Check the state matrix.** Every interactive element needs default/hover/focus/disabled/loading/empty/error.
5. **Import primitives** from `@/primitives/*`. Extend with `className` via `cn()`.
6. **Clinical components** (PatientBanner, Flowsheet, DomainPane) for domain surfaces — do not re-implement.

## For generative tools specifically

- **Tell the model:** "Use the Meridian design system. Import from `src/primitives` and `src/clinical`. Never hardcode colors. Respect `banned_patterns` in `tokens.json`."
- **Provide the model** with this file, `tokens.json`, `docs/agent-interface.md`, and `public/registry.json`.
- **Prefer registry items** for Meridian-specific components: `decision-card`, `domain-pane`, and `ask-surfaces`.
- **Reject output** that uses hex values, inline styles for color, recreates registered components, or any banned pattern.

## What this is NOT

- Not Material. Not Carbon. Not Fluent. Not Polaris.
- Not a light theme. Dark-only by design.
- Not a component zoo. 8 primitives + 3 clinical = the whole library. Add only when a new pattern recurs 3+ times.
