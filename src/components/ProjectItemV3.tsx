/*
  PROJECT ITEM V3 COMPONENT
  -------------------------
  A third layout variant for project entries on the homepage work section.

  Unlike ProjectItemV2 (which puts text beside the cards in a two-column grid),
  this version stacks everything vertically — cards span the full container width
  in a permanent fan, and the text (tag, title, description) sits below them.

  HOW IT'S LAID OUT:

  Desktop (≥768px):
    Single vertical flex column with 40px gap between cards and text.
    Cards fan: full container width, 400px tall, cards spread edge-to-edge.
    Text: max-width 800px, left-aligned, two levels of gap (tag→title 4px, title→desc 8px).

  Mobile (<768px):
    Identical to ProjectItemV2 mobile — swipeable card pile on top, text below.
    Breakpoint matches NavBar: matchMedia('(max-width: 767px)') — not the 900px used in V2.

  Props:
  - tag:         Short category label (e.g. "Case Study") shown above the title.
  - title:       Project name, rendered as a bold heading.
  - description: Short blurb below the heading.
  - images:      Up to 5 image URLs. If empty or missing, shows 1 placeholder card.
  - href:        Optional. If provided, the entire component becomes a clickable link.

  Components used:
  - ProjectImgFrame (sizing="auto-width") — the card frame shell. The wrapper div
    here controls the actual card size (400×400px); the frame fills it.

  Breakpoint: matchMedia('(max-width: 767px)') — same boundary as NavBar.
*/

'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import ProjectImgFrame from '@/src/components/ui/ProjectImgFrame'


// ─────────────────────────────────────────────────────────
// DESKTOP CARD ROTATIONS
//
// Same rotation angles as ProjectItemV2 — see that file for the full explanation.
// Each card in the fan tilts at a fixed angle to create the stacked-deck look.
// Index 0 (front card) is straight; cards behind alternate between right and left tilts.
// ─────────────────────────────────────────────────────────
const CARD_ROTATIONS = [0, 3, -4, 5, -3] as const


// ─────────────────────────────────────────────────────────
// DEFAULT CARD WIDTH
//
// Same spread-formula default as ProjectItemV2 — see that file for explanation.
// 400px = the placeholder card's square size, used until real images are measured.
// ─────────────────────────────────────────────────────────
const CARD_W = 400


// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — what props this component accepts
//
// An interface is a blueprint. TypeScript checks that anyone using
// <ProjectItemV3 /> passes the right information in the right shape.
//
// The `?` after a prop name means optional — the component still works
// if that prop isn't passed.
// ─────────────────────────────────────────────────────────
interface ProjectItemV3Props {
  // Short category label shown above the title. Monospace, uppercase-ish.
  tag: string

  // Project name — large heading (heading-1 on desktop, heading-2 / 600 on mobile).
  title: string

  // Short description paragraph below the heading.
  description: string

  // Up to 5 image URLs. Empty or omitted → one placeholder checkerboard card.
  images?: string[]

  // If provided, the whole component becomes a clickable link to this URL.
  href?: string
}


export default function ProjectItemV3({
  tag,
  title,
  description,
  images = [],
  href,
}: ProjectItemV3Props) {

  // ─────────────────────────────────────────────────────
  // REF: CARDS CONTAINER ELEMENT
  //
  // A ref is a direct handle to a real DOM element in the browser.
  // We attach this to the <div> that holds the cards so we can:
  //   1. Measure its pixel width (needed for the spread formula)
  //   2. Write CSS custom properties onto it (for mobile drag animation)
  //
  // Starts as null; gets populated when the div mounts.
  // ─────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)

  // The measured pixel width of the cards container.
  // Starts at 0 (unknown) until the ResizeObserver fires after mount.
  const [containerWidth, setContainerWidth] = useState(0)

  // Whether the viewport is ≤767px (shows mobile layout).
  // Starts as false (desktop) to match server-rendered HTML.
  // Corrects to the real value immediately on mount via matchMedia.
  const [isMobile, setIsMobile] = useState(false)

  // Desktop only: which card index the mouse is hovering (-1 = none).
  const [hoveredIndex, setHoveredIndex] = useState(-1)


  // ── MOBILE SWIPE STATE ──────────────────────────────────
  // All swipe state below is identical to ProjectItemV2.
  // See that file for detailed plain-English explanations of each variable.

  // Which card is currently on top of the pile.
  const [activeIndex, setActiveIndex] = useState(0)

  // X coordinate where the current touch started.
  // Stored as a ref (not state) so handleTouchMove can read it without re-renders.
  const touchStartX = useRef(0)

  // How far the finger has dragged from the touch start, in pixels.
  // Written directly to CSS custom properties — not React state — for 60fps smoothness.
  const dragXRef = useRef(0)

  // True while an exit animation or snap-back is running.
  // Blocks new touch input until the animation completes.
  const [isAnimating, setIsAnimating] = useState(false)

  // Which direction the current exit animation goes ('left', 'right', or null).
  // null = card is at rest or snapping back to center.
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  // Controls which cards peek behind the active card.
  // Flips between +1 and -1 on each swipe so the correct cards are shown.
  const [midOffset, setMidOffset] = useState<1 | -1>(1)

  // Handle to a pending animation timeout — lets us cancel it on unmount
  // to avoid trying to update state on an unmounted component.
  const mobileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  // ─────────────────────────────────────────────────────
  // CARDS DATA
  //
  // Cap at 5 cards, always show at least 1 even if no URLs are provided.
  // An empty string URL still counts as a card slot — it renders as a
  // placeholder checkerboard instead of a broken image.
  // ─────────────────────────────────────────────────────
  const cardImages = images.slice(0, 5)
  const count      = cardImages.length > 0 ? cardImages.length : 1
  const totalCards = count


  // ─────────────────────────────────────────────────────
  // MOBILE CARD SIZE
  //
  // Cards fill the full container width. We default to 280px while the
  // container is still being measured, then jump to the real width.
  // ─────────────────────────────────────────────────────
  const mobileCardSize = containerWidth > 0 ? containerWidth : 280


  // ── EFFECTS ───────────────────────────────────────────────────
  //
  // Effects are code that runs after React has painted the component to the browser.
  // This is the right place for anything that touches the real DOM or browser APIs.


  // Measure the cards container width on mount and whenever it changes.
  // Re-runs when isMobile changes because containerRef moves to a different
  // DOM element at the breakpoint switch (desktop vs mobile render path).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Immediate read — don't wait for the observer's first async callback.
    setContainerWidth(el.getBoundingClientRect().width)

    // ResizeObserver fires whenever the element's size changes —
    // handles window resizes, orientation changes, and layout shifts.
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [isMobile])


  // Watch for the viewport crossing the 767px boundary.
  // This component and NavBar share the same breakpoint — unlike ProjectItemV2
  // which breaks at 899px.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])


  // Cancel any pending mobile animation timeout on unmount.
  useEffect(() => {
    return () => {
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current)
    }
  }, [])


  // Reset all mobile swipe state whenever the layout switches between
  // mobile and desktop — prevents stuck animations on device rotation.
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
  // DESKTOP: COUNT-BASED SPREAD FORMULA
  //
  // The spread formula has two modes depending on how many cards are in the pile:
  //
  //   4–5 cards → EDGE-TO-EDGE (full width)
  //     Cards fill the entire container left-to-right.
  //     More cards = smaller gap = more overlap. The pile always looks full.
  //
  //   2–3 cards → CENTERED PILE
  //     Cards don't fill the container — instead the pile is centered.
  //     Gap is derived from containerWidth / (count + 1), which produces
  //     a natural-feeling overlap without the pile looking sparse.
  //
  //   1 card → CENTERED SINGLE
  //     No gap math needed. Just center the card.
  //
  // In all cases: left[i] = startOffset + i × gap
  // ─────────────────────────────────────────────────────
  function getCardLeft(index: number): number {
    let gap: number
    let startOffset: number

    if (count >= 4) {
      // 4–5 cards: fill edge-to-edge, gap shrinks as count grows.
      gap         = (containerWidth - CARD_W) / (count - 1)
      startOffset = 0
    } else if (count === 1) {
      // Single card: just center it.
      gap         = 0
      startOffset = (containerWidth - CARD_W) / 2
    } else {
      // 2–3 cards: centered pile with natural overlap.
      // Dividing by (count + 1) produces a gap that feels grouped, not sparse.
      gap              = containerWidth / (count + 1)
      const pileWidth  = CARD_W + gap * (count - 1)
      startOffset      = (containerWidth - pileWidth) / 2
    }

    return startOffset + index * gap
  }


  // ── MOBILE TOUCH HANDLERS ────────────────────────────────────
  //
  // Identical logic to ProjectItemV2 — see that file for full explanation.
  // Three functions that handle the full swipe lifecycle:
  //   handleTouchStart → record where the finger landed
  //   handleTouchMove  → update CSS vars so the card follows the finger
  //   handleTouchEnd   → commit swipe or snap back


  // Records the starting X position. Ignored while an animation is running.
  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimating) return
    touchStartX.current = e.touches[0].clientX
  }


  // Writes drag distance directly to CSS custom properties — no React re-render.
  // `--drag-x` moves the card; `--drag-rot` tilts it proportionally.
  function handleTouchMove(e: React.TouchEvent) {
    if (isAnimating) return
    const value = e.touches[0].clientX - touchStartX.current
    const tilt  = Math.min(Math.max(value * 0.04, -12), 12)
    dragXRef.current = value
    const el = containerRef.current
    if (el) {
      el.style.setProperty('--drag-x', `${value}px`)
      el.style.setProperty('--drag-rot', `${tilt}deg`)
    }
  }


  // Commits the swipe (>80px) or snaps back (<80px).
  function handleTouchEnd(e: React.TouchEvent) {
    if (isAnimating) return
    const delta = e.changedTouches[0].clientX - touchStartX.current

    if (Math.abs(delta) > 80) {
      // ── SWIPE COMMITTED ─────────────────────────────────────
      // Card flies off the screen, then activeIndex advances.
      const dir: 'left' | 'right' = delta < 0 ? 'left' : 'right'
      dragXRef.current = 0
      setIsAnimating(true)
      setExitDir(dir)

      // 220ms matches the CSS exit transition duration below.
      mobileTimeoutRef.current = setTimeout(() => {
        const el = containerRef.current
        if (el) {
          el.style.setProperty('--drag-x', '0px')
          el.style.setProperty('--drag-rot', '0deg')
        }
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
      // ── SNAP BACK ────────────────────────────────────────────
      // Card returns to center over 200ms.
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
  // Same logic as ProjectItemV2 — see that file for explanation.
  //
  // ProjectImgFrame with sizing="auto-width" fills whatever wrapper div
  // surrounds it. The wrapper div sets the actual pixel dimensions.
  // ─────────────────────────────────────────────────────
  function renderCard(index: number) {
    const src             = cardImages[index]
    const showPlaceholder = !src
    return (
      <ProjectImgFrame sizing="auto-width">
        {showPlaceholder ? (
          // Placeholder: checkerboard pattern defined in globals.css.
          <div className="placeholder-image w-full h-full" />
        ) : (
          // Real image: object-cover fills the frame without stretching or squishing.
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
  // Identical to ProjectItemV2 mobile with two differences:
  //   1. Breakpoint is 767px instead of 899px.
  //   2. Title uses `heading-2` (24px / weight 600) instead of `heading-3-bold`.
  // ─────────────────────────────────────────────────────
  if (isMobile) {

    // ── WHICH CARD SITS AT EACH STACK POSITION ────────────────
    //
    // Three visible layers: top (active + draggable), mid, back.
    // Modulo math wraps infinitely so the deck loops forever.
    // See ProjectItemV2 for the full explanation.
    const topIdx  = activeIndex % totalCards
    const midIdx  = ((activeIndex + midOffset)     % totalCards + totalCards) % totalCards
    const backIdx = ((activeIndex + 2 * midOffset) % totalCards + totalCards) % totalCards

    // At-rest CSS transforms for each stack layer.
    const pos0 = 'translateX(0) translateY(0) rotate(0deg) scale(1)'
    const pos1 = 'translateX(32px) translateY(28px) rotate(7deg) scale(0.92)'
    const pos2 = 'translateX(-24px) translateY(52px) rotate(-6deg) scale(0.84)'

    // ── TOP CARD TRANSFORM + OPACITY ──────────────────────────
    // During exit: fly off screen. During drag: follow CSS vars. At rest: pos0.
    let topTransform: string
    let topOpacity = 1

    if (isAnimating && exitDir === 'left') {
      topTransform = 'translateX(-120%) rotate(-18deg)'
      topOpacity   = 0
    } else if (isAnimating && exitDir === 'right') {
      topTransform = 'translateX(120%) rotate(18deg)'
      topOpacity   = 0
    } else {
      topTransform = isAnimating
        ? pos0
        : 'translateX(var(--drag-x, 0px)) rotate(var(--drag-rot, 0deg))'
    }

    // Transition ON during animations (smooth arc), OFF while dragging (instant follow).
    const topTransition = isAnimating
      ? exitDir !== null
        ? 'transform 220ms ease, opacity 220ms ease'
        : 'transform 200ms ease'
      : 'none'

    // Mid and back cards only advance when exit direction matches stack orientation.
    const shouldAnimate   = isAnimating && exitDir !== null &&
      ((exitDir === 'left') === (midOffset === 1))
    const midTransform    = shouldAnimate ? pos0 : pos1
    const backTransform   = shouldAnimate ? pos1 : pos2
    const stackTransition = shouldAnimate ? 'transform 220ms ease' : 'none'

    const mobileContent = (
      // Single column: cards pile on top, text below. Gap of 8px between them.
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>

        {/* ── CARDS PILE ─────────────────────────────────────────────
            position: relative makes this the coordinate origin for the
            three absolutely-positioned card layers inside.
            overflow: hidden clips cards as they exit left or right.
            Extra 60px of height prevents the back card's vertical offset
            from being clipped at the bottom. */}
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
              willChange: transform hints to the browser to GPU-composite this
              layer while dragging. Avoids potential jank on slower devices.
              We only set it while actively dragging to avoid wasting memory at rest. */}
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

        {/* ── TEXT SECTION ─────────────────────────────────────────────
            Mobile title is heading-2 (24px / 600) vs desktop heading-1 (32px).
            All three items share the same --spacing-2 gap between them. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <span className="label-2-medium" style={{ color: 'var(--color-text-subtle)' }}>
            {tag}
          </span>
          <h2 className="heading-2" style={{ color: 'var(--color-text-heading)' }}>
            {title}
          </h2>
          <p className="body-1" style={{ color: 'var(--color-text-body)' }}>
            {description}
          </p>
        </div>

      </div>
    )

    return href
      ? <Link href={href} style={{ display: 'block' }}>{mobileContent}</Link>
      : mobileContent
  }


  // ─────────────────────────────────────────────────────
  // DESKTOP LAYOUT (isMobile = false)
  //
  // Vertical flex column — cards on top, text below.
  //
  // Unlike ProjectItemV2 which uses a two-column CSS grid, this layout
  // is a single column. The cards fan spans the FULL container width,
  // and the text sits under it, left-aligned within a max-width constraint.
  //
  // The two-div hover trick (outer hit area + inner visual transform)
  // is the same as ProjectItemV2 — see that file for the detailed explanation.
  // Short version: without the split, the translateY(-8px) lift moves the
  // cursor hit area away from the cursor, causing hover flicker.
  // ─────────────────────────────────────────────────────
  const desktopContent = (

    // Outer column: 40px gap (--spacing-10) between cards area and text area.
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-10)' }}>

      {/* ── CARDS AREA ──────────────────────────────────────────────
          Full container width, 400px tall.
          position: relative gives absolutely positioned cards a coordinate origin.
          overflow: visible lets rotated card corners spill beyond the 400px boundary —
          this is intentional and part of the fanned look.

          opacity: 0 until containerWidth is measured — on the first render,
          containerWidth is 0, so getCardLeft() returns negative values (cards would
          appear off to the left). The ResizeObserver measures the real width and
          triggers a re-render, after which cards appear at the correct spread positions.
          Hiding until then prevents a visible "cards flying in" animation on load. */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          overflow: 'visible',
          opacity: containerWidth > 0 ? 1 : 0,
        }}
      >

        {/* Array.from({ length: count }, (_, i) => ...) creates a list of indices
            [0, 1, 2, ...] and renders one card per index.
            Same map pattern as ProjectItemV2 — see that file for explanation. */}
        {Array.from({ length: count }, (_, i) => {
          const rotation  = CARD_ROTATIONS[i] ?? 0
          const isHovered = hoveredIndex === i

          // Z-index: front card (index 0) gets the highest z-index (count).
          // Each card behind gets a lower value (count-1, count-2, ...).
          // The hovered card rises above all others (count+1).
          const zIndex = isHovered ? count + 1 : count - i

          return (
            <div
              key={i}
              // OUTER DIV — fixed 400×400 hit area.
              // onMouseEnter/Leave live here so the hover zone doesn't move
              // when the inner div lifts. See ProjectItemV2 for full explanation.
              style={{
                position: 'absolute',
                top: 0,
                left: getCardLeft(i),
                width: CARD_W,
                height: CARD_W,
                zIndex,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(-1)}
            >
              <div
                // INNER DIV — visual-only transform (rotation + hover lift).
                // Moving the transform here prevents hit-area drift on hover.
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `rotate(${rotation}deg) translateY(${isHovered ? -8 : 0}px)`,
                  transition: 'transform 0.2s ease',
                }}
              >
                {renderCard(i)}
              </div>
            </div>
          )
        })}

      </div>

      {/* ── TEXT AREA ──────────────────────────────────────────────
          max-width: 800px keeps the text readable without going edge-to-edge.
          No centering — left-aligned to visually anchor with the card fan above.

          Two levels of gap:
          - Outer gap (--spacing-2 / 8px): between the tag+title group and
            the description. Tag and title feel like a labeled unit; description
            is a separate paragraph below.
          - Inner gap (--spacing-1 / 4px): between tag and title. Tight enough
            that they read as a pair, not two separate items. */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          alignSelf: 'center',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)',
        }}
      >

        {/* Inner group: tag label + title heading, tightly spaced */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          <span className="label-2-medium" style={{ color: 'var(--color-text-subtle)' }}>
            {tag}
          </span>
          {/* heading-1 = Figtree 32px / weight 600. Larger than ProjectItemV2's heading-2-bold
              because text sits on its own row here with more visual breathing room. */}
          <h2 className="heading-1" style={{ color: 'var(--color-text-heading)' }}>
            {title}
          </h2>
        </div>

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
