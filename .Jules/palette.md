## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-24 - Keyboard Accessibility for Hover-Only Actions

**Learning:** Interactive elements hidden behind CSS hover states (e.g., group-hover:opacity-100) are inaccessible to keyboard users as they don't trigger on focus.

**Action:** Always pair group-hover with group-focus-within (and ensure focus-visible styles) so that action buttons become visible and usable when a user tabs into the parent container.
