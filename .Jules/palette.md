## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Keyboard Accessibility for Hover-Triggered Actions

**Learning:** UI patterns that hide action buttons until hover (e.g., using `group-hover:opacity-100`) are inaccessible to keyboard users unless they also respond to focus.

**Action:** When using hover-triggered actions, always include `group-focus-within:opacity-100` and `group-focus-within:translate-y-0` to ensure visibility during keyboard navigation. Pair this with `focus-visible` styles on the buttons themselves for clear indication of focus.
