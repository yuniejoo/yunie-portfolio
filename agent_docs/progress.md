# Build Progress — Yunie Joo Portfolio

## Done ✓

### Phase 3 — Base Components
- [x] Button component (primary + secondary types, default/hover/selected states, fullWidth prop)
- [x] NavBar component (fixed, frosted glass, logo slot + nav links, active page detection, mobile dropdown with chevron toggle, scroll hide/show behavior)
- [x] Tag component (variant: minimal/outlined, color: subtle/primary, display-only span, label-2-medium typography)

### Phase 2 — Design Tokens
- [x] Configure Tailwind theme with all color tokens (day + night)
- [x] Configure CSS custom properties for theme switching
- [x] Configure typography scale in Tailwind
- [x] Configure spacing scale
- [x] Verify tokens render correctly in browser

### Phase 1 — Project Setup
- [x] Initialize Next.js + Tailwind project
- [x] Set up folder structure and CLAUDE.md
- [x] Create .claude/skills/ files in project
- [x] Create agent_docs/progress.md in project
- [x] Initialize GitHub repo
- [x] Connect to Vercel — get live preview URL
- [x] Install and configure Google Fonts (Figtree + IBM Plex Mono)

## In Progress

## Up Next

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
- Button: two types (primary uses Label 1 / 16px, secondary uses Label 2 / 14px). No focus/disabled states — personal portfolio, not SaaS. fullWidth prop controls hug vs fill behaviour.
- NavBar: uses Next.js `<Link>` for nav items (not Button component) — semantic correctness + different default/hover tokens than Button (text-body vs text-muted, text-primary vs text-primary-hover). MENU toggle uses `<button>` directly to support aria-expanded + aria-label. logo.svg not yet created — Node placeholder at 96×32px until added.
- NavBar background: frosted glass via inline style (rgba(255,255,255,0.8) + backdrop-filter: blur(12px)) — not bg-surface-main token, because opacity control requires rgba().
- NavBar positioning: fixed (not sticky) — layout.tsx body has pt-16 (64px) to compensate.
- NavBar scroll behavior: hides on scroll down (>10px threshold), reappears on scroll up. useEffect + useRef(lastScrollY) tracks direction. transition-transform duration-200 ease-in-out. passive scroll listener for performance.
- Mobile dropdown: right-aligned links, pb-4 only (no top padding), no background (inherits frosted glass from nav parent).
- Tag: `<span>` element (inline text content). outlined variant uses `inline-block` to ensure border-radius + background render correctly. Border color (stroke-border) is shared between both color modes — only fill and text differ.
