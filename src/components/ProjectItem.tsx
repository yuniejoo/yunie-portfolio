/*
  PROJECT ITEM COMPONENT
  ----------------------
  A project entry in the homepage work section.

  DESKTOP (768px and above):
  Cards are stacked in a loose pile — slightly offset and rotated. The cover sits
  on top. On hover, the cards fan out to the right in two phases:
  - Phase 1 (immediate): image frames fan out, cover stays on top
  - Phase 2 (after 200ms): cover drops behind, all cards are visible
  Hovering any individual card lifts it to the front.

  MOBILE (below 768px):
  Cards render as a physical pile — stacked on top of each other. The active card sits
  flat on top; the cards behind it are offset down and slightly rotated to suggest depth.
  Swiping left/right drags the top card in real time; releasing past 80px flies it off
  and promotes the card behind it. Wrap-around navigation — last card loops back to first.

  The two modes are completely separate render paths — no shared interaction state.
  Breakpoint is driven by JS (containerWidth) so layout and state are always in sync.

  Props:
  - cover: a render prop — a function that receives the hover state (true/false)
    and returns the cover card element. On mobile, always receives false (no hover on touch).
  - images: an array of 1–4 image frame ReactNodes
  - rotationSeed: 1, 2, or 3 — selects a rotation preset for the desktop stack
*/

'use client'

import { useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'


// ─────────────────────────────────────────────────────────
// ROTATION PRESETS (desktop only)
//
// Each preset is an array of 4 rotation values — one per image frame.
// Sliced to images.length when applied. `as const` locks the values so
// TypeScript treats them as fixed numbers, not general number type.
// ─────────────────────────────────────────────────────────
const ROTATION_PRESETS = [
  [-6, 3, -3, 6],   // seed 1 — from Figma
  [-4, 5, -2, 7],   // seed 2
  [-7, 2, -5, 4],   // seed 3
] as const

// The cover card also tilts slightly on desktop — a different angle per seed.
const COVER_ROTATIONS = [-2, -3, -1.5] as const

// ─────────────────────────────────────────────────────────
// MOBILE CARD SIZING CONSTANTS
// ─────────────────────────────────────────────────────────
const CARD_MAX = 414       // largest a mobile card can be (matches cover's max)


// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — Props this component accepts
// ─────────────────────────────────────────────────────────
interface ProjectItemProps {
  // A render prop for the cover card.
  // The parent passes a function that receives hover state and returns the element.
  // This lets ProjectItem share its internal hover state with the cover so the
  // cover can respond visually (e.g. title color change on ProjectCover).
  // On mobile, always called with `false` — no hover on touch devices.
  cover: (hovered: boolean) => ReactNode

  // The image frames — 1 to 4 items.
  images: ReactNode[]

  // Which rotation preset to use (desktop only).
  // 1 | 2 | 3 means only these exact numbers are valid — TypeScript enforces this.
  rotationSeed: 1 | 2 | 3
}


// ─────────────────────────────────────────────────────────
// DESKTOP POSITION CALCULATOR
//
// Returns left values for each image frame and the cover card.
// Called fresh on every render — kept outside the component so it isn't
// re-created in memory each time the component re-renders.
// ─────────────────────────────────────────────────────────
function getPositions(
  containerWidth: number,
  isHovered: boolean,
  count: number,
): { imgFrameLefts: number[]; coverLeft: number } {

  if (count === 0) return { imgFrameLefts: [], coverLeft: 0 }

  const imgFrameLefts: number[] = []

  if (!isHovered) {
    // ── DEFAULT: stacked ────────────────────────────────
    // 4% spread — tighter with fewer cards, slightly looser with more.
    const stackSpread = containerWidth * 0.04
    for (let i = 0; i < count; i++) {
      imgFrameLefts.push(i * stackSpread)
    }
    const coverLeft = stackSpread * (count / 2)
    return { imgFrameLefts, coverLeft }

  } else {
    // ── HOVERED: fanned ─────────────────────────────────
    // Frames distributed across the right portion. Cover moves to left: 0.
    const fanStart = containerWidth * 0.17
    const fanSpread =
      count > 1 ? (containerWidth - fanStart - 440) / (count - 1) : 0
    for (let i = 0; i < count; i++) {
      imgFrameLefts.push(fanStart + fanSpread * i)
    }
    return { imgFrameLefts, coverLeft: 0 }
  }
}


// ─────────────────────────────────────────────────────────
// DESKTOP FRAME SIZE HELPER
//
// Outer frames (first/last) are 440px. Inner frames are 420px.
// Single frame is always 440px.
// ─────────────────────────────────────────────────────────
function getFrameSize(index: number, count: number): number {
  if (count === 1 || index === 0 || index === count - 1) return 440
  return 420
}


// ─────────────────────────────────────────────────────────
// PROJECT ITEM COMPONENT
// ─────────────────────────────────────────────────────────
export default function ProjectItem({ cover, images, rotationSeed }: ProjectItemProps) {

  // A ref to the outer container div — used to measure its width.
  const containerRef = useRef<HTMLDivElement>(null)

  // The measured container width in pixels. Starts at 0, set on mount.
  const [containerWidth, setContainerWidth] = useState(0)


  // ── DESKTOP STATE ────────────────────────────────────────

  // Whether the user's mouse is over the component.
  const [isHovered, setIsHovered] = useState(false)

  // Phase 2 flag: true 200ms after hover starts.
  // When true, the cover drops behind the image frames.
  const [coverBehind, setCoverBehind] = useState(false)

  // Which image frame (by index) is currently being hovered. -1 = none.
  const [activeImageIndex, setActiveImageIndex] = useState(-1)

  // Whether the cover itself is being hovered (only matters in phase 2).
  const [coverHovered, setCoverHovered] = useState(false)

  // Reference to the phase-2 setTimeout so it can be cancelled on mouse leave.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  // ── MOBILE STATE ─────────────────────────────────────────

  // Which card is currently centred in the mobile view.
  // Index 0 = cover, indices 1–N = image frames.
  const [activeIndex, setActiveIndex] = useState(0)

  // Stores the X position where a touch started, so we can measure the swipe distance.
  const touchStartX = useRef(0)

  // Drag offset written directly to DOM via CSS custom properties (--drag-x, --drag-rot).
  // A ref avoids React re-renders on every touchmove frame; CSS vars update the card live.
  const dragXRef = useRef(0)

  // True during the exit/snap-back transition — blocks new swipe input.
  const [isAnimating, setIsAnimating] = useState(false)

  // Direction of the current exit animation. null = snap-back or at rest.
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  // Which direction the peek cards face. +1 = show upcoming cards (forward),
  // -1 = show already-seen cards (backward). Flips with each swipe direction change
  // so the swiped card always lands at back position (2 steps behind the new top).
  const [midOffset, setMidOffset] = useState<1 | -1>(1)

  // Ref to the mobile animation timeout so it can be cancelled on unmount.
  const mobileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // true when viewport is below 768px — matches NavBar's CSS md: breakpoint.
  // Initialized false (desktop) and corrected on mount via matchMedia.
  const [isMobile, setIsMobile] = useState(false)


  // ── RESIZE OBSERVER ─────────────────────────────────────
  // Reads the container width immediately on mount (for the first render),
  // then watches for changes (e.g. window resize, device rotation).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Immediate read — don't wait for ResizeObserver's async first callback.
    setContainerWidth(el.getBoundingClientRect().width)

    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])


  // ── TIMEOUT CLEANUP ON UNMOUNT ───────────────────────────
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current)
    }
  }, [])

  // ── BREAKPOINT DETECTION ─────────────────────────────────
  // Fires only when the viewport crosses the 768px boundary — not on every resize pixel.
  // max-width: 767px matches Tailwind's md: breakpoint (min-width: 768px) exactly.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])


  // ── MOBILE CARD SIZING ───────────────────────────────────
  // Cards are 85% of container width, clamped between 280px and 414px.
  // `Math.max(..., 280)` sets the floor. `Math.min(..., CARD_MAX)` sets the ceiling.
  const cardSize = Math.min(Math.max(containerWidth * 0.85, 280), CARD_MAX)
  const totalCards = 1 + images.length  // 1 cover + N image frames


  // ── RESET MOBILE STATE ON BREAKPOINT SWITCH ──────────────
  // If the user rotates their device (mobile ↔ desktop), reset all mobile
  // interaction state so we don't land in a broken mid-animation state.
  useEffect(() => {
    dragXRef.current = 0
    if (containerRef.current) {
      containerRef.current.style.setProperty('--drag-x', '0px')
      containerRef.current.style.setProperty('--drag-rot', '0deg')
    }
    setActiveIndex(0)
    setIsAnimating(false)
    setExitDir(null)
    setMidOffset(1)
  }, [isMobile])


  // ── DESKTOP DERIVED VALUES ───────────────────────────────
  const count = images.length
  const presetIndex = rotationSeed - 1
  const rotations = ROTATION_PRESETS[presetIndex].slice(0, count)
  const coverRotation = COVER_ROTATIONS[presetIndex]
  const { imgFrameLefts, coverLeft } = getPositions(containerWidth, isHovered, count)


  // ── DESKTOP HOVER HANDLERS ───────────────────────────────

  function handleMouseEnter() {
    if (count === 0) return
    setIsHovered(true)
    timeoutRef.current = setTimeout(() => {
      setCoverBehind(true)
    }, 200)
  }

  function handleMouseLeave() {
    setIsHovered(false)
    setCoverBehind(false)
    setActiveImageIndex(-1)
    setCoverHovered(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }


  // ── DESKTOP COVER STYLING ────────────────────────────────

  // z-index: on top (10) by default, behind (0) in phase 2, lifted (20) when hovered in phase 2
  const coverZIndex = coverBehind ? (coverHovered ? 20 : 0) : 10

  // transform: tilted in default/phase 1, flat in phase 2, lifted when hovered in phase 2
  const coverTransform = coverBehind
    ? (coverHovered ? 'rotate(0deg) translateY(-8px)' : 'rotate(0deg)')
    : `rotate(${coverRotation}deg)`

  // transition: cover's transform gets a 0.15s delay in phase 2 so it settles
  // after moving left, then rotates to flat. z-index always switches instantly.
  const coverTransition = coverBehind
    ? 'left 0.3s ease, transform 0.4s ease 0.15s, z-index 0s'
    : 'left 0.3s ease, transform 0.4s ease, z-index 0s'


  // ── MOBILE TOUCH HANDLERS ────────────────────────────────

  // Record where the finger touched down. Ignored while an animation is running.
  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimating) return
    touchStartX.current = e.touches[0].clientX
  }

  // Track finger in real time — write translate and tilt directly to CSS custom properties.
  // No React state update → no re-render per frame. The card follows the finger via CSS.
  function handleTouchMove(e: React.TouchEvent) {
    if (isAnimating) return
    const value = e.touches[0].clientX - touchStartX.current
    const tilt = Math.min(Math.max(value * 0.04, -12), 12)
    dragXRef.current = value
    const el = containerRef.current
    if (el) {
      el.style.setProperty('--drag-x', `${value}px`)
      el.style.setProperty('--drag-rot', `${tilt}deg`)
    }
  }

  // On lift: past 80px threshold → exit shuffle. Below → snap back.
  function handleTouchEnd(e: React.TouchEvent) {
    if (isAnimating) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 80) {
      // Threshold met — zero the ref so isDragging reads false on next render.
      // CSS vars stay at drag position so the exit transition starts from where
      // the finger released, not from 0. They're cleared in the timeout callback.
      const dir: 'left' | 'right' = delta < 0 ? 'left' : 'right'
      dragXRef.current = 0
      setIsAnimating(true)
      setExitDir(dir)
      mobileTimeoutRef.current = setTimeout(() => {
        const el = containerRef.current
        if (el) {
          el.style.setProperty('--drag-x', '0px')
          el.style.setProperty('--drag-rot', '0deg')
        }
        setActiveIndex(i =>
          dir === 'left' ? (i + 1) % totalCards : (i - 1 + totalCards) % totalCards,
        )
        setMidOffset(dir === 'left' ? 1 : -1)
        setIsAnimating(false)
        setExitDir(null)
      }, 220)
    } else {
      // Below threshold — snap back to center. CSS vars cleared in the timeout
      // callback so the at-rest transform reads 0 after the snap transition ends.
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


  // ── RENDER ───────────────────────────────────────────────

  // ── MOBILE LAYOUT ──────────────────────────────────────
  // Completely separate render path — no overlap with desktop logic.
  // Cards render as a physical pile. Swiping shuffles the top card off with a
  // rotate+fade arc; the card cycles to the back of the deck (never disappears).
  if (isMobile) {
    // Build the ordered card array: cover at index 0, image frames at 1–N.
    // cover() is called with false — no hover state on touch.
    const allCards = [cover(false), ...images]
    const total = allCards.length

    // Which cards are at each stack position — always derived fresh from activeIndex.
    const topIdx  = activeIndex % total
    const midIdx  = ((activeIndex + midOffset) % total + total) % total
    const backIdx = ((activeIndex + 2 * midOffset) % total + total) % total

    // Position 1 (mid) X alternates by rotationSeed % 2 so each project item has
    // its own pile personality. Seed 2 mirrors; seeds 1 and 3 use defaults.
    const xSign = rotationSeed % 2 === 0 ? -1 : 1

    // ── AT-REST TRANSFORMS for each stack position ──────────
    const pos0 = 'translateX(0) translateY(0) rotate(0deg) scale(1)'
    const pos1 = `translateX(${xSign * 22}px) translateY(14px) rotate(${xSign * 5}deg) scale(0.95)`
    const pos2 = 'translateX(-16px) translateY(22px) rotate(-4deg) scale(0.90)'

    // ── TOP CARD TRANSFORM ───────────────────────────────────
    // While dragging: CSS vars --drag-x / --drag-rot written by handleTouchMove
    //   directly to the container element — no re-render needed.
    // During exit: fly off with combined rotate arc. Transition enabled.
    // During snap-back: return to pos0. Transition enabled.
    let topTransform: string
    let topOpacity = 1
    if (isAnimating && exitDir === 'left') {
      topTransform = 'translateX(-120%) rotate(-18deg)'
      topOpacity   = 0
    } else if (isAnimating && exitDir === 'right') {
      topTransform = 'translateX(120%) rotate(18deg)'
      topOpacity   = 0
    } else {
      // Snap-back: pos0. Dragging: CSS vars carry the live position.
      topTransform = isAnimating ? pos0 : 'translateX(var(--drag-x, 0px)) rotate(var(--drag-rot, 0deg))'
    }
    // Transition: on during isAnimating (exit 220ms, snap 200ms), off while dragging.
    const topTransition = isAnimating
      ? exitDir !== null
        ? 'transform 220ms ease, opacity 220ms ease'
        : 'transform 200ms ease'
      : 'none'

    // ── MID AND BACK TRANSFORMS ──────────────────────────────
    // Only advance mid→pos0 and back→pos1 on LEFT swipes (going forward).
    // On right swipes the incoming card was never in the visible stack, so advancing
    // mid/back would show the wrong card briefly before activeIndex updates.
    // Animate mid→pos0 and back→pos1 only when exit direction matches stack orientation.
    // Left swipe + forward stack (midOffset=1): mid/back advance. ✓
    // Right swipe + backward stack (midOffset=-1): mid/back advance. ✓
    // Mismatched direction: no animation (wrong cards would animate). ✓
    const shouldAnimate = isAnimating && exitDir !== null && ((exitDir === 'left') === (midOffset === 1))
    const midTransform  = shouldAnimate ? pos0 : pos1
    const backTransform = shouldAnimate ? pos1 : pos2
    const stackTransition = shouldAnimate ? 'transform 220ms ease' : 'none'

    // Horizontal centre — all three cards share the same left offset.
    const cardLeft = (containerWidth - cardSize) / 2

    return (
      // STACK CONTAINER
      // position: relative so all three card layers use absolute positioning.
      // overflow: hidden clips cards exiting left or right.
      // Extra height (cardSize + 28) gives the diagonally-offset back cards room
      // to peek at the bottom without being clipped.
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: cardSize + 28,
          position: 'relative',
          overflow: 'hidden',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* ── BACK CARD (position 2) ──────────────────────────────
            Furthest from the viewer. Fixed offset — no alternation.
            During exit: slides forward to the mid position. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: cardLeft,
            width: cardSize,
            height: cardSize,
            zIndex: 1,
            transform: backTransform,
            transition: stackTransition,
          }}
        >
          {allCards[backIdx]}
        </div>

        {/* ── MID CARD (position 1) ──────────────────────────────
            One layer behind the top. Offset alternates with rotationSeed.
            During exit: slides forward to become the new top. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: cardLeft,
            width: cardSize,
            height: cardSize,
            zIndex: 2,
            transform: midTransform,
            transition: stackTransition,
          }}
        >
          {allCards[midIdx]}
        </div>

        {/* ── TOP CARD (position 0) ──────────────────────────────
            The active card. Flat at full size at rest.
            While dragging: follows finger with tilt (no transition).
            On exit: rotates and fades off in the swipe direction (220ms).
            On snap-back: returns to center (200ms).
            willChange: transform only on this card — it's the active one. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: cardLeft,
            width: cardSize,
            height: cardSize,
            zIndex: 3,
            transform: topTransform,
            opacity: topOpacity,
            transition: topTransition,
            willChange: dragXRef.current !== 0 && !isAnimating ? 'transform' : 'auto',
          }}
        >
          {allCards[topIdx]}
        </div>

      </div>
    )
  }


  // ── DESKTOP LAYOUT ─────────────────────────────────────
  // Untouched from the original — fan/hover/rotation logic all intact.
  return (
    // CONTAINER
    // position: relative so absolutely positioned children stack inside it.
    // height: 460px gives rotated cards room without clipping.
    <div
      ref={containerRef}
      style={{
        width: '100%',
        position: 'relative',
        height: '460px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {/* ─────────────────────────────────────────────────
          IMAGE FRAMES
          Each frame is absolutely positioned. Its left value comes from
          getPositions(), which switches between stacked and fanned layouts.
      ───────────────────────────────────────────────── */}
      {images.map((img, i) => {
        const size = getFrameSize(i, count)

        // A frame only lifts when:
        // 1. The user is hovering it, AND
        // 2. coverBehind is true — cover has already dropped to the back.
        // This prevents frames from punching above the cover during phase 1.
        const isActive = activeImageIndex === i && coverBehind
        const rotation = rotations[i] ?? 0
        const translateY = isActive ? -8 : 0

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: imgFrameLefts[i] ?? 0,
              width: size,
              height: size,
              zIndex: isActive ? 20 : i + 1,
              transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
              transition: 'left 0.3s ease, transform 0.3s ease',
            }}
            onMouseEnter={() => setActiveImageIndex(i)}
            onMouseLeave={() => setActiveImageIndex(-1)}
          >
            {img}
          </div>
        )
      })}

      {/* ─────────────────────────────────────────────────
          COVER CARD
          Always rendered. When images exist, participates in the hover animation.
          When images is empty, sits statically at left: 0.
      ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: count > 0 ? coverLeft : 0,
          width: 414,
          height: 414,
          zIndex: coverZIndex,
          transform: count > 0 ? coverTransform : `rotate(${coverRotation}deg)`,
          transition: count > 0 ? coverTransition : undefined,
        }}
        onMouseEnter={() => setCoverHovered(true)}
        onMouseLeave={() => setCoverHovered(false)}
      >
        {/* Render prop — receives isHovered so ProjectCover can show its
            hovered title color even though the state lives here. */}
        {cover(isHovered)}
      </div>

    </div>
  )
}
