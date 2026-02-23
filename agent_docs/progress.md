# Build Progress — Yunie Joo Portfolio

## Done ✓

## In Progress

## Up Next

### Phase 1 — Project Setup
- [ ] Initialize Next.js + Tailwind project
- [ ] Set up folder structure and CLAUDE.md
- [ ] Create .claude/skills/ files in project
- [ ] Create agent_docs/progress.md in project
- [ ] Initialize GitHub repo
- [ ] Connect to Vercel — get live preview URL
- [ ] Install and configure Google Fonts (Figtree + IBM Plex Mono)

### Phase 2 — Design Tokens
- [ ] Configure Tailwind theme with all color tokens (day + night)
- [ ] Configure CSS custom properties for theme switching
- [ ] Configure typography scale in Tailwind
- [ ] Configure spacing scale
- [ ] Verify tokens render correctly in browser

### Phase 3 — Base Components
- [ ] Button component (all states: default, hover, disabled)
- [ ] Typography components (headings h1–h4, body, label)
- [ ] Content type tag (CASE STUDY, SNAPSHOTS, THOUGHTS)
- [ ] Dot separator component
- [ ] Image placeholder (checkerboard pattern)
- [ ] Navigation component (wordmark + items)

### Phase 4 — Page Layouts
- [ ] Homepage layout (hero slot + intro + work cards + experience + footer)
- [ ] Case study page layout (back link + title + meta header + sidebar + content)
- [ ] About me page layout (intro + work/education list + footer)
- [ ] Verify all layouts responsive at 375px / 768px / 1280px

### Phase 5 — Advanced Components
- [ ] Hero section (pixel art landscape + time-based theme)
- [ ] Theme toggle (day/night switch in hero)
- [ ] Work card with hover state
- [ ] Article sticky sidebar with scroll tracking
- [ ] Insert all advanced components into layouts

### Phase 6 — Content
- [ ] Refine homepage intro copy
- [ ] Write about page bio
- [ ] Write case study 1: Detail Page Design
- [ ] Write case study 2: Permission System Design
- [ ] Write snapshot article
- [ ] Insert all content into pages

### Phase 7 — Review & Polish
- [ ] Review all pages on mobile (375px)
- [ ] Review on real device via Vercel URL
- [ ] Accessibility pass (focus states, alt text, semantic HTML)
- [ ] Performance check (image optimization, font loading)
- [ ] Final copy review
- [ ] Fix all known issues

### Phase 8 — Publish
- [ ] Add custom domain in Vercel
- [ ] Configure DNS at domain registrar
- [ ] Verify live site at custom domain
- [ ] Done

---

## Known Issues
<!-- Add issues here as they're discovered. Never delete — mark as fixed instead. -->

---

## Decisions Log
<!-- Record key design/technical decisions made during build -->
- Tech stack: Next.js + Tailwind CSS + Vercel (chosen for designer-friendly workflow, zero-config deploy)
- Hero section: placeholder slot during layout phase, built separately and slotted in Phase 5
- Theme system: CSS custom properties scoped to data-theme attribute on html element
- Fonts: Figtree (UI/content) + IBM Plex Mono (system/structural text)
