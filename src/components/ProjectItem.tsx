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
  Cards are laid out in a horizontal scroll track. The cover is first, followed by
  image frames. Swiping left/right advances or retreats through the cards. The next
  card's edge peeks into view on the right — no dots needed, the peek is the affordance.

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
const TRACK_PADDING = 20   // left margin before the first card on mobile


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
    }
  }, [])


  // ── BREAKPOINT DETECTION ─────────────────────────────────
  // Drive layout from JS so state and rendering are always in sync.
  // containerWidth > 0 guard prevents a false "mobile" reading before
  // the first measurement fires (containerWidth starts at 0).
  const isMobile = containerWidth > 0 && containerWidth < 768


  // ── MOBILE CARD SIZING ───────────────────────────────────
  // Cards are 85% of container width, clamped between 280px and 414px.
  // `Math.max(..., 280)` sets the floor. `Math.min(..., CARD_MAX)` sets the ceiling.
  const cardSize = Math.min(Math.max(containerWidth * 0.85, 280), CARD_MAX)
  const cardGap = containerWidth * 0.04
  const totalCards = 1 + images.length  // 1 cover + N image frames


  // ── RESET ACTIVE INDEX ON BREAKPOINT SWITCH ──────────────
  // If the user rotates their device (mobile ↔ desktop), reset the mobile
  // swipe position so we don't land in a broken mid-animation state.
  useEffect(() => {
    setActiveIndex(0)
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

  // Record where the finger touched down.
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  // On lift, measure how far the finger travelled.
  // > 50px right-to-left = swipe left = advance to next card.
  // > 50px left-to-right = swipe right = go back to previous card.
  // 50px threshold prevents accidental triggers on small nudges.
  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (delta > 50) {
      setActiveIndex(i => Math.min(i + 1, totalCards - 1))
    } else if (delta < -50) {
      setActiveIndex(i => Math.max(i - 1, 0))
    }
  }

  // ── MOBILE TRACK OFFSET ──────────────────────────────────
  // The track shifts left by one card-width + gap for each step.
  // No offset when activeIndex = 0 — the cover sits at TRACK_PADDING from the left.
  // `willChange: transform` hints to the browser to GPU-accelerate this animation.
  const trackOffset = activeIndex * (cardSize + cardGap)


  // ── RENDER ───────────────────────────────────────────────

  // ── MOBILE LAYOUT ──────────────────────────────────────
  // Completely separate render path — no overlap with desktop logic.
  if (isMobile) {
    return (
      // OUTER CONTAINER
      // overflow: hidden clips the track so only the active card (+ peek of the next)
      // is visible. The track itself extends beyond this boundary.
      <div
        ref={containerRef}
        style={{
          width: '100%',
          // Height matches the card + a small buffer for any shadow bleed.
          height: cardSize + 4,
          overflow: 'hidden',
          position: 'relative',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* TRACK
            A flex row containing all cards. Cards are flex-shrink: 0 so they
            never compress. Gap between cards is 4% of container width.
            The track translates horizontally — GPU-accelerated via transform
            (never left/margin, which would cause layout recalculation).
            paddingLeft creates the TRACK_PADDING left margin before the first card. */}
        <div
          style={{
            display: 'flex',
            gap: cardGap,
            paddingLeft: TRACK_PADDING,
            transform: `translateX(-${trackOffset}px)`,
            transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
          }}
        >

          {/* COVER CARD — always index 0 in the mobile track.
              Always passes false for hover — there's no hover state on touch. */}
          <div style={{ width: cardSize, height: cardSize, flexShrink: 0 }}>
            {cover(false)}
          </div>

          {/* IMAGE FRAMES — indices 1–N in the track.
              .map() creates one wrapper div per image frame, each with
              the same cardSize dimensions and flex-shrink: 0. */}
          {images.map((img, i) => (
            <div
              key={i}
              style={{ width: cardSize, height: cardSize, flexShrink: 0 }}
            >
              {img}
            </div>
          ))}

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
