## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-24 - Keyboard Visibility for Hover-Only Actions

**Learning:** Interactive elements hidden behind hover states (e.g., using `group-hover:opacity-100`) are unreachable or invisible for keyboard users.

**Action:** Use `group-focus-within:opacity-100` and `group-focus-within:translate-y-0` alongside hover classes to ensure action buttons are revealed when any element within the group receives focus.
