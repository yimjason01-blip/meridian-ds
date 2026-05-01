# Meridian DS Agent Interface

This file turns the design system into something an AI coding agent can apply without guessing.

## Load order

1. `AGENTS.md`
2. `src/tokens/tokens.json`
3. `public/registry.json`
4. This file
5. The component source file being used

If any item is unavailable, stop and ask for it. Do not infer the system from a screenshot.

## Registry contract

The public registry lives at `public/registry.json`. Each item must include:

- canonical component name
- import path
- source files
- token dependencies
- allowed variants
- forbidden patterns
- AI reproduction prompt

A component is not registry-ready unless another agent can reproduce it from the entry without inventing color, density, voice, or structure.

## Figma MCP contract

Figma layers intended for MCP extraction must use the same names as code:

```text
DecisionCard / default / signed
DecisionCard / urgent / pending
DomainPane / cardiovascular / default
AskPane / right-edge / open
```

Each component frame needs annotations for:

- intent
- data source
- state
- token dependencies
- banned patterns

Do not create visually similar duplicate frames with different names. If two frames map to the same component, make the variant explicit.

## AI reproduction prompt shape

Every reusable component needs a prompt in this shape:

```text
Use the Meridian MD design system. Import [Component] from [path]. Use tokens from src/tokens/tokens.json and typographic roles from src/index.css.

Use when: [specific product condition]
Must include: [required content and state]
Do not: [banned local mistakes]
Token dependencies: [surface/text/accent/status/radius/density]
Example data: [realistic clinical data, not filler]
```

## Component prompts

### DecisionCard

Use when: a physician-facing care plan item needs one primary action with rationale and target outcome.

Must include:

- kicker with action number and domain
- `do` as the first and loudest answer
- `why` as compressed clinical rationale
- `goal` as measurable target and date
- single-line evidence footer

Do not:

- use SOAP fields
- make Evidence a row
- use muted text on nested card surfaces
- add decorative accent color
- omit the physician action

Token dependencies:

- `surface.panel`, `surface.card`
- `text.primary`, `text.secondary`
- status only when the clinical state is urgent
- radius.card, density.comfortable

Example prompt:

```text
Use the Meridian MD design system. Import DecisionCard from @/clinical/DecisionCard. Create two cardiovascular care plan actions for Maya Chen. Use Do, Why, Goal shape. Use realistic ApoB, Lp(a), ASCVD, and medication data. Evidence must be a single-line footer. Do not use SOAP fields, decorative accent, or muted text on card surfaces.
```

### DomainPane

Use when: a risk domain needs a physician-readable summary with model output, drivers, evidence, and handoff to the care plan.

Must include:

- domain name
- hero risk value and label
- change from prior when available
- ranked drivers with contribution
- evidence footer
- care plan entry point

Do not:

- present the pane as marketing copy
- use color as decoration
- hide model evidence in a drawer
- invent risk values without a named model or fixture

Token dependencies:

- `surface.panel`, `surface.card`, `surface.hover`
- `text.primary`, `text.secondary`, `text.muted` only on canvas-level metadata
- status color only for clinical state

Example prompt:

```text
Use the Meridian MD design system. Import DomainPane from @/clinical/DomainPane. Build the Cardiovascular domain pane for a physician review screen. Use PREVENT as the named model, show 10-year ASCVD risk, ranked drivers, and an evidence footer. Use terse clinical labels. Do not use patient marketing voice or decorative color.
```

### Ask surfaces

Use when: a physician needs contextual AI help without losing the primary clinical object.

Must include:

- Inline popover for object-specific questions
- right-edge push pane for thread-level discussion
- visible source line on every assistant message
- neutral in-content trigger styling
- one persistent launcher

Do not:

- add a floating chatbot
- add a third AI surface
- use accent color for in-content AI chrome
- obscure the subject element with the pane
- render sourceless AI prose

Token dependencies:

- neutral borders
- `text.muted` only for low-priority chrome on canvas
- inverted launcher colors only for the persistent entry button

Example prompt:

```text
Use the Meridian MD design system. Import AskProvider, AskInline, AskPane, AskCommand, AskTrigger, and AskLauncher from @/primitives/Ask. Add AI help to a physician domain review screen. Inline should answer questions about the selected risk driver. Push pane should keep thread context. Every assistant answer needs a source line. Do not add a floating chatbot or accent-colored inline triggers.
```
