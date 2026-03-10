'use client'

/*
  ARTWORKFRAME COMPONENT
  ──────────────────────
  The ASCII art gallery piece in the footer.

  Displays one piece at a time from a collection of 6 ASCII artworks.
  Click anywhere on the frame to advance to the next piece (wraps around).

  State:
    currentIndex — which artwork is showing (0–5)
    seenIds      — Set of artwork IDs the user has viewed, persisted in localStorage
    artVisible   — controls the fade+blur transition on the <pre> element
    isTransitioning — prevents rapid clicks from stacking multiple timeouts

  Transition:
    Click → art fades out (opacity 0, blur 4px) over 350ms
         → artwork switches → art fades back in (opacity 1, blur 0)
    Only the <pre> tag transitions. Labels update instantly.

  localStorage:
    Key: 'yunie-gallery-seen'
    Value: JSON array of seen artwork IDs
    Read on mount (client-only, guarded against SSR).
    Written when a new piece is marked as seen.

  "All seen" state:
    When all 6 pieces have been viewed (seenIds.size >= 6), the
    description line shows a collector message instead of the piece's
    description. Reverts if localStorage is cleared.

  CursorLabel:
    Shows "CLICK FOR NEXT PIECE" while hovering the frame.
    Hidden on touch devices (CursorLabel handles this internally).

  ASCII art population:
    The `art` field in each ARTWORKS entry starts empty.
    Run the generation script for each piece, copy the console
    output into the matching `art` field below.
    e.g. npx ts-node scripts/generate-art/owala.ts
*/

import { useState, useEffect } from 'react'
import CursorLabel from '@/src/components/ui/CursorLabel'

// ─────────────────────────────────────────────────────────
// ARTWORK DATA
//
// Each piece is an object with:
//   id          — unique identifier, matches the generation script name
//   title       — displayed in label row (uppercase by label-2-medium class)
//   year        — displayed beside the title
//   medium      — displayed below title in smaller text
//   description — one-line caption in Yunie's voice (Figtree, body-2)
//   art         — multiline ASCII string (populate via generation scripts)
//
// The `art` field uses a template literal to preserve newlines exactly.
// Never trim or reformat the art string — white-space: pre on the <pre>
// element renders it character-for-character as intended.
// ─────────────────────────────────────────────────────────
interface Artwork {
  id: string
  title: string
  year: string
  medium: string
  description: string
  art: string
}

const ARTWORKS: Artwork[] = [
  {
    id: 'owala',
    title: 'OWALA SMOOTHSIP',
    year: '2026',
    medium: 'ASCII on HTML',
    description: "left at the library. someone took it. still not over it.",
    // Populate by running: npx ts-node scripts/generate-art/owala.ts
    art: '',
  },
  {
    id: 'lip-balm',
    title: 'LIP BALM',
    year: '2026',
    medium: 'ASCII on HTML',
    description: "canadian winters are ruthless. so are deadlines. at least one of these i can fix.",
    // Populate by running: npx ts-node scripts/generate-art/lip-balm.ts
    art: '',
  },
  {
    id: 'listerine',
    title: 'LISTERINE',
    year: '2026',
    medium: 'ASCII on HTML',
    description: "lunch meeting at 2. mint at 1:59. confidence: restored.",
    // Populate by running: npx ts-node scripts/generate-art/listerine.ts
    art: '',
  },
  {
    id: 'built-puff',
    title: 'BUILT PUFF',
    year: '2026',
    medium: 'ASCII on HTML',
    description: "high protein, good macros. brain fuel. no notes.",
    // Populate by running: npx ts-node scripts/generate-art/built-puff.ts
    art: '',
  },
  {
    id: 'hand-cream',
    title: 'HAND CREAM',
    year: '2026',
    medium: 'ASCII on HTML',
    description: "wash hands. apply cream. repeat until canada stops.",
    // Populate by running: npx ts-node scripts/generate-art/hand-cream.ts
    art: '',
  },
  {
    id: 'rabbit-hole',
    title: 'RABBIT HOLE',
    year: '2026',
    medium: 'ASCII on HTML',
    description: "five minutes ago i was picking a font. now i'm reading about swiss grid history.",
    // Populate by running: npx ts-node scripts/generate-art/rabbit-hole.ts
    art: '',
  },
]

// localStorage key for tracking which pieces have been seen
const SEEN_KEY = 'yunie-gallery-seen'

// Message shown once the user has viewed every piece
const COLLECTOR_MESSAGE = "you've seen them all. a true collector."

export default function ArtworkFrame() {

  // ─────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────

  // Which artwork is currently showing (0–5)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Set of artwork IDs the user has seen — initialized from localStorage on mount
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  // Controls the fade + blur transition on the <pre> art block
  // true = visible (opacity 1, blur 0), false = hidden (opacity 0, blur 4px)
  const [artVisible, setArtVisible] = useState(true)

  // Prevents stacking multiple transitions if the user clicks rapidly
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Controls the CursorLabel — shows when the frame is hovered
  const [isHovered, setIsHovered] = useState(false)

  // ─────────────────────────────────────────────────────────
  // MOUNT EFFECT — read localStorage, mark first piece as seen
  //
  // useEffect never runs on the server (SSR), only after the
  // component has hydrated on the client. This is why it's safe
  // to access localStorage here — no hydration mismatch risk.
  //
  // The typeof window check is belt-and-suspenders defensive coding
  // as noted in the spec, in case this ever runs in a non-browser context.
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Read previously seen IDs from localStorage
    let stored = new Set<string>()
    try {
      const raw = localStorage.getItem(SEEN_KEY)
      if (raw) stored = new Set(JSON.parse(raw) as string[])
    } catch {
      // localStorage may be unavailable (private mode, storage quota, etc.)
      // Fail silently — the gallery still works, just won't persist state.
    }

    // Mark the first piece (index 0) as seen on this visit
    const firstId = ARTWORKS[0].id
    if (!stored.has(firstId)) {
      stored = new Set([...stored, firstId])
      // Write the updated set back to localStorage
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...stored]))
      } catch {}
    }

    setSeenIds(stored)
  }, [])

  // ─────────────────────────────────────────────────────────
  // DERIVED STATE
  //
  // allSeen: true once every artwork has been viewed.
  // When true, the description line shows the collector message
  // instead of the piece's own description.
  // ─────────────────────────────────────────────────────────
  const allSeen = seenIds.size >= ARTWORKS.length
  const current = ARTWORKS[currentIndex]

  // ─────────────────────────────────────────────────────────
  // CLICK HANDLER — advance to next piece with transition
  //
  // Step 1: setArtVisible(false) → <pre> fades out + blurs (350ms)
  // Step 2: after 350ms → switch index, mark new piece as seen, fade in
  //
  // The isTransitioning guard prevents stacking timeouts if the
  // user clicks repeatedly before the transition completes.
  // ─────────────────────────────────────────────────────────
  const handleClick = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setArtVisible(false)  // start fade out

    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % ARTWORKS.length
      setCurrentIndex(nextIndex)
      setArtVisible(true)       // start fade in
      setIsTransitioning(false)

      // Mark the newly visible piece as seen
      const id = ARTWORKS[nextIndex].id
      setSeenIds(prev => {
        // If already seen, no state update (return same reference — React skips re-render)
        if (prev.has(id)) return prev

        const next = new Set([...prev, id])

        // Persist to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(SEEN_KEY, JSON.stringify([...next]))
          } catch {}
        }

        return next
      })
    }, 350)  // match the CSS transition duration
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    // The outer div is the frame. It's the hover target and click target.
    // cursor: pointer signals that clicking does something.
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--color-surface-subtle)',
        border: '1px solid var(--color-stroke-border)',
        padding: 'var(--spacing-6)',
        cursor: 'pointer',
      }}
    >

      {/*
        ASCII ART BLOCK
        ───────────────
        <pre> preserves whitespace and newlines exactly — critical for ASCII art.
        white-space: pre renders the art character-for-character.
        margin: 0 removes the browser default margin on <pre>.

        The opacity + blur transition creates the fade-out/in effect on click.
        350ms matches the setTimeout in handleClick.

        The art field will be empty until generation scripts are run —
        the frame renders without art (just labels below) until populated.
      */}
      <pre
        className="label-3 text-text-body"
        style={{
          whiteSpace: 'pre',
          margin: 0,
          opacity: artVisible ? 1 : 0,
          filter: artVisible ? 'blur(0px)' : 'blur(4px)',
          transition: 'opacity 350ms ease, filter 350ms ease',
        }}
      >
        {current.art}
      </pre>

      {/*
        LABEL SECTION
        ─────────────
        Updates instantly when currentIndex changes (no transition).
        The <pre> transition handles the visual delay — by the time
        the art switches, the old art has already faded out.

        Layout (top to bottom):
          Title + Year  → label-2-medium, --color-text-heading
          Medium        → label-3, --color-text-subtle (smaller, lighter)
          Description   → body-2 (Figtree), --color-text-subtle
      */}
      <div style={{ marginTop: current.art ? 'var(--spacing-2)' : '0' }}>

        {/* Title + Year — on the same row, same style */}
        <div
          className="flex items-baseline"
          style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}
        >
          <span className="label-2-medium text-text-heading">
            {current.title}
          </span>
          <span className="label-3 text-text-heading">
            {current.year}
          </span>
        </div>

        {/* Medium */}
        <p
          className="label-3 text-text-subtle"
          style={{ margin: 0, marginBottom: 'var(--spacing-1)' }}
        >
          {current.medium}
        </p>

        {/*
          Description or collector message.
          Figtree (body-2) — NOT mono, because this is human-readable prose,
          not structural/systemic text. See design system font rules.

          allSeen shows the collector message in place of the description.
          It reads from the current piece's description otherwise.
        */}
        <p className="body-2 text-text-subtle" style={{ margin: 0 }}>
          {allSeen ? COLLECTOR_MESSAGE : current.description}
        </p>

      </div>

      {/*
        CURSOR LABEL
        ────────────
        Follows the cursor and shows while the frame is hovered.
        CursorLabel handles its own position tracking internally.
        It's hidden on touch devices (hidden md:block inside CursorLabel).
      */}
      <CursorLabel label="CLICK FOR NEXT PIECE" isVisible={isHovered} />

    </div>
  )
}
