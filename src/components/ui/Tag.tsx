/*
  TAG COMPONENT
  -------------
  A small, display-only label used to categorize or annotate content.
  Think of it like a chip or badge in a design system — it communicates
  a category or attribute at a glance, but you can't click it or interact with it.

  It has two ways it can look (variant) and three color modes (color):

  VARIANT:
  - "minimal":  Text only. No background, no border, no padding. Just the text in color.
  - "outlined": A chip-style label. Thin border, light background fill, 4px left/right padding.

  COLOR:
  - "default": Uses the body gray text (--color-text-body) and a near-white fill (--color-surface-subtle).
               The standard tag — used for most labels and categories.
  - "subtle":  Uses the lighter muted gray text (--color-text-subtle) and white fill (--color-surface-main).
               Used for de-emphasized or secondary tags that should recede visually.
  - "primary": Uses the accent blue text (--color-text-primary) and white fill (--color-surface-main).
               Used for highlighted or primary-category tags.

  The text is always IBM Plex Mono Medium, 14px, uppercase — handled by the
  .label-2-medium CSS class from globals.css. No color values are hardcoded here;
  everything references semantic tokens so both day and night themes work automatically.
*/

import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — What props this component accepts
//
// A "prop" is information passed into a component from outside —
// the same concept as a property in a Figma component.
// The parent decides what to pass; TypeScript enforces that only
// valid values are used. If you pass anything not on this list,
// TypeScript will warn you before the page even loads.
// ─────────────────────────────────────────────────────────
interface TagProps {
  // Controls the visual style of the tag.
  // "minimal"  = text only — no border, no background, no padding.
  // "outlined" = a bordered chip with a light fill and horizontal padding.
  // The | means "or" — only these two strings are allowed. Anything else is a TypeScript error.
  // This prop is required — you must always say which variant you want.
  variant: 'minimal' | 'outlined'

  // Controls the color scheme. Defaults to "default" if not specified.
  // "default" = body gray text (--color-text-body), near-white fill when outlined.
  // "subtle"  = lighter muted gray text (--color-text-subtle), white fill when outlined.
  // "primary" = accent blue text (--color-text-primary), white fill when outlined.
  color?: 'default' | 'subtle' | 'primary'

  // The label text shown inside the tag.
  // ReactNode is React's broadest type for "anything React can render" —
  // a string, an HTML element, another component, etc.
  // In practice this will always be a plain string like "Case Study" or "2024".
  children: ReactNode
}

// ─────────────────────────────────────────────────────────
// TAG COMPONENT
//
// We "destructure" the props — instead of writing `props.variant`,
// we pull each value out by name directly in the function signature.
// color has a default value of "default" — if the parent doesn't pass it, that's what's used.
// ─────────────────────────────────────────────────────────
export default function Tag({ variant, color = 'default', children }: TagProps) {

  // ─────────────────────────────────────────────────────────
  // TEXT COLOR CLASS
  //
  // Both variants (minimal and outlined) use the same text color
  // for a given color mode — what differs between variants is
  // the background and border, not the text.
  //
  // "default" → text-text-body    = var(--color-text-body)    → body gray
  // "subtle"  → text-text-subtle  = var(--color-text-subtle)  → lighter muted gray
  // "primary" → text-text-primary = var(--color-text-primary) → accent blue (day) / blue-gray (night)
  //
  // When there are more than two options, a ternary chain reads like:
  // "if default → A, else if subtle → B, else → C"
  // ─────────────────────────────────────────────────────────
  const textColorClass =
    color === 'default' ? 'text-text-body' :
    color === 'subtle'  ? 'text-text-subtle' :
                          'text-text-primary'

  // ─────────────────────────────────────────────────────────
  // BACKGROUND CLASS (outlined only)
  //
  // The fill color differs between color modes:
  // "default" → bg-surface-subtle = var(--color-surface-subtle) → near-white (#FAFAFA)
  // "subtle"  → bg-surface-main   = var(--color-surface-main)   → white (#FFFFFF)
  // "primary" → bg-surface-main   = var(--color-surface-main)   → white (#FFFFFF)
  //
  // Note: subtle and primary share the same fill — only their text colors differ.
  // This variable is only used when variant is "outlined" — see outlinedClasses below.
  // ─────────────────────────────────────────────────────────
  const bgClass = color === 'default' ? 'bg-surface-subtle' : 'bg-surface-main'

  // ─────────────────────────────────────────────────────────
  // OUTLINED VARIANT CLASSES
  //
  // These apply only when variant is "outlined". They add the
  // border, background fill, padding, and rounded corners.
  //
  // "inline-block"         → Makes the <span> size itself around its content
  //                          correctly. Without this, a <span> is "inline" by
  //                          default and border-radius / background can behave
  //                          unexpectedly — especially across multiple lines.
  //                          inline-block keeps it inline in the text flow but
  //                          makes the box sizing predictable.
  // "px-1"                 → 4px padding on left and right. The spec calls for
  //                          horizontal padding only, not vertical.
  //                          (px-1 = spacing-1 token = 4px)
  // "py-0"                 → Explicitly 0px top and bottom padding.
  //                          The spec is specific: no vertical padding at all.
  // "border"               → 1px solid border on all sides.
  // "border-stroke-border" → Sets the border color to var(--color-stroke-border).
  //                          This is the same across all three color modes —
  //                          only the fill and text change between them.
  // "rounded"              → 4px border-radius on all corners — slightly softened edges.
  // bgClass                → The background fill from above (surface-subtle or surface-main).
  //
  // When variant is "minimal", this evaluates to an empty string — no extra classes apply.
  // ─────────────────────────────────────────────────────────
  const outlinedClasses =
    variant === 'outlined'
      ? `inline-block px-1 py-0 border border-stroke-border rounded ${bgClass}`
      : ''

  // ─────────────────────────────────────────────────────────
  // COMBINE ALL CLASSES
  //
  // "label-2-medium" comes from globals.css — it sets:
  //   font-family: IBM Plex Mono, font-size: 14px, line-height: 22px,
  //   font-weight: 500 (Medium), text-transform: uppercase.
  // Every tag, regardless of variant or color, always uses this typography.
  //
  // .filter(Boolean) drops empty strings from the array, so "minimal" tags
  // don't get trailing whitespace from the empty outlinedClasses string.
  // .join(' ') combines the remaining items into one space-separated string.
  // ─────────────────────────────────────────────────────────
  const allClasses = ['label-2-medium', textColorClass, outlinedClasses]
    .filter(Boolean)
    .join(' ')

  // ─────────────────────────────────────────────────────────
  // RENDER
  //
  // A <span> — not a <div> or <button>.
  // The spec is deliberate about this: tags are inline text content.
  // A <span> can sit naturally inside a paragraph, a heading, or alongside
  // other text without breaking the document flow.
  //
  // No onClick, no onFocus, no hover styles — this component is purely decorative.
  // It exists to show information, not to accept input.
  // ─────────────────────────────────────────────────────────
  return (
    <span className={allClasses}>
      {children}
    </span>
  )
}
