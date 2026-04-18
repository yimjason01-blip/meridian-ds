# Meridian Design System

Source of truth for the Meridian Physician web app (and, later, any Meridian surface).

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
AGENTS.md                  front-loader for AI tools
components.json            shadcn contract
```

## Run it

```bash
npm install
npm run dev        # http://localhost:8088 (and Tailscale network)
```

## Rules

See `AGENTS.md` and `../design-system/DESIGN_SYSTEM.md`. Both are authoritative.
Written rules live in DESIGN_SYSTEM.md. Machine rules live in `tokens.json`. Rendered rules live at `:8088`.

## Adding a component

A primitive earns a place only when the pattern has recurred 3+ times across surfaces. Otherwise compose from existing primitives with `className`. Do not grow the zoo.
