---
name: figma-handoff
description: Design-to-code handoff process for Yunie's portfolio. Load this when implementing any component or UI element. Defines what "approved" means, what a spec looks like, and Claude Code's role in the pipeline.
---

# Figma Handoff — Design-to-Code Pipeline

This project uses a two-tool workflow. Design decisions are made in Claude.ai. Code is written in Claude Code. These roles do not overlap.

---

## The Pipeline

```
Figma (design)
    ↓
Claude.ai (review + approval + spec writing)
    ↓
Claude Code (implementation only)
```

**Claude Code never:**
- Makes visual design decisions
- Interprets ambiguous spacing or layout
- Chooses between design options
- Pulls directly from Figma without a written spec

**Claude Code always:**
- Implements from an approved spec
- Asks if anything in the spec is unclear before proceeding
- Flags discrepancies between spec and what's possible in code

---

## What "Approved" Means

A component is approved when all of the following are confirmed in Claude.ai:

**States** — Every interactive state is designed and accounted for:
- Default
- Hover
- Focus (keyboard navigation)
- Disabled (if applicable)
- Active / pressed (if applicable)

**Tokens** — All colors, spacing, and typography reference the project token system, not hardcoded values. If a Figma value doesn't map to an existing token, a decision is made in Claude.ai before handoff — either use the nearest token or add a new one to `globals.css`.

**Responsive** — Mobile behavior is defined. At minimum: does it change at 375px vs desktop? If yes, both are specified. If no, that's explicitly stated.

**Edge cases** — Long text, empty states, or variable content is considered if relevant.

---

## Spec Format

After a component is approved in Claude.ai, a spec is written in this format before Claude Code starts:

```
## Component: [ComponentName]

### What it is
One sentence. What this component is and where it's used.

### Variants / Props
List every prop, its type, and what it does.
Example:
- variant: "primary" | "secondary" | "text" — controls fill style
- size: "default" | "sm" — controls padding and font size
- disabled: boolean — disables interaction, reduces opacity

### States
- Default: [describe]
- Hover: [describe — e.g. accent color deepens, translateY(-2px)]
- Focus-visible: 2px solid var(--color-accent), 2px offset
- Disabled: 50% opacity, cursor: not-allowed, no hover effect

### Typography
- Font: [Figtree or IBM Plex Mono]
- Case: [uppercase or as-written]
- Size token: [e.g. var(--text-sm)]

### Spacing
All values mapped to tokens from globals.css. No arbitrary values.
- Padding: [token]
- Gap: [token]

### Tokens used
List every CSS custom property this component references.
Example:
- --color-accent
- --color-text-primary
- --color-bg-surface
- --text-sm
- --font-mono

### Responsive behavior
[Describe any changes at 375px, 768px, 1280px — or state "no change across breakpoints"]

### File location
src/components/ui/[ComponentName].tsx

### Notes for Claude Code
Any implementation details, gotchas, or decisions made during review.
```

---

## Token Mismatch Protocol

If a Figma design uses a value that doesn't exist as a token:

1. Flag it in Claude.ai during review — never silently approximate in code
2. Decide: is this a one-off or should it be a new token?
3. If new token: add it to `globals.css` first, then reference it in the component
4. If one-off: use the nearest existing token and note the deviation in the spec

Never hardcode a hex value or arbitrary pixel value to resolve a mismatch.

---

## Learning Annotations

When Claude Code implements a component from this spec, the learning skill is always active. Every component gets:
- Block-level plain-English comments explaining what each section does
- A plain-English summary comment at the top of the file
- TypeScript types explained the first time a pattern appears

See `.claude/skills/learning/SKILL.md` for full annotation rules.

---

## Handoff Checklist (Claude Code runs this before writing any code)

- [ ] Is there an approved spec from Claude.ai for this component?
- [ ] Have I read the component-first skill and audited `/components`?
- [ ] Do all tokens in the spec exist in `globals.css`?
- [ ] Are all states accounted for in the spec?
- [ ] Do I know the file location and export name?

If any answer is no — stop and ask before proceeding.