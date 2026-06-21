## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-21 - Improving Keyboard Discoverability of Hover-Only Actions

**Learning:** Buttons hidden behind hover states (using `group-hover:opacity-100`) are inaccessible to keyboard users unless explicitly handled. Using `group-focus-within:opacity-100` on the container ensures these actions appear when the user tabs into the row, significantly improving accessibility without cluttering the visual design for mouse users.

**Action:** Always pair `group-hover:opacity-100` with `group-focus-within:opacity-100` for action containers in lists and tables.
