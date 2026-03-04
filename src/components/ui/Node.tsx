/*
  NODE COMPONENT
  ------------------
  A dashed placeholder box used to represent unbuilt content slots during
  layout construction. Drop it anywhere in a layout to hold space for a
  component that hasn't been built yet. Replace it with the real component
  when it's ready.

  Key decisions:
  - Uses an SVG element to draw the dashed border, so the dash pattern can be
    exactly 8px dash / 8px gap as specified. CSS `border-style: dashed` uses
    browser-defined dash sizes with no way to control them, so SVG is used.
  - Background and stroke colors reference CSS custom property tokens —
    never hardcoded hex values — so they automatically reflect any token updates.
  - No interactive states. This is a static layout tool, not a UI element
    that users interact with.
*/

// ─────────────────────────────────────────────────────────
// TYPESCRIPT PROPS
//
// Think of this like Figma's component properties panel —
// it lists exactly what the parent can pass in to control
// how this component looks.
//
// The `?` after each prop name means the prop is OPTIONAL.
// If the parent doesn't pass it, the default value defined
// in the function signature is used instead. Without `?`,
// a prop would be REQUIRED — TypeScript would show an error
// if the parent forgot to include it.
// ─────────────────────────────────────────────────────────
interface NodeProps {
  height?: number  // Height in px. Defaults to 24px when not provided.
  width?: number   // Width in px. Defaults to full container width when not provided.
}

// ─────────────────────────────────────────────────────────
// NODE COMPONENT
//
// Props are "destructured" in the function signature — instead
// of writing props.height and props.width, we pull each value
// out by name directly. The `= 24` after height is a default
// value: if the parent doesn't pass `height`, it is 24.
// ─────────────────────────────────────────────────────────
export default function Node({ height = 24, width }: NodeProps) {

  // ─────────────────────────────────────────────────────────
  // SIZING
  //
  // Convert the numeric px props into CSS string values.
  //
  // If `width` was not passed (it is `undefined`), the box fills
  // its container — width: 100% — which is Figma's "Fill container"
  // behavior. If a number was passed (e.g. width={240}), it becomes
  // a fixed pixel value like "240px" — Figma's "Fixed" width.
  // ─────────────────────────────────────────────────────────
  const resolvedWidth  = width !== undefined ? `${width}px` : '100%'
  const resolvedHeight = `${height}px`

  return (
    // ─────────────────────────────────────────────────────────
    // CONTAINER DIV
    //
    // `position: relative` is required so the SVG child (the
    // dashed border) can be positioned absolutely relative to
    // this box, not relative to the page or a parent element.
    //
    // `backgroundColor` uses a CSS custom property token.
    // `var(--color-surface-subtle)` resolves to the value set
    // in globals.css — currently #FAFAFA (gray/50). It is never
    // hardcoded here, so updating the token updates every Node
    // automatically.
    //
    // `borderRadius: '4px'` rounds all four corners.
    //
    // `boxSizing: 'border-box'` tells the browser to count any
    // border inside the element's stated width and height, not
    // added on top. The spec says "border applied inside the box
    // (do not let it add to the element's dimensions)."
    // ─────────────────────────────────────────────────────────
    <div
      style={{
        position:        'relative',
        width:           resolvedWidth,
        height:          resolvedHeight,
        backgroundColor: 'var(--color-surface-subtle)',
        borderRadius:    '4px',
        boxSizing:       'border-box',
      }}
    >
      {/*
        DASHED BORDER — drawn with SVG

        WHY SVG instead of CSS `border-style: dashed`?
        The design spec requires a specific dash pattern: 8px dash,
        8px gap. CSS dashed borders don't expose that control —
        the browser decides the dash size. SVG's `stroke-dasharray`
        attribute lets us set the exact pattern.

        HOW THE POSITIONING WORKS:
        The SVG is placed 0.5px inside the container on all sides
        (top: 0.5px, left: 0.5px) and sized `calc(100% - 1px)` in
        each dimension. The 1px stroke on the <rect> is centered on
        the rect's edges — 0.5px inward, 0.5px outward. Since the
        SVG is already inset 0.5px, the outward 0.5px of stroke
        lands exactly on the container's boundary. The full 1px
        stroke stays visually inside the component box.

        `aria-hidden="true"` hides this SVG from screen readers.
        It is purely decorative — no meaningful content here.

        `pointerEvents: 'none'` means clicks pass straight through
        the SVG to whatever is underneath it.
      */}
      <svg
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           '0.5px',
          left:          '0.5px',
          width:         'calc(100% - 1px)',
          height:        'calc(100% - 1px)',
          pointerEvents: 'none',
        }}
      >
        {/*
          RECT — the dashed rectangle

          `fill="none"` — no fill inside the shape. The container
          div's backgroundColor provides the background.

          `stroke` — the border color. Uses a CSS custom property
          token via `var(--color-stroke-border)`, which is #E9EAEB
          (gray/200). Not a hardcoded hex value.

          `strokeWidth="1"` — 1px border as specified.

          `strokeDasharray="8 8"` — 8px of visible dash, then 8px
          of gap, repeating. This is the exact pattern from the spec.

          `rx="3.5" ry="3.5"` — rounded corners on the rect itself.
          The rect is inset 0.5px from the container, so using 3.5px
          here places the stroke's centerline at the same visual
          position as the container's 4px border-radius.
        */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="var(--color-stroke-border)"
          strokeWidth="1"
          strokeDasharray="8 8"
          rx="3.5"
          ry="3.5"
        />
      </svg>
    </div>
  )
}
