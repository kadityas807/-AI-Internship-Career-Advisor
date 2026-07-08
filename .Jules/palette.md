## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-07-08 - Accessible Rating and Hover-Action Patterns

**Learning:** Interactive elements hidden behind hover states (like card actions) are inaccessible to keyboard users unless explicitly handled with `group-focus-within`. Additionally, visual-only rating indicators (stars) create screen reader noise if individual icons aren't hidden and the group isn't given a descriptive `role="img"`.

**Action:** Use `group-focus-within:opacity-100` alongside `group-hover` for action overlays. For rating components, wrap stars in a container with `role="img"` and a dynamic `aria-label`, while marking individual star icons as `aria-hidden="true"`.
