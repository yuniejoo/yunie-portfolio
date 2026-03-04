---
name: design-system
description: Portfolio design rules and conventions. Load this whenever building or modifying any component, layout, or page.
---

# Design System Rules — Yunie Joo Portfolio

Design tokens (colors, spacing, typography scale) live in `globals.css` (inside the `@theme inline` block). Read that file for actual values. This skill contains only the judgment rules and conventions that can't be expressed in code.

---

## Typography Conventions
- **Figtree** is for all human-readable content: body text, headings, titles, descriptions, bios
- **IBM Plex Mono** is for all structural/systemic text: nav items, buttons, labels, tags, metadata fields (DURATION, PLATFORM), filter tabs, section markers, page numbers
- This distinction is strict. Never use Figtree for a button. Never use IBM Plex Mono for body copy.
- IBM Plex Mono text is always uppercase

## Hero Section Rule
The homepage hero is a pixel art landscape of Calgary, Canada.
It is a **slot** — during layout phase, render only a placeholder `<div>` with correct dimensions. Never build hero content during the layout phase. The hero component is built separately in Phase 5 and slotted in.
The hero drives the two-theme system: day (morning/afternoon, blue primary) and night (evening/dawn, near-black background). Default = Calgary local time (MT, UTC-7). User can manually toggle in the hero section.

## Color and Theme Rules
- Always use semantic tokens (e.g. `--color-accent`, `--color-text-primary`), never hardcode hex values in components
- Theme is applied via `data-theme="day"` or `data-theme="night"` on the `<html>` element
- Day theme is default; night theme activates based on Calgary local time (MT, UTC-7: 6pm–6am) or manual toggle

## Layout and Spacing Rules
- No card borders or drop shadows — separation between elements is achieved by whitespace only
- Mobile-first always: build for 375px first, then 768px, then 1280px
- Never use arbitrary spacing values — only use the spacing scale defined in `globals.css`

## Shadow Rules
- No drop shadows on components or cards — whitespace is the primary separation tool
- One exception: ProjectCover uses `--shadow-card` (1px 1px 1px rgba(233,234,235,0.5)) to reinforce the physical card-stack metaphor
- No other component may use a shadow without an explicit decision logged here

## Interaction Rules
- All transitions: `transition: all 0.2s ease` — no slower, no faster
- Hover on cards: `translateY(-2px)` maximum — never dramatic movement
- Motion must mean something — no decorative animations

## Semantic HTML Rules
- Always use correct semantic elements: `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`, `<footer>`
- Never use a `<div>` where a semantic element is appropriate

## Image Placeholder Rule
Until real images are provided, all image areas use the checkerboard placeholder pattern defined in `globals.css` as `.placeholder-image`. Never use a solid gray box or a random image URL.
