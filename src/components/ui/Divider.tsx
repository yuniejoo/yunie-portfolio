/*
  DIVIDER COMPONENT
  -----------------
  A full-width row of asterisk (*) characters spaced evenly from edge to edge.
  Used as a visual separator between sections of the page.

  It always stretches to fill its container — no fixed width, no padding.
  On mobile it shows 10 asterisks. On desktop (768px and up) it shows 20.

  No props needed — the responsive behavior is baked in.
*/

// We need React to write JSX (the HTML-like syntax in this file)
import React from "react"

// --- The asterisks array ---
// We create an array of 20 asterisk strings up front.
// Array.from({ length: 20 }) creates a list of 20 empty slots.
// The .map((_, i) => ...) fills each slot with its index number (0–19).
// We use the index to tell which asterisks are "mobile-only" vs always visible.
const ASTERISKS = Array.from({ length: 20 }, (_, i) => i)

export default function Divider() {
  return (
    // The outer div stretches to the full width of its container.
    // flex + justify-between spaces the asterisks evenly from left edge to right edge.
    // items-center vertically centers them (all on the same baseline).
    <div className="w-full flex justify-between items-center">

      {/* Loop through all 20 asterisks.
          .map() means "do this for each item in the list."
          For each index i, we render one <span> with an asterisk inside. */}
      {ASTERISKS.map((i) => (
        <span
          key={i}

          // label-2 is a plain CSS class defined in globals.css.
          // It applies IBM Plex Mono, 14px, uppercase — the monospace label style.
          // (Note: uppercase doesn't change * but is part of the class contract.)
          className={[
            "label-2",

            // text-text-subtle applies color: var(--color-text-subtle) from the design token system.
            // This is a muted gray (#A4A7AE in day theme) — intentionally low-contrast
            // so the divider reads as structural decoration, not primary content.
            "text-text-subtle",

            // Responsive visibility:
            // Asterisks 0–9 (i < 10) are always visible.
            // Asterisks 10–19 (i >= 10) are hidden on mobile (hidden)
            // but shown inline on desktop at the md breakpoint (md:inline).
            // "hidden" = display: none. "md:inline" = display: inline at 768px+.
            i >= 10 ? "hidden md:inline" : "",
          ].join(" ")}
        >
          *
        </span>
      ))}

    </div>
  )
}
