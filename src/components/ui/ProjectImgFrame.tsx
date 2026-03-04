/*
  PROJECT IMG FRAME COMPONENT
  ---------------------------
  A square decorative frame that holds a project image. Think of it like a picture
  frame — it provides the border, background, shadow, and padding. Whatever image
  or placeholder you put inside it just slots in as the "picture."

  This component is purely structural — it has no states, no interactivity, and
  no logic. It renders the same way every time. The only thing that changes is
  what content is passed inside it (the `children` prop).

  It has two layers:
  1. Outer frame — the visible card shell. White gradient background, border,
     subtle shadow, 12px padding, 8px corner radius.
  2. Inner image area — the clipped zone where the image sits. 4px corner radius
     and overflow hidden so the image stays within its rounded boundary.

  Sizing: always 400×400px square. Does not change at any breakpoint.

  Tokens used: --color-surface-main, --color-surface-subtle,
               --color-stroke-border, --shadow-card, --spacing-3 (12px padding)
*/

import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — What props this component accepts
//
// This component only needs one prop: children.
// "children" is React's built-in word for "whatever you put between the
// opening and closing tags of a component." For example:
//
//   <ProjectImgFrame>
//     <img src="..." />     ← this is the children
//   </ProjectImgFrame>
//
// ReactNode is the TypeScript type that covers anything React can render:
// an image, a div, a placeholder component, text — anything goes.
// ─────────────────────────────────────────────────────────
interface ProjectImgFrameProps {
  children: ReactNode
}

export default function ProjectImgFrame({ children }: ProjectImgFrameProps) {
  return (
    // ─────────────────────────────────────────────────────
    // OUTER FRAME
    //
    // This is the visible card shell — the part you see as the "frame."
    //
    // - w-full: fills the width of whatever contains it
    // - p-3: 12px padding on all sides (--spacing-3 token). This creates the
    //   gap between the outer border and the inner image area.
    // - rounded-lg: 8px corner radius, matching the ProjectCover corner spec
    // - border border-stroke-border: 1px solid border using the system border token
    //
    // Inline styles handle the three values that can't be Tailwind utilities:
    // - background: a white gradient (main → subtle = #FFF → #FAFAFA).
    //   This gives a barely perceptible warmth to the frame vs. a flat white.
    // - boxShadow: --shadow-card — the same 1px soft shadow used on ProjectCover.
    //   It reinforces the physical "card lying on a surface" metaphor.
    // - aspectRatio / maxWidth / maxHeight: locks the frame to a 400×400 square.
    // ─────────────────────────────────────────────────────
    <div
      className="w-full p-3 rounded-lg border border-stroke-border"
      style={{
        background: 'linear-gradient(to bottom right, var(--color-surface-main), var(--color-surface-subtle))',
        boxShadow:  'var(--shadow-card)',
        aspectRatio: '1 / 1',
        maxWidth:    '400px',
        maxHeight:   '400px',
      }}
    >

      {/* ─────────────────────────────────────────────────
          INNER IMAGE AREA

          This inner div is the "window" the image shows through.
          It fills all space left after the 12px padding is applied.

          - w-full h-full: fills the entire available space inside the
            outer frame's padding box. The parent's aspect-ratio gives it
            a computed height, so h-full has something to fill against.
          - overflow-hidden: clips the image at this boundary. If the image
            is larger than the frame, the edges are cut off cleanly rather
            than overflowing outside the rounded corner.
          - rounded: 4px corner radius — slightly softer than the outer
            frame's 8px, creating a sense of depth (the inner image sits
            slightly "inside" the frame).
      ───────────────────────────────────────────────── */}
      <div className="w-full h-full overflow-hidden rounded">
        {children}
      </div>

    </div>
  )
}
