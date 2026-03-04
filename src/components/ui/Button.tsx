'use client'

/*
  BUTTON COMPONENT
  ----------------
  Reusable button for navigation items, filter tabs, and any clickable label
  that changes state when selected.

  It has two types — think of it like a Figma component with a "type" property:

  - "primary": Larger text (16px, IBM Plex Mono Medium, uppercase).
    Has 8px horizontal padding. Right side reduces to 4px when an icon is shown.
    When selected, shows white text on a blue background. Used for main
    navigation items and primary filter labels.

  - "secondary": Smaller text (14px, IBM Plex Mono Medium, uppercase).
    No padding. Text-only state changes — no background in any state.
    Used for sub-navigation and secondary filter labels.

  OPTIONAL ICON SUPPORT (icon + hasIcon props):
  Pass icon={<SomeIcon />} and hasIcon={true} to render an icon to the right of
  the label text. The icon inherits the button's text color automatically, so it
  matches every state (default, hover, selected) without any extra styling.
  The caller controls the icon's size by passing in a pre-sized icon element.

  WHY TWO SIZES?
  Because visual hierarchy matters. A primary nav item (bigger) and a secondary
  sub-item (smaller) are both "buttons" — but their different sizes signal
  different levels of importance in the layout.

  HOW isSelected WORKS:
  The parent component (e.g. a nav bar) tells this button which state to show
  by passing isSelected={true} or isSelected={false}. The button doesn't track
  its own selected state — that decision lives in the parent, which knows which
  item is currently active.

  HOW HOVER WORKS:
  Hover is handled entirely by CSS via Tailwind's `hover:` prefix. No JavaScript
  is needed — the browser automatically applies the hover style when the cursor
  is over the button. When a button is selected, no hover classes are applied,
  so the selected styling locks in and doesn't change on hover.
*/

import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────
// TYPESCRIPT INTERFACE — What props this component accepts
//
// Think of this like Figma's component properties panel.
// Every prop listed here is a piece of information the parent
// can pass in to control how this button looks and behaves.
//
// TypeScript is JavaScript with labels. By declaring an interface,
// we tell TypeScript exactly what shape this component expects.
// If a parent passes the wrong thing, TypeScript warns before the
// page even loads — the same way Figma warns if you pass the wrong
// value to a component property.
// ─────────────────────────────────────────────────────────
interface ButtonProps {
  // Which visual variant to use.
  // The `|` means "or" — only these two values are allowed, nothing else.
  // TypeScript will warn if you pass anything other than "primary" or "secondary".
  // The `?` means this prop is optional — it defaults to "primary" if not provided.
  type?: 'primary' | 'secondary'

  // Whether this button is in the "selected / active" state.
  // true  = show selected styling (blue fill for primary, blue text for secondary)
  // false = show default styling (gray text, hover turns it lighter blue)
  // Optional — defaults to false.
  isSelected?: boolean

  // The function to run when the button is clicked.
  // `() => void` means: a function that takes no arguments and returns nothing.
  // Optional — if not provided, clicking does nothing.
  onClick?: () => void

  // The content shown inside the button — usually text like "WORK" or "ABOUT".
  // ReactNode means it can be text, an HTML element, or another component.
  children: ReactNode

  // The icon element to render to the right of the label when hasIcon is true.
  //
  // WHAT IS ReactNode?
  // ReactNode is React's broadest type for "anything React can render" — a string,
  // a number, a plain HTML element like <svg>, another component like <ArrowRight />,
  // null, or an array of any of these. Declaring this as ReactNode means the caller
  // can pass in any icon library element and TypeScript will accept it without complaint.
  icon?: ReactNode

  // Whether the button should adjust its layout to accommodate an icon.
  //
  // WHY ARE icon AND hasIcon SEPARATE PROPS INSTEAD OF JUST ONE?
  // You might wonder: if icon is provided, can't we just detect that and treat
  // it as "has icon"? In theory yes — but separating them is intentional:
  //
  //   hasIcon  → controls *layout*: triggers flex, reduces right padding,
  //              adds gap. This is about structure.
  //   icon     → provides the *content*: the actual element to render.
  //              This is about data.
  //
  // Keeping them separate mirrors how Figma works: "Show icon" (boolean toggle)
  // and "Icon" (instance swap) are independent fields in the properties panel.
  // It also makes the button's intent explicit — a future caller can opt into
  // the icon layout without yet knowing which icon to pass.
  //
  // Default: false (no icon layout adjustments).
  hasIcon?: boolean

  // Whether the button stretches to fill its container's full width.
  //
  // In Figma terms:
  //   fullWidth={false} → "Hug contents" — the button is only as wide as its text.
  //   fullWidth={true}  → "Fill container" — the button expands to fill the available space.
  //
  // In CSS terms:
  //   "w-fit"  = width: fit-content — shrinks to wrap the content tightly.
  //   "w-full" = width: 100% — stretches to match the width of the parent element.
  //
  // Optional — defaults to false (hug / fit-content).
  fullWidth?: boolean

  // Optional extra Tailwind classes from the parent, for one-off adjustments
  // without making a whole new variant.
  className?: string
}

// ─────────────────────────────────────────────────────────
// BUTTON COMPONENT
//
// We "destructure" the props — instead of writing `props.type`, we pull each
// value out by name directly in the function signature. The `= 'primary'` and
// `= false` are default values: if the parent doesn't pass those props, these
// values are used automatically.
// ─────────────────────────────────────────────────────────
export default function Button({
  type = 'primary',
  isSelected = false,
  hasIcon = false,
  fullWidth = false,
  onClick,
  children,
  icon,
  className = '',
}: ButtonProps) {

  // ─────────────────────────────────────────────────────────
  // SHARED BASE CLASSES
  // These apply to every button regardless of type or state.
  // ─────────────────────────────────────────────────────────

  // "cursor-pointer"   = show the hand/pointer cursor on hover, signaling clickability.
  // "border-0"         = remove the default border browsers add to <button> elements.
  // "outline-none"     = remove the default browser focus ring (accessibility focus
  //                      styles will be added in a later phase).
  // "transition-colors" = when a color-related CSS property changes (text color,
  //                      background), animate it smoothly instead of snapping instantly.
  // "duration-200"     = the animation lasts 200 milliseconds.
  // "ease-in-out"      = starts slow, accelerates, then decelerates — a natural feel.
  const baseClasses =
    'cursor-pointer border-0 outline-none transition-colors duration-200 ease-in-out'

  // ─────────────────────────────────────────────────────────
  // PRIMARY TYPE CLASSES
  // ─────────────────────────────────────────────────────────

  // "label-1-medium" is a CSS class defined in globals.css. It sets:
  //   font-family: IBM Plex Mono, font-size: 16px, line-height: 24px,
  //   font-weight: 500 (Medium), text-transform: uppercase.
  //
  // Padding: left always stays at 8px (pl-2 = spacing-2 token).
  // Right padding is normally also 8px (px-2), but shrinks to 4px (pr-1 =
  // spacing-1 token) when an icon is present — so the icon sits closer to
  // the edge and the label+icon group feels visually balanced.
  // "py-0" = 0px padding on top and bottom.
  //
  // The part inside ${ } is a ternary — a shorthand if/else:
  //   condition ? "classes when true" : "classes when false"
  //
  // If isSelected is true →
  //   "text-text-on-primary"  white text  (--color-text-on-primary token)
  //   "bg-surface-dark"       blue fill   (--color-surface-dark token)
  //   No hover classes — selected state locks in and doesn't change on hover.
  //
  // If isSelected is false →
  //   "text-text-body"               gray text (default state, --color-text-body)
  //   "bg-transparent"                no background
  //   "hover:text-text-primary-hover" on hover: lighter blue text
  //     The "hover:" prefix is Tailwind's way of saying "only apply this class
  //     when the cursor is over this element." The browser handles it automatically
  //     — no JavaScript needed.
  const primaryClasses = `label-1-medium ${hasIcon && icon ? 'pl-2 pr-1' : 'px-2'} py-0 ${
    isSelected
      ? 'text-text-on-primary bg-surface-dark'
      : 'text-text-body bg-transparent hover:text-text-primary-hover'
  }`

  // ─────────────────────────────────────────────────────────
  // SECONDARY TYPE CLASSES
  // ─────────────────────────────────────────────────────────

  // "label-2-medium" = IBM Plex Mono, 14px, 22px line-height, weight 500, uppercase.
  // No padding in any direction (spec: "no padding on any side").
  // No background in any state — only the text color changes.
  //
  // If isSelected is true →
  //   "text-text-primary"  full accent blue  (--color-text-primary token)
  //   No background change — secondary selected is text-only.
  //
  // If isSelected is false →
  //   "text-text-body"               gray text (default)
  //   "hover:text-text-primary-hover" lighter blue on hover
  const secondaryClasses = `label-2-medium bg-transparent ${
    isSelected
      ? 'text-text-primary'
      : 'text-text-body hover:text-text-primary-hover'
  }`

  // ─────────────────────────────────────────────────────────
  // COMBINE ALL CLASSES
  // ─────────────────────────────────────────────────────────

  // Pick the right set of type-specific classes based on the `type` prop.
  // This is a ternary again: "if type is primary, use primaryClasses, else use secondaryClasses."
  const typeClasses = type === 'primary' ? primaryClasses : secondaryClasses

  // "w-fit"  = shrink to content width (Figma: "Hug contents").
  // "w-full" = stretch to fill the parent container (Figma: "Fill container").
  const widthClass = fullWidth ? 'w-full' : 'w-fit'

  // When an icon is present, switch the button interior to a flex row so the
  // label and icon sit side by side. "items-center" keeps the icon vertically
  // centered against the text baseline regardless of its height.
  // "gap-1" = 4px space between label and icon (spacing-1 token).
  // This is an empty string when no icon is active, so it adds nothing to the output.
  const iconLayoutClasses = hasIcon && icon ? 'flex items-center gap-1' : ''

  // Combine: shared base + width + type-specific + icon layout + any optional overrides.
  // filter(Boolean) drops any empty strings so there are no stray spaces in the output.
  const allClasses = [baseClasses, widthClass, typeClasses, iconLayoutClasses, className]
    .filter(Boolean)
    .join(' ')

  // ─────────────────────────────────────────────────────────
  // RENDER — What gets turned into HTML and shown in the browser
  //
  // A single <button> element — no wrapper divs, as per spec.
  //
  // type="button" prevents accidental form submission. Without it, a <button>
  // inside a <form> defaults to type="submit" and would submit the form on click.
  // Being explicit avoids that surprise behavior.
  // ─────────────────────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={onClick}
      className={allClasses}
    >
      {children}
      {/* Render the icon to the right of the label when both hasIcon and icon are set.
          No color or size is applied here — the icon inherits the button's current
          text color, so it automatically matches default / hover / selected states.
          The caller sizes the icon by passing a pre-sized element, e.g. <ArrowRight size={16} />. */}
      {hasIcon && icon}
    </button>
  )
}
