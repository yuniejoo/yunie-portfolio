/*
  PROJECT IMG FRAME COMPONENT
  ---------------------------
  A decorative frame that holds a project image. Think of it like a picture
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

  SIZING MODES (controlled by the optional `sizing` prop):
  - "square" (default): always 400×400px. Used for standalone card stacks where
    the frame controls its own dimensions. Does not change at any breakpoint.
  - "auto-width": fills 100% of whatever parent container wraps it (both height
    and width). Used in ProjectItemV2 where the parent wrapper div sets the
    card size — the frame just fills it.

  Tokens used: --color-surface-main, --color-surface-subtle,
               --color-stroke-border, --shadow-card, --spacing-3 (12px padding)
*/

import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — What props this component accepts
//
// This component accepts two props: children and an optional sizing mode.
//
// "children" is React's built-in word for "whatever you put between the
// opening and closing tags of a component." For example:
//
//   <ProjectImgFrame>
//     <img src="..." />     ← this is the children
//   </ProjectImgFrame>
//
// ReactNode is the TypeScript type that covers anything React can render:
// an image, a div, a placeholder component, text — anything goes.
//
// "sizing" is optional (the `?` means you don't have to pass it).
// The | means "or" — only 'square' or 'auto-width' are valid values.
// ─────────────────────────────────────────────────────────
interface ProjectImgFrameProps {
  children: ReactNode

  // Controls how the frame sizes itself:
  // 'square' (default) — self-contained 400×400px square, capped by maxWidth/maxHeight.
  // 'auto-width' — fills 100% of parent height and width. Parent controls the size.
  sizing?: 'square' | 'auto-width'
}

export default function ProjectImgFrame({ children, sizing = 'square' }: ProjectImgFrameProps) {

  // ─────────────────────────────────────────────────────
  // SIZING MODE STYLES
  //
  // 'square': the frame manages its own size. aspectRatio: '1/1' combined with
  //   maxWidth/maxHeight keeps it at 400×400px regardless of its container.
  //
  // 'auto-width': the frame trusts its parent to control size. w-full and h-full
  //   (added to className below) make it fill 100% of parent width and height.
  //   No aspectRatio or maxSize constraints — the parent wrapper does that job.
  //   This is used in ProjectItemV2 where each card wrapper div is sized explicitly.
  // ─────────────────────────────────────────────────────
  const sizeStyles = sizing === 'square'
    ? { aspectRatio: '1 / 1', maxWidth: '400px', maxHeight: '400px' }
    : {}

  const sizeClass = sizing === 'auto-width' ? 'w-full h-full' : 'w-full'

  return (
    // ─────────────────────────────────────────────────────
    // OUTER FRAME
    //
    // This is the visible card shell — the part you see as the "frame."
    //
    // - w-full (or w-full h-full): fills the parent's dimensions.
    //   In 'square' mode the maxWidth/Height cap this at 400×400.
    //   In 'auto-width' mode the parent controls size.
    // - p-3: 12px padding on all sides (--spacing-3 token). This creates the
    //   gap between the outer border and the inner image area.
    // - rounded-lg: 8px corner radius, matching the ProjectCover corner spec
    // - border border-stroke-border: 1px solid border using the system border token
    //
    // Inline styles handle the values that can't be Tailwind utilities:
    // - background: a white gradient (main → subtle = #FFF → #FAFAFA).
    //   This gives a barely perceptible warmth to the frame vs. a flat white.
    // - boxShadow: --shadow-card — the same 1px soft shadow used on ProjectCover.
    //   It reinforces the physical "card lying on a surface" metaphor.
    // - sizeStyles: aspectRatio / maxWidth / maxHeight in 'square' mode only.
    // ─────────────────────────────────────────────────────
    <div
      className={`${sizeClass} p-3 rounded-lg border border-stroke-border`}
      style={{
        background: 'linear-gradient(to bottom right, var(--color-surface-main), var(--color-surface-subtle))',
        boxShadow:  'var(--shadow-card)',
        ...sizeStyles,
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
