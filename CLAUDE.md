# Yunie Joo — Portfolio CLAUDE.md

## Project Overview
Personal portfolio for Yunie Joo, a systems-first product designer with 2+ years of experience.
Target audience: Design team leads and senior designers at structured product companies (primary), recruiters (secondary).
Goal: Show Yunie as a structural thinker who designs systems, not just screens.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript — use `.tsx` for all components and pages, `.ts` for all other files
- Styling: Tailwind CSS
- Fonts: Figtree (via Google Fonts), IBM Plex Mono (via Google Fonts)
- Deployment: Vercel
- Version control: GitHub

## Pages (MVP)
- `/` — Homepage
- `/work/[slug]` — Case study / article page (shared template)
- `/about` — About me page

## Content Types
- `case-study` — Full process writeup with sidebar navigation
- `snapshot` — Collection of designs, minimal explanation
- `thoughts` — Written articles (medium/substack style)

## Conventions
- Use semantic HTML throughout (nav, main, article, section, aside, header, footer)
- All interactive elements must have clear hover + focus states
- Mobile-first responsive — design for 375px, then tablet 768px, then desktop 1280px
- Commit after each completed component or page layout
- Never delete progress.md entries — mark as Done ✓ instead

## Workflow
- Claude.ai — design review, planning, decisions, prompt writing
- Claude Code — implementation only, from approved specs
- Never make visual design decisions in code. If something is ambiguous, ask.

## Supporting Docs
Before starting any session, check which of these are relevant and read them:
- `agent_docs/progress.md` — current build status, what's done, what's next, known issues
- `.claude/skills/design-system/SKILL.md` — design rules and conventions (tokens live in code)
- `.claude/skills/component-first/SKILL.md` — mandatory component audit before building any UI
- `.claude/skills/learning/SKILL.md` — code explanation mode for a non-developer learning alongside
- `.claude/skills/deploy/SKILL.md` — GitHub and Vercel deployment steps

Note: copywriting skill will be created in Phase 6 when content is being written.
