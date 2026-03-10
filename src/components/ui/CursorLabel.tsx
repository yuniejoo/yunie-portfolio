'use client'

/*
  CURSORLABEL COMPONENT
  ─────────────────────
  A floating label pill that follows the user's cursor.

  The PARENT is responsible for managing hover state and deciding
  what label to show. CursorLabel only handles position tracking
  and the opacity fade animation.

  Props:
    label     — text to display (e.g. "CLICK TO COPY", "OPEN TWITTER")
    isVisible — parent toggles this true/false on hover enter/leave

  How it works:
    A global mousemove listener updates position state on every mouse
    move. The label is positioned at fixed (x + 12, y - 8) relative
    to the viewport — 12px right and 8px above the cursor tip.

    opacity transitions between 0 and 1 (200ms ease) based on isVisible.
    pointer-events-none ensures the label never blocks clicks underneath.

  Touch devices:
    hidden md:block — the label is invisible on mobile viewports
    (touch devices don't have a persistent cursor to follow).
*/

import { useState, useEffect } from 'react'

interface CursorLabelProps {
  // Text displayed inside the pill
  label: string
  // Controlled by parent — true when the parent element is hovered
  isVisible: boolean
}

export default function CursorLabel({ label, isVisible }: CursorLabelProps) {

  // ─────────────────────────────────────────────────────────
  // CURSOR POSITION
  //
  // Tracks the mouse's viewport coordinates (clientX, clientY).
  // clientX/Y are relative to the viewport, not the document —
  // which is what we want since this element is position: fixed.
  // ─────────────────────────────────────────────────────────
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
    }

    // Attach to document so position updates everywhere on the page.
    // passive: true is a performance hint — we never call preventDefault()
    // here, so the browser can update scroll position immediately without
    // waiting for our handler.
    document.addEventListener('mousemove', handleMove, { passive: true })
    return () => document.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    // fixed     → positions relative to viewport, stays in place during scroll
    // z-[100]   → above everything including the NavBar (z-50)
    // hidden md:block → invisible on mobile (no cursor to follow on touch)
    // pointer-events-none → never intercepts clicks meant for elements below
    <div
      className="fixed z-[100] pointer-events-none hidden md:block"
      style={{
        left: pos.x + 12,  // offset: 12px right of cursor tip
        top: pos.y - 8,    // offset: 8px above cursor center
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/*
        The pill:
          label-3        → IBM Plex Mono, 12px, uppercase (from globals.css)
          text-text-on-primary → white text (#FFFFFF)
          bg (inline)    → --color-surface-dark — the blue/blueGray accent pill
          borderRadius   → 9999px = fully rounded pill shape
          whiteSpace     → nowrap prevents the label from wrapping to multiple lines
      */}
      <span
        className="label-3 text-text-on-primary"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          padding: 'var(--spacing-1) var(--spacing-2)',
          borderRadius: '9999px',
          display: 'block',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  )
}
