# Meridian MD Design System

Source of truth for the Meridian MD physician web app (and, later, any Meridian surface).

## What's in here

```
src/
  tokens/tokens.json       DTCG tokens + pairings + banned_patterns
  index.css                CSS vars + typographic role classes
  lib/
    cn.ts                  clsx + twMerge helper
    contrast.ts            WCAG ratio calculator
  primitives/              shadcn/Radix primitives, Linear-skinned
    Button Card Tabs Table Badge Input Dialog DropdownMenu
  clinical/                Meridian-native domain components
    PatientBanner Flowsheet DomainPane
  pages/Reference.tsx      the visual reference page
public/registry.json       agent-ready registry manifest
public/r/*.json            component-level registry entries
AGENTS.md                  front-loader for AI tools
docs/agent-interface.md    AI reproduction prompts + Figma MCP contract
components.json            shadcn contract
```

## Run it

```bash
npm install
npm run dev        # http://localhost:8088 (and Tailscale network)
```

## Rules

See `AGENTS.md`, `docs/agent-interface.md`, and `../design-system/DESIGN_SYSTEM.md`. All are authoritative.
Written rules live in DESIGN_SYSTEM.md. Machine rules live in `tokens.json` and `public/registry.json`. Rendered rules live at `:8088`.

## Agent-ready registry

The registry is intentionally small. Only components that encode Meridian-specific behavior belong there.

- `public/registry.json` lists available install targets.
- `public/r/decision-card.json` carries the DecisionCard contract and reproduction prompt.
- `public/r/domain-pane.json` carries the DomainPane contract and reproduction prompt.
- `public/r/ask-surfaces.json` carries the Ask surface contract and reproduction prompt.

Agents should import these components. They should not recreate them from screenshots.

## Adding a component

A primitive earns a place only when the pattern has recurred 3+ times across surfaces. Otherwise compose from existing primitives with `className`. Do not grow the zoo.
