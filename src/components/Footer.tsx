/*
  FOOTER COMPONENT
  ────────────────
  The site-wide footer. Renders at the bottom of every page via layout.tsx.

  It has three equal columns — Navigation, Contact, and Socials — each
  introduced by a Tag component that acts like a section label.

  Layout:
    Desktop (768px+): three columns side by side in a row, max 1200px wide, centered.
    Mobile (<768px):  columns stack vertically, 80px of breathing room between them.

  Background:
    A gradient that fades from transparent at the top to --color-surface-subtle
    at the 50% mark. This makes the footer feel like it "emerges" from the page
    rather than sitting on a hard edge.

  Links:
    Internal (PROJECTS, ABOUT, PLAYGROUND) → Next.js <Link> component
    External (social links, email) → plain <a> with target="_blank"
    All links: IBM Plex Mono, 14px, uppercase, gray by default, accent blue on hover.

  Social links have a small arrow icon (arrow_outward.svg) that's at 50%
  opacity normally and full opacity when you hover the link.

  No props — all content is hardcoded. No state — no interactivity beyond CSS hover.
*/

// Link is Next.js's built-in component for client-side navigation.
// Unlike a plain <a> tag, it doesn't trigger a full page reload — it navigates
// instantly using JavaScript, which feels faster for the user.
import Link from 'next/link'
import Tag from '@/src/components/ui/Tag'

// ─────────────────────────────────────────────────────────
// SHARED LINK STYLE
//
// Every link in the footer (nav, contact, social) uses the same
// base styling: IBM Plex Mono Medium 14px uppercase, gray text
// that transitions to the accent color on hover.
//
// transition-all duration-200 — all CSS changes animate over 200ms.
// This is the standard transition speed for this design system.
// ─────────────────────────────────────────────────────────
const LINK_CLASS =
  'label-2-medium text-text-body hover:text-text-primary transition-all duration-200'

export default function Footer() {
  return (
    // <footer> — semantic HTML for site footer regions.
    //
    // The background is a linear gradient applied as an inline style
    // because CSS custom properties (var(--color-surface-subtle)) can't
    // be used directly inside Tailwind className strings — they'd just
    // be treated as plain text. Inline style lets us reference the token.
    //
    // Padding responsive:
    //   Mobile:  40px top/bottom (py-10) + 16px left/right (px-4)
    //   Desktop: 96px top/bottom (py-24) + 16px left/right (px-4)
    <footer
      style={{
        background: 'linear-gradient(to bottom, transparent 0%, var(--color-surface-subtle) 50%, var(--color-surface-subtle) 100%)',
      }}
      className="px-4 py-10 md:py-24 md:px-4"
    >

      {/*
        INNER CONTENT WRAPPER
        ─────────────────────
        max-w-[1200px]  — caps the content width so it doesn't stretch too
                          wide on large monitors. 1200px is the design spec value.
        mx-auto         — centers the wrapper horizontally in the footer.

        The flex layout changes at 768px (the md: breakpoint):
          Mobile:  flex-col — columns stack top to bottom, 80px gap (gap-20)
          Desktop: flex-row — columns sit side by side, 32px gap (gap-8)
      */}
      <div className="mx-auto max-w-[1200px] flex flex-col gap-20 md:flex-row md:gap-8">

        {/* ─────────────────────────────────────────────────────────
            COLUMN 1 — NAVIGATION
            ──────────────────────────────────────────────────────
            flex-1 means this column takes up an equal share of the
            available space. All three columns have flex-1 so they're
            always the same width — even as the viewport changes.

            gap-4 md:gap-8 — 16px gap between the Tag and links on
            mobile, 32px on desktop.
            ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 md:gap-8 flex-1">

          {/*
            Tag with "minimal" variant and "primary" color.
            "minimal" means text-only — no border, no background, just
            the text in the accent color. Acts as a section label.
          */}
          <Tag variant="minimal" color="primary">Yunie Joo</Tag>

          {/*
            NAV LINKS
            ─────────
            <nav> — semantic HTML for navigation landmarks.
            Screen readers and search engines recognize this as a
            group of navigation links, not just a list of text.

            gap-2 = 8px gap between each link (--spacing-2)
          */}
          <nav className="flex flex-col gap-2">
            {/*
              <Link> from next/link — used for internal page navigation.
              Clicking these doesn't reload the whole page; Next.js handles
              the route change in the background.
            */}
            <Link href="/" className={LINK_CLASS}>
              Projects
            </Link>
            <Link href="/about" className={LINK_CLASS}>
              About
            </Link>
            <Link href="#" className={LINK_CLASS}>
              Playground
            </Link>
          </nav>

        </div>

        {/* ─────────────────────────────────────────────────────────
            COLUMN 2 — CONTACT
            ──────────────────────────────────────────────────────
            Single link: the email address.

            Using a plain <a> with href="mailto:..." because this
            opens the user's email client — it's an external action,
            not an internal navigation. target="_blank" opens it in
            a new tab or window depending on the OS.

            rel="noopener noreferrer" is a security best practice for
            all _blank links: it prevents the opened tab from accessing
            window.opener (the original page), which malicious sites
            could exploit.
            ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 md:gap-8 flex-1">

          <Tag variant="minimal" color="subtle">Contact</Tag>

          <a
            href="mailto:jyounge9707@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            jyounge9707@gmail.com
          </a>

        </div>

        {/* ─────────────────────────────────────────────────────────
            COLUMN 3 — SOCIALS
            ──────────────────────────────────────────────────────
            Three external links, each with an arrow icon.

            The icon uses the "group" hover pattern:
              - The <a> element gets the class "group"
              - The <img> inside gets "opacity-50 group-hover:opacity-100"
              - This means: when the <a> is hovered, the img becomes
                fully visible. At rest, it's 50% transparent.
              - This is a Tailwind pattern for "child reacts to parent hover."

            The arrow icon uses aria-hidden="true" so screen readers
            don't announce it — it's purely decorative. The link text
            already describes the destination.
            ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 md:gap-8 flex-1">

          <Tag variant="minimal" color="subtle">Socials</Tag>

          {/*
            gap-2 = 8px between each social link (--spacing-2 from spec)
          */}
          <div className="flex flex-col gap-2">

            {/* TWITTER */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-row items-center ${LINK_CLASS}`}
              style={{ gap: 'var(--spacing-1)' }}
            >
              Twitter
              {/*
                img — not an SVG inline component. Using <img> with a
                path is the simplest approach for a static icon.
                width/height={16} keeps it at exactly 16x16px.
                The opacity transitions are handled by Tailwind's
                group-hover pattern explained above.
              */}
              <img
                src="/assets/icons/arrow_outward.svg"
                width={16}
                height={16}
                alt=""
                aria-hidden="true"
                className="opacity-50 group-hover:opacity-100 transition-all duration-200"
              />
            </a>

            {/* LINKEDIN */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-row items-center ${LINK_CLASS}`}
              style={{ gap: 'var(--spacing-1)' }}
            >
              LinkedIn
              <img
                src="/assets/icons/arrow_outward.svg"
                width={16}
                height={16}
                alt=""
                aria-hidden="true"
                className="opacity-50 group-hover:opacity-100 transition-all duration-200"
              />
            </a>

            {/* INSTAGRAM */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-row items-center ${LINK_CLASS}`}
              style={{ gap: 'var(--spacing-1)' }}
            >
              Instagram
              <img
                src="/assets/icons/arrow_outward.svg"
                width={16}
                height={16}
                alt=""
                aria-hidden="true"
                className="opacity-50 group-hover:opacity-100 transition-all duration-200"
              />
            </a>

          </div>

        </div>

      </div>
    </footer>
  )
}
