/*
  EXPERIENCE ROW COMPONENT
  ------------------------
  Displays a single line item in a resume-style experience section.
  Each row represents one job or role, showing:
    - Company name (bold, heading color — it's the primary anchor)
    - Position/role title, which includes a leading "/" as part of the string
      (e.g. "/ Product Designer"). The slash is part of the prop — there is no
      separate hardcoded separator element in the code.
    - Date period, e.g. "Mar 2024 – Present"
    - A one-line description of the role

  DESKTOP (768px and wider):
    Top row — company + position on the left, period date on the right,
    both on the same horizontal line. Description sits below, full width.
    Gap between the top row and description: 4px (--spacing-1).

  MOBILE (under 768px):
    Three stacked rows, all left-aligned:
      1. period
      2. company + position
      3. description
    Gap between every row: 4px (--spacing-1).

  This component is purely presentational — no interactivity, no hover states,
  no animations. It just renders text in the right layout.

  PROPS (information passed in from outside):
  - company:     The organization name, e.g. "Anthropic"
  - position:    The role title including a leading slash, e.g. "/ Product Designer".
                 The slash is part of the prop value — don't pass it separately.
                 Pass "" (empty string) for entries with no role title (e.g. education).
                 When empty, the position element is not rendered at all.
  - period:      Date range as a string, e.g. "Mar 2024 – Present"
                 Rendered as-is — no date formatting happens here.
  - description: A short description of what the role involved
*/

// ── Type definition ──────────────────────────────────────────────────────────
// An interface is a blueprint that describes the shape of an object.
// This tells TypeScript: every ExperienceRow must receive exactly these four
// props, and all four must be strings (text). If any are missing or the wrong
// type, TypeScript will flag it before the page even loads.
interface ExperienceRowProps {
  company:     string
  position:    string
  period:      string
  description: string
}

// ── Component definition ─────────────────────────────────────────────────────
// "export default function" means: this is the main thing this file exports,
// and it's a React component — a function that returns HTML-like JSX.
// The `{ company, position, period, description }` syntax "destructures" the
// props object — it's a shorthand for pulling each prop out by name.
export default function ExperienceRow({ company, position, period, description }: ExperienceRowProps) {
  return (
    // ── Outer wrapper ────────────────────────────────────────────────────────
    // A flex column (items stack vertically) with a uniform 4px gap (--spacing-1)
    // at both breakpoints. Desktop and mobile use the same gap now.
    //
    // Note: the `period` text is rendered twice below — once for desktop (hidden
    // on mobile), once for mobile (hidden on desktop). This is a common CSS trick
    // for layouts where an element needs to sit in a different position at each
    // breakpoint. Elements with `display: none` don't participate in layout, so
    // the flex gap only counts the visible items.
    <div className="flex flex-col gap-1">

      {/* ── Period — mobile only ──────────────────────────────────────────────
          On mobile, period is the FIRST row — it sits above company/position.
          `md:hidden` = display:none on 768px+, so it disappears on desktop
          (the desktop version lives inside the top row further down).
          Because display:none removes it from layout entirely, it doesn't
          add any gap or space on desktop. */}
      <span
        className="body-1 md:hidden"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        {period}
      </span>

      {/* ── Top row ─────────────────────────────────────────────────────────
          On desktop this row holds two things side by side:
            left:  the info group (company / position)
            right: the date period
          On mobile, the period is hidden from this row — it appears above
          instead (see the mobile period element above).
          `justify-between` pushes left and right ends apart to fill the row.
          `items-center` vertically centers them relative to each other. */}
      <div className="flex items-center justify-between">

        {/* ── Info group: company + position ──────────────────────────────
            Two items in a row: company name and position title.
            They sit inline with a 4px gap between them.
            The "/" is part of the position prop string (e.g. "/ Product Designer"),
            not a separate element — so there's nothing hardcoded here.
            `items-center` ensures they align on the same baseline. */}
        <div className="flex items-center gap-1">

          {/* Company name — semibold, heading color (darkest in the palette).
              This is the most prominent piece of information in the row.
              `body-1-semibold` is defined in globals.css as 16px / 24px / weight 600. */}
          <span
            className="body-1-semibold"
            style={{ color: 'var(--color-text-heading)' }}
          >
            {company}
          </span>

          {/* Position title — only rendered when a non-empty string is passed.
              For work entries it includes the "/" prefix, e.g. "/ Product Designer".
              For education entries the position prop is "" (empty string), so this
              entire span is skipped — no gap, no empty space, nothing rendered.
              In JavaScript, an empty string "" is "falsy" — meaning `position && ...`
              evaluates to false and React renders nothing. Non-empty strings are "truthy"
              and the span renders normally.
              `--color-text-subtle` = gray/400 = #A4A7AE — visually lighter than body text,
              creating a clear hierarchy: company (dark) → position (light gray). */}
          {position && (
            <span
              className="body-1"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              {position}
            </span>
          )}

        </div>
        {/* End info group */}

        {/* ── Period — desktop only ────────────────────────────────────────
            Sits on the right end of the top row on desktop.
            `hidden` = display:none by default (hidden on mobile).
            `md:inline` = display:inline on 768px+ (visible on desktop).
            This element is invisible and takes up zero space on mobile,
            which is why it doesn't affect the mobile layout.
            Uses `--color-text-subtle` (same light gray as position) — both
            are secondary info, visually subordinate to the company name. */}
        <span
          className="body-1 hidden md:inline"
          style={{ color: 'var(--color-text-subtle)' }}
        >
          {period}
        </span>

      </div>
      {/* End top row */}

      {/* ── Description ───────────────────────────────────────────────────────
          Full-width text below the top row at all breakpoints.
          No special treatment — regular weight, body color, same as the period.
          Using a <p> tag here because this is a paragraph of text — semantic HTML. */}
      <p
        className="body-1"
        style={{ color: 'var(--color-text-body)' }}
      >
        {description}
      </p>

    </div>
  )
}
