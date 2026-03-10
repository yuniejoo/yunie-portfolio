/*
  EXPERIENCE SECTION COMPONENT
  ----------------------------
  A full, hardcoded section displaying Yunie's work and education history.
  Content is not passed in as props — it lives directly in this file.
  When Yunie's experience changes, update the data arrays below.

  STRUCTURE:
    Two groups stacked vertically — Work and Education.
    Each group has a label (Tag) followed by a list of ExperienceRow entries.
    The gap between groups is 80px (--spacing-20).
    The gap between the Tag and the first row, and between rows, is 32px (--spacing-8).

  COMPONENTS USED:
    - Tag (variant="minimal" color="subtle") — section label, imported from ui/Tag.tsx
    - ExperienceRow — individual row, imported from ui/ExperienceRow.tsx

  No props. No interactivity. No borders or shadows.
  The <section> element is used because this is a meaningful, self-contained
  region of the page — not just a layout container.
*/

// ── Imports ───────────────────────────────────────────────────────────────────
// These lines pull in the components we need from other files.
// The "@/" at the start is a shorthand for the project root — configured in
// tsconfig.json. It means we don't have to write long relative paths like
// "../../components/ui/Tag".
import Tag from '@/src/components/ui/Tag'
import ExperienceRow from '@/src/components/ui/ExperienceRow'

// ── Content data ──────────────────────────────────────────────────────────────
// This is where all the text content lives — separated from the layout code below.
// Keeping data separate from structure is good practice: when Yunie adds a new
// job, she only needs to touch this section, not hunt through JSX.
//
// Each item is a plain JavaScript object — a collection of named values (like a
// row of data). The array holds all the items for one group.
//
// TypeScript note: the `as const` at the end of each array tells TypeScript to
// treat every string as an exact literal value rather than a general "string" type.
// This prevents accidental mutations. It's a safety measure, not a functional change.

const workEntries = [
  {
    company:     'BigGeo',
    position:    '/ Product Designer',
    period:      'Oct 2025 – Present (Calgary, AB)',
    description: 'Improved UX/UI structures and design systems for complex, data-heavy geospatial products, transforming complex data into intuitive user flows. Collaborated with the CEO, engineers, scientists, and sales teams.',
  },
  {
    company:     'Turbo Referrals',
    position:    '/ Product Designer',
    period:      'Mar 2024 – Oct 2025 (Calgary, AB)',
    description: 'Led product design of a B2B SaaS MVP from 0 to 1, launching in 3 months while balancing speed, technical constraints, and business goals. Adopted by 12+ dealerships and 200+ users in the first month, making it the largest user group among all company products.',
  },
  {
    company:     'Kaiterra',
    position:    '/ Design Intern',
    period:      'Jan 2023 – Apr 2023 (Vancouver, BC)',
    description: 'Proposed a new onboarding flow for a B2B dashboard product via Emily Carr\'s Shumka Program, completing a 3-month internship and collaborating with a senior designer and PM from early research through design handoff.',
  },
]

const educationEntries = [
  {
    company:     'Emily Carr University of Art + Design',
    position:    '',
    period:      'May 2023 (Vancouver, BC)',
    description: 'Bachelor of Design in Interaction Design',
  },
  {
    company:     'Hongik University',
    position:    '',
    period:      '2016 – 2018 (Korea)',
    description: 'Digital Media Design',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────
// No props needed — this component always renders the same content.
// The empty `{}` in the function signature means "this function takes no arguments".
export default function ExperienceSection() {
  return (
    // ── Outer <section> ────────────────────────────────────────────────────────
    // <section> is a semantic HTML element — it tells the browser (and screen readers)
    // that this is a distinct, meaningful region of the page. It's not just a layout
    // container; it has content purpose. Using <div> here would work visually, but
    // <section> is correct and accessible.
    //
    // `flex flex-col` stacks the two groups (Work, Education) vertically.
    // `gap-20` = 80px between them (--spacing-20 token from globals.css).
    <section className="flex flex-col gap-20">

      {/* ── Work group ─────────────────────────────────────────────────────────
          A flex column containing the "WORK" label and all three work entries.
          `gap-8` = 32px between every child — same gap between Tag→first row
          and between each row. */}
      <div className="flex flex-col gap-8">

        {/* Section label — uses the Tag component with "minimal" variant (text only,
            no border or background) and "subtle" color (lighter muted gray).
            This matches the Figma spec where "WORK" and "EDUCATION" are small
            uppercase mono labels — not headings, just quiet section markers.
            Passing the text as children: <Tag>Work</Tag> renders "WORK" because
            the Tag component always uppercases its text via CSS. */}
        <Tag variant="minimal" color="subtle">Work</Tag>

        {/* ── Work rows — rendered with .map() ─────────────────────────────────
            .map() means "do this for each item in the array".
            For each entry object in workEntries, we create one <ExperienceRow>.
            We spread the entry object with `{...entry}` — this is shorthand for
            passing each property as an individual prop. It's equivalent to writing:
              company={entry.company} position={entry.position} etc.
            The `key` prop is required by React whenever you render a list — it
            helps React track which item is which when the list changes. We use
            the company name since it's unique in this list. */}
        {workEntries.map((entry) => (
          <ExperienceRow
            key={entry.company}
            {...entry}
          />
        ))}

      </div>
      {/* End Work group */}

      {/* ── Education group ────────────────────────────────────────────────────
          Same structure as Work: label on top, rows below, 32px gap throughout.
          Education entries pass position="" (empty string) — ExperienceRow
          handles this gracefully by not rendering the position element at all. */}
      <div className="flex flex-col gap-8">

        <Tag variant="minimal" color="subtle">Education</Tag>

        {educationEntries.map((entry) => (
          <ExperienceRow
            key={entry.company}
            {...entry}
          />
        ))}

      </div>
      {/* End Education group */}

    </section>
  )
}
