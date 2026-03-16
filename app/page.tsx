/*
  HOMEPAGE — app/page.tsx
  -----------------------
  This is the homepage layout. It's a page assembly file — no new UI is
  invented here. Every element comes from an existing component.

  Structure:
    <main>
      <div>  ← max-width content wrapper (centers everything, adds padding)
        <section>  Hero slot (placeholder Node — pixel art scene added in Phase 5)
        <section>  Projects (Divider + 3× ProjectItemV3)
        <section>  Experiences (Divider + ExperienceSection)
      </div>
    </main>
    NavBar and Footer are NOT rendered here — they live in app/layout.tsx
    and wrap every page automatically.

  Spacing logic:
    - pt-25/pb-25 (100px) on mobile,  pt-50/pb-50 (200px) on desktop
    - gap-25 (100px) between sections on mobile, gap-50 (200px) on desktop
    - gap-45 (180px) between Divider and ExperienceSection (same at all breakpoints)

  Why is layout.tsx's pt-16 relevant here?
    layout.tsx adds pt-16 (64px) to the body so content clears the fixed NavBar.
    The pt-25/pt-50 on <main> adds *on top of* that — it's the breathing room
    between the NavBar and the first section of the page.
*/

// No 'use client' needed — this page has no interactivity, no state, no event handlers.
// It's a pure server component: React renders it once on the server and sends HTML.

import Node from '@/src/components/ui/Node'
import Divider from '@/src/components/ui/Divider'
import ProjectItemV3 from '@/src/components/ProjectItemV3'
import ExperienceSection from '@/src/components/ExperienceSection'

// Footer and NavBar are NOT imported here — they live in app/layout.tsx
// and wrap every page automatically. Adding them here would render them twice.

export default function HomePage() {
  return (
    // layout.tsx renders NavBar and Footer around {children} for every page.
    // This component only needs to return <main> — no fragment wrapper needed.
    <main className="pt-25 pb-25 md:pt-50 md:pb-50">

      {/* CONTENT WRAPPER
          Constrains content to 1200px max-width and centers it horizontally.
          px-4 = 16px side padding on mobile, px-8 = 32px on desktop (md:).
          flex flex-col stacks the three sections vertically.
          gap-25/gap-50 creates the large breathing room between sections. */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-25 md:gap-50">

        {/* HERO SLOT
            Placeholder for the Calgary pixel art hero (built in Phase 5).
            Node renders a dashed placeholder box — full width, 240px tall.
            No text or labels here — it's a pure visual slot. */}
        <section>
          <Node width="100%" height={240} />
        </section>

        {/* PROJECTS
            Three project entries. Divider first, then 3× ProjectItemV3.
            gap-25/gap-50 spaces all children (Divider + 3 cards) evenly.

            WHY props are required: tag, title, and description have no `?` in
            the TypeScript interface, so they are required. Without `images`,
            the component defaults to count=1 → single centered card instead
            of the fan spread. Placeholder values are used until Phase 4/5. */}
        <section className="flex flex-col gap-25 md:gap-50">
          <Divider />
          <ProjectItemV3
            tag="Case Study"
            title="Title"
            description="Description"
            images={['', '', '']}
          />
          <ProjectItemV3
            tag="Case Study"
            title="Title"
            description="Description"
            images={['', '', '']}
          />
          <ProjectItemV3
            tag="Case Study"
            title="Title"
            description="Description"
            images={['', '', '']}
          />
        </section>

        {/* EXPERIENCES
            Divider then ExperienceSection.
            gap-45 (180px) is fixed — no md: variant, same on both breakpoints. */}
        <section className="flex flex-col gap-45">
          <Divider />
          <ExperienceSection />
        </section>

      </div>
    </main>
  )
}
