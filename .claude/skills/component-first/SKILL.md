---
name: component-first
description: Enforce component reuse. Load this before building any new UI — pages, sections, or components. Prevents Claude from writing new code when an existing component already covers the need.
---

# Component-First Rule — Always Check Before Building

Before writing any new UI code, you must audit what already exists in the project. Never assume. Never skip this step.

---

## Mandatory Pre-Build Checklist

Before building any component, section, or page, run through this sequence:

**Step 0 — Confirm design is approved**
```
A component should only be built in Claude Code after it has been reviewed and approved in Claude.ai. Never implement from a Figma file directly without a written spec.
```

**Step 1 — Read the components directory**
```
Read the entire /components directory.
List every component that exists and what it does.
```

**Step 2 — Identify what's needed**
List every UI element required for what you're about to build.
Example: "This page needs: navigation, content type tag, heading, image placeholder, body text, dot separator."

**Step 3 — Map existing components to needs**
For each element you need, check whether a component already exists for it.
If yes: use it. Do not rewrite it.
If no: build it as a new component, then reuse it.

**Step 4 — Show the mapping before writing code**
Before writing any code, show Yunie:
```
Using existing components:
- Nav → /components/Nav.tsx ✓
- ContentTag → /components/ContentTag.tsx ✓
- PlaceholderImage → /components/PlaceholderImage.tsx ✓

Building new:
- WorkCard — does not exist yet, will create /components/WorkCard.tsx
```
Then proceed.

---

## Rules

**Never rewrite an existing component inline.**
If a page needs a button, import `<Button>` from `/components/Button.tsx`. Do not write a new `<button>` element with styles from scratch inside the page file.

**Never approximate a component.**
If `<Button>` exists and you need a button, use `<Button>`. Don't create a `<span>` or `<div>` styled to look like a button because it's "simpler."

**If an existing component doesn't quite fit, extend it — don't replace it.**
Add a new prop variant to the existing component rather than building a parallel version.
Example: Nav already exists but needs a different set of links for the article page → add `variant="article"` prop to the existing Nav component.

**New components always go in /components.**
Never define a component inline inside a page file. If it's more than a simple wrapper, it belongs in /components with its own `.tsx` file.

**Name components clearly.**
Component names should describe what the element *is*, not what it looks like.
Good: `ContentTag`, `WorkCard`, `DotSeparator`, `ArticleSidebar`
Bad: `BlueLabel`, `BigCard`, `DotsRow`, `LeftPanel`

---

## Why This Matters

Every time a component is duplicated instead of reused, the design system fractures. A color change or spacing fix has to be made in multiple places. Inconsistencies appear. The system becomes untrustworthy.

Reuse is not a developer concern — it is a design system concern. It's the same principle as using a shared component library in Figma instead of detaching and restyling every instance.
