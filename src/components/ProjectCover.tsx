/*
  PROJECT COVER COMPONENT
  -----------------------
  A square card that acts as the visual "cover" for a project entry — think of it
  like the front face of a physical card in a stack. It shows the project's category
  tag, title, and a short description against a soft gradient background.

  It accepts four props:
  - color: "blue" | "indigo" | "purple" — picks which gradient background to use
  - isHovered: boolean — when the parent card is hovered, the title switches to the
    accent color (blue in day theme, blue-gray in night theme). Defaults to false.
  - tag: a short category label shown at the top in monospace uppercase (e.g. "Case Study")
  - title: the project name, shown as a large bold heading
  - description: a short blurb below the title. Clipping at the bottom is intentional.

  Important: this component never rotates itself. Rotation is applied by the
  parent component that wraps it — this keeps concerns separate and the component reusable.

  Gradient tokens (--gradient-cover-blue/indigo/purple) live in globals.css and are
  applied via inline style — they are not Tailwind utilities. Everything else uses
  Tailwind classes or the named CSS classes from globals.css.
*/

import Tag from '@/src/components/ui/Tag'

// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — What props this component accepts
//
// An interface is a blueprint that describes the exact shape of
// the information this component needs. TypeScript will warn you
// at edit time (before the page loads) if anything is missing or wrong.
// ─────────────────────────────────────────────────────────
interface ProjectCoverProps {
  // Which gradient background to use. The | means "or" — only these
  // three strings are valid. Passing anything else is a TypeScript error.
  color: 'blue' | 'indigo' | 'purple'

  // When true, the title turns the accent color (blue / blue-gray depending on theme).
  // The ? means this prop is optional — if the parent doesn't pass it, it defaults to false.
  isHovered?: boolean

  // Short category label shown at the top — rendered as IBM Plex Mono uppercase.
  tag: string

  // The project name — rendered as a large bold Figtree heading.
  title: string

  // A brief description shown at the bottom of the card.
  // If it's too long to fit, it clips — that's by design, no overflow handling here.
  description: string
}

// ─────────────────────────────────────────────────────────
// GRADIENT MAP
//
// A plain JavaScript object that maps each color name to the
// corresponding CSS custom property reference from globals.css.
// We use this to look up the right gradient based on the `color` prop.
//
// These are used as inline styles — not Tailwind utilities — because
// gradient values are complex strings that Tailwind can't generate
// utilities for at build time.
// ─────────────────────────────────────────────────────────
const gradientMap: Record<ProjectCoverProps['color'], string> = {
  blue:   'var(--gradient-cover-blue)',
  indigo: 'var(--gradient-cover-indigo)',
  purple: 'var(--gradient-cover-purple)',
}

// ─────────────────────────────────────────────────────────
// PROJECT COVER COMPONENT
//
// We destructure props directly in the function signature.
// isHovered defaults to false if the parent doesn't pass it.
// ─────────────────────────────────────────────────────────
export default function ProjectCover({
  color,
  isHovered = false,
  tag,
  title,
  description,
}: ProjectCoverProps) {

  return (
    // ─────────────────────────────────────────────────────
    // OUTER CARD CONTAINER
    //
    // - flex flex-col: stacks children vertically
    // - justify-between: pushes the tag+title group to the top
    //   and the description to the bottom, with space between them
    // - p-4 md:p-8: 16px padding on mobile, 32px on tablet and above.
    //   The md: prefix means "apply this at 768px and wider."
    //   Cards are smaller on mobile so the tighter padding keeps content
    //   from feeling cramped against the edges.
    // - w-full: fills the width of whatever contains it
    // - rounded-lg: 8px corner radius on all corners
    // - border border-stroke-border: 1px solid border using the
    //   design system's border color token
    // - overflow-hidden: clips any content that grows beyond the
    //   card boundary — enforces the square shape strictly
    //
    // Inline styles handle the three properties that aren't Tailwind utilities:
    // - background: the gradient, looked up from gradientMap by color prop
    // - boxShadow: the card shadow token (system exception for ProjectCover only)
    // - aspectRatio / maxWidth / maxHeight: constrain the card to a 400×400 square
    // ─────────────────────────────────────────────────────
    <div
      className="flex flex-col justify-between p-4 md:p-8 w-full rounded-lg border border-stroke-border overflow-hidden"
      style={{
        background:  gradientMap[color],
        boxShadow:   'var(--shadow-card)',
        aspectRatio: '1 / 1',
        maxWidth:    '400px',
        maxHeight:   '400px',
      }}
    >

      {/* ─────────────────────────────────────────────────
          TOP GROUP: TAG + TITLE
          These two sit together at the top of the card.
          gap-1 applies 4px of vertical space between them
          (--spacing-1 token), per the spec.
      ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">

        {/* TAG — reuses the existing Tag component.
            variant="minimal" means text-only, no border or background.
            color="default" gives --color-text-body (body gray).
            IBM Plex Mono, 14px, uppercase — all handled inside Tag.tsx. */}
        <Tag variant="minimal" color="default">{tag}</Tag>

        {/* TITLE — Figtree Bold, 32px/40px (heading-1-bold class from globals.css).
            Color switches between two values based on isHovered:
            - false → --color-text-heading (near-black)
            - true  → --color-text-primary (accent blue in day, blue-gray in night)
            The transition makes the color change animate smoothly over 0.2s
            when the parent toggles isHovered. */}
        <h2
          className="heading-1-bold"
          style={{
            color:      isHovered ? 'var(--color-text-primary)' : 'var(--color-text-heading)',
            transition: 'color 0.2s ease',
          }}
        >
          {title}
        </h2>

      </div>

      {/* ─────────────────────────────────────────────────
          DESCRIPTION
          Sits at the bottom of the card, pushed down by
          justify-between. Figtree Regular 16px (body-1 class).
          Color is always --color-text-body (body gray).
          Clipping at the bottom edge is intentional — no
          overflow handling is applied here.
      ───────────────────────────────────────────────── */}
      <p className="body-1 text-text-body">
        {description}
      </p>

    </div>
  )
}
