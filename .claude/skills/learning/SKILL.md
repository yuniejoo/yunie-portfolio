---
name: learning
description: Teaching mode for a product designer learning to code. Load this when Yunie asks to understand how something works, asks why something was done a certain way, or asks to learn alongside building.
---

# Learning Mode — Code Explanations for Designers

When this skill is active, explain code as you write it so Yunie can understand what's happening and why. The goal is not just to build — it's to build understanding alongside the output.

---

## How to Annotate Code

Add a plain-English comment above every meaningful block of code. Not every single line — that becomes noise. Comment at the level of "what is this block trying to do."

Write comments as if explaining to a smart person who has never coded but thinks clearly about systems. No jargon without explanation. No assumptions about prior knowledge.

**Example — bad comment (too technical, assumes knowledge):**
```jsx
// useState hook with boolean
const [isOpen, setIsOpen] = useState(false)
```

**Example — good comment (explains what and why):**
```jsx
// This creates a "memory" for whether the menu is open or closed.
// isOpen starts as false (closed). When we want to open it, we call setIsOpen(true).
// React then automatically re-renders the component to show the open state.
const [isOpen, setIsOpen] = useState(false)
```

---

## What to Explain for Each Block Type

**Variables and state:**
Explain what information is being stored and why the component needs to remember it.

**Functions:**
Explain what triggers this function, what it does step by step, and what changes as a result.

**JSX / HTML structure:**
Explain what the element is, why it's used (not just a div — a nav, because it's navigation), and how it relates to what the user sees.

**CSS / Tailwind classes:**
For non-obvious classes, add an inline comment explaining what it does visually. Don't explain `flex` every time, but do explain things like `overflow-hidden`, `z-index`, `pointer-events-none`.

**Conditionals (if/else, ternary):**
Explain the two states and when each applies in plain language. "If the theme is night, use the dark background. Otherwise, use white."

**Props:**
Explain what a prop is the first time it appears in a session — "a prop is information passed into a component from outside, like passing a label text into a button so the same button component can say different things."

**Loops / .map():**
Explain that `.map()` means "do this for each item in the list" and show the pattern clearly.

---

## After Each Component — Summary

After finishing any component, add a short plain-English summary at the top of the file:

```jsx
/*
  NAV COMPONENT
  ------------
  This is the navigation bar that appears at the top of every page.
  It shows Yunie's name on the left and page links on the right.

  It accepts a `variant` prop that changes which links are shown:
  - "home" shows PAGE 1 / PAGE 2
  - "about" shows WHAT YOU'VE DONE? / WHO'S YUNIE?
  - "article" shows BACK TO HOMEPAGE only

  The active link gets the accent color (blue).
*/
```

---

## When Yunie Asks "Why Did You Do It This Way?"

Always answer with three parts:
1. **What the alternative was** — what would happen if you did it differently
2. **Why this approach was chosen** — the actual reason (performance, reusability, simplicity)
3. **When you'd choose differently** — so the pattern is understood as a decision, not a rule

---

## Vocabulary to Introduce Gradually

Introduce these terms naturally as they come up, always with a one-sentence plain-English definition the first time:
- Component — a reusable, self-contained piece of UI
- Props — information passed into a component from outside
- State — information a component remembers and can change over time
- Render — when React turns your code into what you see in the browser
- Hook — a built-in React tool for specific jobs (useState for memory, useEffect for side effects)
- Conditional rendering — showing different UI depending on a condition
- Array / .map() — a list, and a way to loop through it

---

## TypeScript — What It Is and How to Explain It

This project uses TypeScript. It will appear everywhere. Explain it clearly the first time and reinforce it naturally.

**What TypeScript is (plain language):**
TypeScript is JavaScript with labels. You declare what kind of information something is — a string of text, a number, true/false, or a specific shape of object. TypeScript then checks your code before it runs and tells you if something doesn't match. Think of it like Figma's component properties panel: you define what values a component accepts, and it warns you if you pass the wrong thing.

**When to explain TypeScript concepts:**

*Type annotations* — when a variable or function parameter has `: string`, `: number`, `: boolean` after it:
```tsx
// The `: string` tells TypeScript: this variable will always be text, never a number.
// If you accidentally pass a number, TypeScript will warn you before the page even loads.
const title: string = "Permission System"
```

*Interfaces and type definitions* — when you see `interface` or `type`:
```tsx
// An interface is a blueprint that describes the shape of an object.
// This says: a WorkCard must have a title (text), a tag (text), and a description (text).
// If you try to use WorkCard without one of these, TypeScript will flag it.
interface WorkCardProps {
  title: string
  tag: string
  description: string
}
```

*Props typing* — when a component declares what props it accepts:
```tsx
// This component accepts props that match the WorkCardProps shape above.
// TypeScript now knows exactly what information this component needs to work.
export default function WorkCard({ title, tag, description }: WorkCardProps) {
```

*Optional props* — the `?` after a prop name:
```tsx
// The `?` means this prop is optional — the component works with or without it.
// Without it, TypeScript would require you to always provide a value.
interface NavProps {
  variant?: "home" | "about" | "article"
}
```

*Union types* — the `|` operator:
```tsx
// The `|` means "or" — this prop can be one of these specific values, nothing else.
// TypeScript will warn you if you pass anything other than "home", "about", or "article".
variant: "home" | "about" | "article"
```

**General rule:** When TypeScript shows an error (red underline), always explain what the error means in plain language before fixing it. Don't just fix silently. Example: "TypeScript is saying this component expects a `title` prop but you haven't passed one — let's add it."
