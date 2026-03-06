/*
  PROJECT ITEM V2 COMPONENT
  -------------------------
  A new variant of the project entry card for the homepage work section.

  Unlike ProjectItem (which puts text on a cover card inside the stack),
  this version keeps text in a separate column beside the cards. The cards
  are always fanned out — no hover-to-reveal needed.

  HOW IT'S LAID OUT:

  Desktop (≥900px):
    Two-column CSS grid. Cards fill the left (2fr, wider) column in a
    permanent fan. Text sits in the right (1fr, narrower) column, vertically
    centered alongside the cards.
    `textSide="left"` flips this — text on the left, cards on the right.

  Mobile (<900px):
    Single column, stacked vertically. Cards are a swipeable physical pile
    on top; tag / title / description text sits below.

  Props:
  - tag:         Short category label (e.g. "Case Study") shown above the title.
  - title:       Project name, rendered as a bold heading.
  - description: Short blurb below the heading.
  - images:      Up to 5 image URLs. If empty or missing, shows 1 placeholder card.
  - textSide:    "left" | "right" — which side holds the text column on desktop.
                 Default: "right".
  - href:        Optional. If provided, the entire component becomes a clickable link.

  Components used:
  - ProjectImgFrame (sizing="auto-width") — the card frame shell. The parent
    wrapper div in this component controls the actual card dimensions.

  Breakpoint: matchMedia('(max-width: 899px)') — same pattern as ProjectItem.
*/

'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import ProjectImgFrame from '@/src/components/ui/ProjectImgFrame'


// ─────────────────────────────────────────────────────────
// DESKTOP CARD ROTATIONS
//
// Each card in the fan is tilted at a fixed angle.
// Index 0 (front card) is perfectly straight: rotate(0deg).
// Cards behind it alternate between leaning right and left,
// giving the natural look of a casually fanned-out deck.
//
// `as const` tells TypeScript to treat these as fixed specific numbers
// rather than the general "number" type. This prevents mistakes like
// accidentally passing an out-of-range index.
// ─────────────────────────────────────────────────────────
const CARD_ROTATIONS = [0, 3, -4, 5, -3] as const


// ─────────────────────────────────────────────────────────
// DEFAULT CARD WIDTH
//
// On desktop each card is `height: 400px; width: auto` — the image's
// natural aspect ratio determines its width. For the spread formula, we
// default to 400px (square) until we measure actual rendered widths.
// Placeholder images are always square so this default is always accurate
// for them. Non-square real images would need a second measurement pass.
// ─────────────────────────────────────────────────────────
const CARD_W = 400


// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — the "shape" of this component's props
//
// An interface is a blueprint. TypeScript checks that anyone using
// <ProjectItemV2 /> passes the right information in the right shape.
// Missing a required prop? TypeScript flags it before the page loads.
//
// The `?` after a prop name means optional — the component still works
// if that prop isn't passed. Optional props often have a default value
// declared in the function signature below.
// ─────────────────────────────────────────────────────────
interface ProjectItemV2Props {
  // Short category label shown above the title. IBM Plex Mono uppercase.
  tag: string

  // Project name — large bold heading.
  title: string

  // Short description below the heading.
  description: string

  // Up to 5 image URLs. If empty or omitted, one placeholder card is shown.
  images?: string[]

  // Which column holds the text on desktop.
  // "right" (default): cards left, text right.
  // "left": text left, cards right.
  textSide?: 'left' | 'right'

  // If provided, the whole component becomes a clickable link to this URL.
  href?: string
}


export default function ProjectItemV2({
  tag,
  title,
  description,
  images = [],
  textSide = 'right',
  href,
}: ProjectItemV2Props) {

  // ─────────────────────────────────────────────────────
  // REF: THE CARDS SECTION ELEMENT
  //
  // A ref is a direct handle to an actual DOM element in the browser.
  // We attach this to the <div> that contains the cards, which lets us:
  //   1. Measure its pixel width (for the spread formula + mobile card sizing)
  //   2. Write CSS custom properties onto it (for the mobile drag animation)
  //
  // It starts as null and gets populated automatically when the div mounts.
  // `useRef<HTMLDivElement>` means "a ref that will point to a <div>."
  // ─────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)

  // The measured pixel width of the cards section.
  // Starts at 0 (unknown) until the ResizeObserver fires after mount.
  const [containerWidth, setContainerWidth] = useState(0)

  // Whether the viewport is ≤899px (shows mobile layout).
  // Starts as false (desktop) to match the server-rendered HTML, then
  // corrects to the real value immediately on mount via matchMedia.
  const [isMobile, setIsMobile] = useState(false)

  // Desktop only: which card index the mouse is over (-1 = none hovered).
  const [hoveredIndex, setHoveredIndex] = useState(-1)


  // ── MOBILE SWIPE STATE ──────────────────────────────────

  // Which card is currently on top of the pile (index into the cards array).
  const [activeIndex, setActiveIndex] = useState(0)

  // The X coordinate where the current touch started, stored as a ref so we
  // can read it in handleTouchMove without triggering a re-render each time.
  const touchStartX = useRef(0)

  // How far the finger has dragged from the touch start (in pixels).
  // Written directly to CSS custom properties — NOT stored in React state —
  // so the card follows the finger at 60fps without any React re-renders.
  const dragXRef = useRef(0)

  // True while an exit animation or snap-back is running.
  // Blocks new touch input until the animation completes.
  const [isAnimating, setIsAnimating] = useState(false)

  // Which direction the current exit animation goes ('left', 'right', or null).
  // null means the card is at rest or snapping back to center.
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  // Controls which cards peek behind the active card:
  // +1 = show the next cards in the deck (going forward)
  // -1 = show the previous cards (going backward)
  // Flips with each swipe direction so the swiped card always lands at the back.
  const [midOffset, setMidOffset] = useState<1 | -1>(1)

  // Ref to the active animation timeout so we can cancel it if the component
  // unmounts in the middle of an animation — prevents memory leaks.
  const mobileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  // ─────────────────────────────────────────────────────
  // CARDS DATA
  //
  // We cap at 5 cards and always show at least 1 even when no URLs are provided.
  //
  // Empty strings in the images array count as cards — they render as
  // placeholder checkerboard rather than a broken image. This lets you
  // pass `images={['', '', '']}` to preview a 3-card fan with placeholders.
  // ─────────────────────────────────────────────────────
  const cardImages = images.slice(0, 5)
  const count      = cardImages.length > 0 ? cardImages.length : 1
  const totalCards = count


  // ─────────────────────────────────────────────────────
  // MOBILE CARD SIZE
  //
  // Cards fill the full width of their container. We start at 280px
  // (a safe default while width is still being measured) then jump to
  // the real container width the moment the ResizeObserver fires.
  // ─────────────────────────────────────────────────────
  const mobileCardSize = containerWidth > 0 ? containerWidth : 280


  // ── EFFECTS ───────────────────────────────────────────────────
  //
  // "Effects" are code that runs after React has painted the component
  // to the browser — the right place for anything that talks to the
  // real DOM or the browser's APIs (like ResizeObserver or matchMedia).


  // Measure the cards section width on mount and whenever it or the
  // viewport changes. Also re-runs when isMobile changes, because the
  // containerRef moves to a different DOM element at the breakpoint switch.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Immediate read — don't wait for the observer's first async callback.
    // This ensures `containerWidth` is correct before the first paint.
    setContainerWidth(el.getBoundingClientRect().width)

    // ResizeObserver fires whenever the element's size changes —
    // handles window resizes, orientation changes, and layout shifts.
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(el)

    // Cleanup: when this effect re-runs or the component unmounts,
    // stop watching the old element before we start watching the new one.
    return () => observer.disconnect()
  }, [isMobile])


  // Watch for the viewport crossing the 900px boundary.
  // matchMedia fires an event only when the boundary is crossed — not on
  // every resize pixel — which is more efficient than a resize listener.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])


  // Cancel any pending mobile animation timeout on unmount.
  // Without this, the timeout callback could try to update state on an
  // unmounted component, causing a React warning.
  useEffect(() => {
    return () => {
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current)
    }
  }, [])


  // Reset all mobile swipe state whenever the layout switches between
  // mobile and desktop. Without this, rotating a device mid-swipe could
  // leave the component stuck in an animation or at the wrong card.
  useEffect(() => {
    dragXRef.current = 0
    const el = containerRef.current
    if (el) {
      el.style.setProperty('--drag-x', '0px')
      el.style.setProperty('--drag-rot', '0deg')
    }
    setActiveIndex(0)
    setIsAnimating(false)
    setExitDir(null)
    setMidOffset(1)
  }, [isMobile])


  // ─────────────────────────────────────────────────────
  // DESKTOP: SPREAD FORMULA
  //
  // Distributes cards across the full width of the cards column so they
  // just touch both edges — first card at left: 0, last card's right
  // edge at the column's right edge.
  //
  // Formula: left[i] = i × (columnWidth − cardWidth) / (count − 1)
  //
  // Example — 3 cards in a 600px column (CARD_W = 400):
  //   card 0: left = 0
  //   card 1: left = 1 × (600 − 400) / 2 = 100
  //   card 2: left = 2 × (600 − 400) / 2 = 200
  //
  // With heavy overlap (400px wide cards in a 600px column), the fan still
  // shows depth — each card is visible behind the one in front of it.
  // ─────────────────────────────────────────────────────
  function getCardLeft(index: number): number {
    if (count <= 1) return 0
    return index * (containerWidth - CARD_W) / (count - 1)
  }


  // ── MOBILE TOUCH HANDLERS ────────────────────────────────────
  //
  // Three functions that work together to handle a full swipe gesture.
  // The CSS custom property trick (writing directly to DOM rather than
  // updating React state) is what makes the drag feel instant and smooth.


  // Called when a finger first touches the screen.
  // Records the starting X position for later delta calculation.
  // Ignored while an animation is running (blocks double-swipe).
  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimating) return
    touchStartX.current = e.touches[0].clientX
  }


  // Called every frame while the finger is moving.
  // Calculates how far we've dragged and writes that directly to CSS
  // custom properties on the container — no React re-render needed.
  // The top card's transform reads `var(--drag-x)` and `var(--drag-rot)`
  // to follow the finger in real time.
  function handleTouchMove(e: React.TouchEvent) {
    if (isAnimating) return
    const value = e.touches[0].clientX - touchStartX.current
    // Tilt: a small rotation proportional to drag distance, clamped to ±12°.
    // Gives the physical feeling of a card held and pulled sideways.
    const tilt = Math.min(Math.max(value * 0.04, -12), 12)
    dragXRef.current = value
    const el = containerRef.current
    if (el) {
      el.style.setProperty('--drag-x', `${value}px`)
      el.style.setProperty('--drag-rot', `${tilt}deg`)
    }
  }


  // Called when the finger lifts from the screen.
  // Decision: did the drag travel more than 80px? → commit the swipe.
  //           Less than 80px? → snap the card back to center.
  function handleTouchEnd(e: React.TouchEvent) {
    if (isAnimating) return
    const delta = e.changedTouches[0].clientX - touchStartX.current

    if (Math.abs(delta) > 80) {
      // ── SWIPE COMMITTED ────────────────────────────────────────
      // The card flies off the screen in the swipe direction, then
      // activeIndex advances to bring the next card to the front.
      const dir: 'left' | 'right' = delta < 0 ? 'left' : 'right'
      dragXRef.current = 0
      setIsAnimating(true)
      setExitDir(dir)

      // 220ms matches the CSS exit transition duration below.
      // After it fires: clear CSS vars, advance activeIndex, unlock input.
      mobileTimeoutRef.current = setTimeout(() => {
        const el = containerRef.current
        if (el) {
          el.style.setProperty('--drag-x', '0px')
          el.style.setProperty('--drag-rot', '0deg')
        }
        // The arrow function form `i => (i + 1) % totalCards` uses the current
        // activeIndex value at the time the timeout fires — not the stale one
        // captured at the time setTimeout was called. Safe with async timeouts.
        setActiveIndex(i =>
          dir === 'left'
            ? (i + 1) % totalCards
            : (i - 1 + totalCards) % totalCards,
        )
        setMidOffset(dir === 'left' ? 1 : -1)
        setIsAnimating(false)
        setExitDir(null)
      }, 220)

    } else {
      // ── SNAP BACK ──────────────────────────────────────────────
      // The card returns to center over 200ms. CSS vars are cleared
      // inside the timeout (after the transition) so the card doesn't
      // jump back to 0 before the animation plays.
      dragXRef.current = 0
      setIsAnimating(true)
      mobileTimeoutRef.current = setTimeout(() => {
        const el = containerRef.current
        if (el) {
          el.style.setProperty('--drag-x', '0px')
          el.style.setProperty('--drag-rot', '0deg')
        }
        setIsAnimating(false)
      }, 200)
    }
  }


  // ─────────────────────────────────────────────────────
  // CARD RENDER HELPER
  //
  // Returns the JSX for a single card at a given index.
  // Uses ProjectImgFrame with sizing="auto-width" so the frame fills
  // whatever wrapper div the parent places it in. The wrapper div
  // (in both desktop and mobile layouts below) sets the actual pixel size.
  //
  // If no images were provided (hasImages = false), renders the
  // placeholder-image CSS class (checkerboard from globals.css) instead.
  // ─────────────────────────────────────────────────────
  function renderCard(index: number) {
    // Use the URL at this index. Empty string or missing → show placeholder.
    const src = cardImages[index]
    const showPlaceholder = !src
    return (
      <ProjectImgFrame sizing="auto-width">
        {showPlaceholder ? (
          // Placeholder: checkerboard pattern defined in globals.css.
          <div className="placeholder-image w-full h-full" />
        ) : (
          // Real image: object-cover fills the frame, cropping edges if needed.
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </ProjectImgFrame>
    )
  }


  // ─────────────────────────────────────────────────────
  // MOBILE LAYOUT (isMobile = true)
  //
  // Completely separate render path — no shared layout state with desktop.
  // Single column: swipeable card pile on top, text below.
  // ─────────────────────────────────────────────────────
  if (isMobile) {

    // ── WHICH CARD SITS AT EACH STACK POSITION ────────────────
    //
    // The pile always shows three visible layers:
    //   top (position 0)  — active card, flat, can be dragged
    //   mid (position 1)  — one step behind, slightly offset
    //   back (position 2) — two steps behind, further offset
    //
    // `activeIndex` tracks which card is currently at the top.
    // The modulo math (%) wraps around so the deck loops infinitely.
    // `midOffset` flips between +1 and -1 on each swipe so the peeking
    // cards always show the correct upcoming or returning cards.
    const topIdx  = activeIndex % totalCards
    const midIdx  = ((activeIndex + midOffset)       % totalCards + totalCards) % totalCards
    const backIdx = ((activeIndex + 2 * midOffset)   % totalCards + totalCards) % totalCards

    // At-rest CSS transform for each stack layer.
    // pos0: flat on top. pos1: offset right, slight tilt, scaled down.
    // pos2: offset left, more tilt, further scaled down.
    const pos0 = 'translateX(0) translateY(0) rotate(0deg) scale(1)'
    const pos1 = 'translateX(32px) translateY(28px) rotate(7deg) scale(0.92)'
    const pos2 = 'translateX(-24px) translateY(52px) rotate(-6deg) scale(0.84)'

    // ── TOP CARD: DRAG FOLLOW + EXIT ANIMATION ────────────────
    let topTransform: string
    let topOpacity = 1

    if (isAnimating && exitDir === 'left') {
      // Exit left: card flies past the left edge, rotating counterclockwise, fades out.
      topTransform = 'translateX(-120%) rotate(-18deg)'
      topOpacity   = 0
    } else if (isAnimating && exitDir === 'right') {
      // Exit right: card flies past the right edge, rotating clockwise, fades out.
      topTransform = 'translateX(120%) rotate(18deg)'
      topOpacity   = 0
    } else {
      // At rest or being dragged.
      // While dragging: reads the CSS custom properties set by handleTouchMove.
      // During snap-back (isAnimating is true, but exitDir is null): returns to pos0.
      topTransform = isAnimating
        ? pos0
        : 'translateX(var(--drag-x, 0px)) rotate(var(--drag-rot, 0deg))'
    }

    // CSS transition is ON during animations (so the exit arc looks smooth)
    // and OFF while dragging (so the card sticks to the finger instantly).
    const topTransition = isAnimating
      ? exitDir !== null
        ? 'transform 220ms ease, opacity 220ms ease'
        : 'transform 200ms ease'
      : 'none'

    // ── MID AND BACK CARDS: ADVANCE ON MATCHING EXIT DIRECTION ──
    //
    // Mid and back cards only slide forward (toward pos0) when the exit
    // direction matches the current stack orientation. The mismatch case
    // happens on direction reversals — animating the wrong cards there
    // would briefly show incorrect card content before activeIndex updates.
    const shouldAnimate   = isAnimating && exitDir !== null &&
      ((exitDir === 'left') === (midOffset === 1))
    const midTransform    = shouldAnimate ? pos0 : pos1
    const backTransform   = shouldAnimate ? pos1 : pos2
    const stackTransition = shouldAnimate ? 'transform 220ms ease' : 'none'

    const mobileContent = (
      // Single column: cards on top, text below.
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>

        {/* ── CARDS PILE ─────────────────────────────────────────────
            position: relative makes this div the coordinate origin for
            the three absolutely positioned card layers inside it.
            overflow: hidden clips cards as they exit left or right.
            The extra 28px of height lets the back card's offset position
            (translateY(22px)) stay visible without being clipped. */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: mobileCardSize + 60,
            position: 'relative',
            overflow: 'hidden',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {/* Back card — lowest z-index, furthest from viewer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: mobileCardSize,
              height: mobileCardSize,
              zIndex: 1,
              transform: backTransform,
              transition: stackTransition,
            }}
          >
            {renderCard(backIdx)}
          </div>

          {/* Mid card — middle layer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: mobileCardSize,
              height: mobileCardSize,
              zIndex: 2,
              transform: midTransform,
              transition: stackTransition,
            }}
          >
            {renderCard(midIdx)}
          </div>

          {/* Top card — frontmost, active, draggable.
              willChange: transform is a browser hint to prepare GPU compositing
              for this layer while actively dragging. Without it the browser may
              not promote it to its own layer, causing jank on slow devices.
              We only set it while actually dragging (dragXRef.current ≠ 0 and
              not animating) to avoid unnecessary memory usage at rest. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: mobileCardSize,
              height: mobileCardSize,
              zIndex: 3,
              transform: topTransform,
              opacity: topOpacity,
              transition: topTransition,
              willChange: dragXRef.current !== 0 && !isAnimating ? 'transform' : 'auto',
            }}
          >
            {renderCard(topIdx)}
          </div>

        </div>

        {/* ── TEXT SECTION ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <span className="label-2-medium" style={{ color: 'var(--color-text-subtle)' }}>
            {tag}
          </span>
          <h2 className="heading-2-bold" style={{ color: 'var(--color-text-heading)' }}>
            {title}
          </h2>
          <p className="body-1" style={{ color: 'var(--color-text-body)' }}>
            {description}
          </p>
        </div>

      </div>
    )

    // If href is provided, the whole component becomes a block-level link.
    // `display: block` prevents the <a> tag from collapsing to inline width.
    return href
      ? <Link href={href} style={{ display: 'block' }}>{mobileContent}</Link>
      : mobileContent
  }


  // ─────────────────────────────────────────────────────
  // DESKTOP LAYOUT (isMobile = false)
  //
  // Two-column CSS grid. Cards column is always 2fr (wider).
  // Text column is always 1fr (narrower), vertically centered.
  // textSide controls which side each column appears on visually.
  // ─────────────────────────────────────────────────────

  // ── COLUMN ORDER ──────────────────────────────────────────────
  //
  // DOM order is always: [cards, text] — better for accessibility
  // (screen readers and tab order follow DOM, not visual order).
  //
  // CSS `order` swaps the visual positions when textSide is "left".
  // We also flip `gridTemplateColumns` so the 2fr (wide) slot always
  // falls on the same side as the cards, regardless of which side that is.
  //
  // Why both order AND gridTemplateColumns?
  // `order` changes which grid cell each item lands in (1st or 2nd).
  // `gridTemplateColumns` controls what size those cells are.
  // We need both so the cards column is always the wider (2fr) one.
  //
  // textSide="right" → gridTemplate: 2fr 1fr, cards order:0, text order:1
  //   Visual: [cards(2fr) | text(1fr)] ✓
  //
  // textSide="left"  → gridTemplate: 1fr 2fr, cards order:1, text order:0
  //   Visual: [text(1fr) | cards(2fr)] ✓
  const cardsOrder = textSide === 'left' ? 1 : 0
  const textOrder  = textSide === 'left' ? 0 : 1

  const desktopContent = (
    // GRID CONTAINER — two columns, fixed 400px height
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: textSide === 'left' ? '1fr 2fr' : '2fr 1fr',
        gap: 'var(--spacing-10)',
        height: '400px',
      }}
    >

      {/* ── CARDS COLUMN ────────────────────────────────────────────
          position: relative gives absolutely positioned card children
          a coordinate origin at the top-left of this column.
          overflow: visible lets rotated cards spill beyond the 400px
          boundary — rotated corners extend outside, which is intentional. */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: '400px',
          overflow: 'visible',
          order: cardsOrder,
        }}
      >

        {/* `.map()` means "do this for each item in the array, in order."
            `Array.from({ length: count }, (_, i) => ...)` creates a list
            [0, 1, 2, ...count-1] and calls the function for each index `i`.
            The `_` is the unused element value — we only care about the index. */}
        {Array.from({ length: count }, (_, i) => {
          const rotation  = CARD_ROTATIONS[i] ?? 0
          const isHovered = hoveredIndex === i

          // Z-index: index 0 is the front card — it gets the highest z-index.
          // Each card behind it gets a lower z-index (count-1, count-2, …).
          // A hovered card rises above all others (+1 above the front card's z).
          const zIndex = isHovered ? count + 1 : count - i

          // ─────────────────────────────────────────────────
          // TWO-DIV STRUCTURE: separate hit area from visual
          //
          // Problem with a single div: the lift animation (translateY(-8px))
          // moves the element's DOM hit area upward with it. If the cursor is
          // near the card's bottom edge, the lift pulls the hit area away from
          // the cursor → onMouseLeave fires → card drops → cursor re-enters
          // → onMouseEnter fires → lift again... flicker loop. This reads as
          // "only reacts to click" because click holds the interaction briefly.
          //
          // Fix: outer div owns the fixed 400×400 hit area and z-index.
          //      Inner div owns the visual transform (rotation + hover lift).
          //      onMouseEnter/onMouseLeave are on the outer div.
          //      When the inner div lifts 8px, the outer hit area stays put —
          //      the cursor stays inside the outer div, no onMouseLeave fires.
          // ─────────────────────────────────────────────────
          return (
            <div
              key={i}
              // OUTER DIV — fixed hit area, handles hover events, controls z-index
              style={{
                position: 'absolute',
                top: 0,
                left: getCardLeft(i),
                width: CARD_W,
                height: CARD_W,
                zIndex,
                // left transitions smoothly during resize reflows.
                transition: 'left 0.3s ease',
                // pointer cursor signals the cards are interactive on hover
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(-1)}
            >
              <div
                // INNER DIV — visual-only transform (rotation + hover lift)
                // Does not affect pointer events — only the outer div's box matters.
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `rotate(${rotation}deg) translateY(${isHovered ? -8 : 0}px)`,
                  // Smooth lift/drop animation on hover.
                  transition: 'transform 0.2s ease',
                }}
              >
                {renderCard(i)}
              </div>
            </div>
          )
        })}

      </div>

      {/* ── TEXT COLUMN ──────────────────────────────────────────────
          justify-content: center vertically centers tag + title + description
          within the 400px column height, so text reads at mid-card level. */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)',
          justifyContent: 'flex-end',
          order: textOrder,
        }}
      >
        <span className="label-2-medium" style={{ color: 'var(--color-text-subtle)' }}>
          {tag}
        </span>
        <h2 className="heading-2-bold" style={{ color: 'var(--color-text-heading)' }}>
          {title}
        </h2>
        <p className="body-1" style={{ color: 'var(--color-text-body)' }}>
          {description}
        </p>
      </div>

    </div>
  )

  return href
    ? <Link href={href} style={{ display: 'block' }}>{desktopContent}</Link>
    : desktopContent
}
