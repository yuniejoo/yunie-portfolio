'use client'

/*
  NAVBAR COMPONENT
  ----------------
  The site-wide navigation bar. Appears at the top of every page.
  Fixed — pinned to the top of the viewport at all times.

  Scroll behavior:
  The nav hides when the user scrolls DOWN (slides off-screen upward),
  and reappears when the user scrolls UP. A 10px threshold at the very
  top of the page prevents accidental flicker on tiny initial scrolls.

  Left side:  Yunie's logo (SVG image, 96×32px).
  Right side: Page links (PROJECTS, ABOUT ME) on desktop (768px+).
              A MENU button with a chevron on mobile (below 768px),
              which opens a dropdown with the same links stacked vertically.

  Active page detection:
  usePathname() reads the current URL. If it's "/" → PROJECTS gets the
  blue filled background. If it starts with "/about" → ABOUT ME does.
  Any other path (like "/work/...") → neither link is active.

  Mobile menu state:
  useState tracks whether the dropdown is open (true) or closed (false).
  The dropdown is conditionally rendered — when closed, it's completely
  removed from the HTML, not just hidden with CSS.
*/

// useState: a React hook that gives a component "memory" — stores a value
//   that can change, and re-renders the component when it does.
// useEffect: a React hook for "side effects" — things that happen outside
//   React's normal flow, like attaching a scroll listener to the browser window.
// useRef: stores a value that persists across renders but does NOT cause a
//   re-render when it changes. Used here to track scroll position silently.
import { useState, useEffect, useRef } from 'react'

// usePathname: a Next.js hook that returns the current URL path.
// e.g. "/" on the homepage, "/about" on the about page.
import { usePathname } from 'next/navigation'

// Link: Next.js's navigation component. Works like <a href="...">, but
// uses client-side navigation — no full page reload when clicking links.
import Link from 'next/link'

// Node: the project's dashed placeholder component. Used here to hold
// the logo slot until logo.svg is ready to drop in.
import Node from '@/src/components/ui/Node'

export default function NavBar() {

  // ─────────────────────────────────────────────────────────
  // STATE — Is the mobile menu open?
  //
  // useState(false) means: start with the menu closed.
  // isMenuOpen  → the current value (true = open, false = closed).
  // setIsMenuOpen → the function to change it. Calling setIsMenuOpen(true)
  //   updates the value and re-renders the component with the dropdown visible.
  // ─────────────────────────────────────────────────────────
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // ─────────────────────────────────────────────────────────
  // STATE — Is the nav currently hidden (slid off the top of the screen)?
  //
  // Starts as false (nav is visible). Changes to true when the user
  // scrolls down, which triggers the -translate-y-full class (slides
  // the nav upward off-screen). Changes back to false on scroll up.
  //
  // Why useState and not useRef here?
  // Because this value controls what the user sees — when it changes,
  // React needs to re-render so the class updates and the animation plays.
  // useRef doesn't trigger re-renders, so it's wrong for this job.
  // ─────────────────────────────────────────────────────────
  const [isHidden, setIsHidden] = useState(false)

  // ─────────────────────────────────────────────────────────
  // REF — Remember the last scroll position without causing a re-render.
  //
  // useRef stores a value (lastScrollY.current) that persists between
  // renders, but updating it does NOT trigger a re-render.
  //
  // We use this to compare "where was I last time?" with "where am I now?"
  // on every scroll event. We don't need the page to visually update just
  // because the scroll number changed — we only care about direction.
  // That makes useRef the right tool, not useState.
  // ─────────────────────────────────────────────────────────
  const lastScrollY = useRef(0)

  // ─────────────────────────────────────────────────────────
  // EFFECT — Attach a scroll listener when the nav mounts, remove it when it unmounts.
  //
  // useEffect runs code as a "side effect" — something that happens outside
  // React's normal render cycle. Talking to the browser's window object
  // (to listen for scroll events) is a side effect.
  //
  // The [] at the end is the "dependency array". An empty array means:
  // "Run this effect once, when the component first appears on the page.
  // Never re-run it." If we listed a variable here (e.g. [isHidden]), React
  // would re-run the effect every time that variable changed.
  //
  // The function returned at the end is the cleanup function. React calls
  // it when the component is removed from the page. Without it, the scroll
  // listener would keep running forever — a memory leak.
  // ─────────────────────────────────────────────────────────
  useEffect(() => {

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // ── THRESHOLD GUARD ─────────────────────────────────
      // If the user is within 10px of the very top of the page,
      // always show the nav regardless of direction.
      // Without this, a tiny downward nudge at position 0 would
      // immediately hide the nav — a jarring flicker on page load
      // or after clicking a link that scrolls back to top.
      if (currentScrollY < 10) {
        setIsHidden(false)
        lastScrollY.current = currentScrollY
        return // stop here — don't run the direction check below
      }

      // ── DIRECTION CHECK ──────────────────────────────────
      // Compare current scroll position to the last recorded position.
      //   currentScrollY > lastScrollY.current → user scrolled DOWN → hide nav
      //   currentScrollY < lastScrollY.current → user scrolled UP   → show nav
      if (currentScrollY > lastScrollY.current) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }

      // Store the current position so next scroll event can compare against it.
      lastScrollY.current = currentScrollY
    }

    // { passive: true } is a performance hint to the browser.
    // It tells the browser: "this listener will never call preventDefault()
    // to block scrolling." The browser can then update the scroll position
    // on screen immediately, without waiting for our JS handler to finish.
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup: remove the scroll listener when the NavBar unmounts.
    return () => window.removeEventListener('scroll', handleScroll)

  }, [])

  // ─────────────────────────────────────────────────────────
  // ACTIVE PAGE DETECTION
  //
  // usePathname() reads the current URL path — a string like
  // "/", "/about", or "/work/some-case-study".
  //
  // We derive two booleans from it so we know which link to highlight.
  // pathname === "/"              → exactly the homepage
  // pathname.startsWith("/about") → any URL beginning with /about
  //   (covers "/about" and any future "/about/..." sub-pages)
  // ─────────────────────────────────────────────────────────
  const pathname = usePathname()
  const isProjectsActive = pathname === '/'
  const isAboutActive = pathname.startsWith('/about')

  // ─────────────────────────────────────────────────────────
  // NAV LINK CLASS STRINGS
  //
  // Defined once here, reused in both the desktop links and the
  // mobile dropdown — so we never duplicate the class strings.
  //
  // navLinkBase → shared styles on every link, regardless of state.
  //   label-1-medium: IBM Plex Mono, 16px, weight 500, uppercase
  //     (a CSS class defined in globals.css — not a Tailwind utility).
  //   px-2: 8px horizontal padding.
  //   transition-all duration-200: all CSS changes animate over 200ms.
  //
  // navLinkActive → applied when this link matches the current page.
  //   bg-surface-dark:      blue fill (--color-surface-dark token).
  //   text-text-on-primary: white text (--color-text-on-primary token).
  //
  // navLinkDefault → applied when this link is NOT the current page.
  //   text-text-body: gray text.
  //   hover:text-text-primary: turns blue on mouse hover.
  // ─────────────────────────────────────────────────────────
  const navLinkBase = 'label-1-medium px-2 transition-all duration-200'
  const navLinkActive = 'bg-surface-dark text-text-on-primary'
  const navLinkDefault = 'text-text-body hover:text-text-primary'

  return (
    // ─────────────────────────────────────────────────────────
    // <nav> — the semantic HTML element for navigation regions.
    //
    // fixed top-0 left-0 right-0
    //   → Taken out of normal document flow and pinned to the top of
    //     the viewport. left-0/right-0 spans the full width (same as w-full).
    //     The <body> in layout.tsx uses pt-16 to push page content down
    //     so nothing starts hidden behind the nav.
    //
    // z-50
    //   → z-index: 50. Ensures the nav always sits on top of page content
    //     as it scrolls underneath.
    //
    // transition-transform duration-200 ease-in-out
    //   → Animates only the transform property (the slide up/down) over
    //     200ms with an ease-in-out curve — matches the project's animation
    //     standard. Using transition-transform (not transition-all) is more
    //     performant: the browser can animate transforms on the GPU without
    //     triggering layout recalculations.
    //
    // -translate-y-full / translate-y-0
    //   → These control the slide.
    //     translate-y-0:    nav is in its normal position (fully visible).
    //     -translate-y-full: nav is shifted upward by 100% of its own height
    //       (completely off-screen). The transition class animates between them.
    //     The ternary `isHidden ? '-translate-y-full' : 'translate-y-0'`
    //     picks the right class based on scroll direction state.
    //
    // w-full → spans the full browser width.
    // border-b border-stroke-border-subtle → 1px bottom border, light gray.
    // ─────────────────────────────────────────────────────────
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-stroke-border-subtle transition-transform duration-200 ease-in-out ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
      style={{
        // Frosted glass effect: white at 80% opacity + blur behind the nav.
        // rgba() is used instead of the --color-surface-main token because
        // CSS custom properties can't have their opacity modified inline —
        // rgba(255,255,255,0.8) is the token value (#FFFFFF) at 80% opacity.
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', // Safari support
      }}
    >

      {/* ─────────────────────────────────────────────────────────
          TOP BAR — the main row containing logo + links (or MENU button).

          flex items-center justify-between
            → flex layout: logo on the left, nav controls on the right,
              both vertically centered in the row.
          px-4 md:px-8
            → 16px horizontal padding on mobile (--spacing-4).
              At 768px+, jumps to 32px (--spacing-8).
          py-3 md:py-4
            → 12px top/bottom padding on mobile → total height ≈ 57px.
              16px top/bottom on desktop → total height ≈ 65px.
              (Height = padding-top + logo-height + padding-bottom + border.)
          ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">

        {/* LOGO SLOT — Node placeholder until logo.svg is ready.
            Replace with the real img once logo.svg is in place:
              <img src="/assets/icons/logo.svg" alt="Yunie Joo" width={96} height={32} /> */}
        <Node width={96} height={32} />

        {/* ─────────────────────────────────────────────────────────
            DESKTOP NAV LINKS — only visible at 768px and above.

            hidden  → display: none on mobile.
            md:flex → at 768px+, switches to flex (row direction).
            gap-6   → 24px gap between links.
            ───────────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-6">

          {/* PROJECTS link — ternary applies active or default classes.
              condition ? "value if true" : "value if false" */}
          <Link
            href="/"
            className={`${navLinkBase} ${isProjectsActive ? navLinkActive : navLinkDefault}`}
          >
            PROJECTS
          </Link>

          {/* ABOUT ME link — same pattern, different condition */}
          <Link
            href="/about"
            className={`${navLinkBase} ${isAboutActive ? navLinkActive : navLinkDefault}`}
          >
            ABOUT ME
          </Link>

        </div>

        {/* ─────────────────────────────────────────────────────────
            MOBILE MENU BUTTON — only visible below 768px.

            md:hidden → hides on desktop.

            aria-expanded={isMenuOpen}
              → Tells screen readers whether the dropdown is open.
            aria-label="Toggle navigation menu"
              → Full description for assistive technology.
            type="button"
              → Prevents accidental form submission if ever inside a form.

            onClick: !isMenuOpen toggles the value.
              "the opposite of whatever it is now" — if false → true, if true → false.
            ───────────────────────────────────────────────────────── */}
        <button
          type="button"
          className="md:hidden label-1-medium text-text-body bg-transparent border-0 cursor-pointer flex items-center gap-1"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          MENU

          {/* CHEVRON ICON — rotates 180° when the menu is open.
              aria-hidden="true" hides it from screen readers (decorative only).
              currentColor inherits the button's text color automatically. */}
          <svg
            width={20}
            height={20}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            style={{
              transition: 'transform 0.2s ease',
              transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

        </button>

      </div>

      {/* ─────────────────────────────────────────────────────────
          MOBILE DROPDOWN — conditionally rendered when menu is open.

          {isMenuOpen && <div>...</div>}
            → Only adds this to the page when isMenuOpen is true.
              When false, it's completely removed from the HTML
              (not just hidden) — cleaner for accessibility and performance.

          md:hidden → safety fallback if CSS loads before JS.
          pb-4      → 16px bottom padding. No top padding — the top bar's
                      bottom padding already provides the gap.
          flex flex-col items-end → stacks links vertically, right-aligned.
          gap-2     → 8px gap between links.
          ───────────────────────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col items-end gap-2">

          <Link
            href="/"
            className={`${navLinkBase} ${isProjectsActive ? navLinkActive : navLinkDefault}`}
          >
            PROJECTS
          </Link>

          <Link
            href="/about"
            className={`${navLinkBase} ${isAboutActive ? navLinkActive : navLinkDefault}`}
          >
            ABOUT ME
          </Link>

        </div>
      )}

    </nav>
  )
}
