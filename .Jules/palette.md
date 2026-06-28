## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhanced Star Rating and Modal Form Accessibility
**Learning:** Decorative icons used in a series (like star ratings) should be wrapped in a container with `role="img"` and a descriptive `aria-label`, while individual icons should be `aria-hidden="true"` to avoid screen reader clutter. Additionally, all modal form fields must have explicit `id` and `htmlFor` associations for reliable focus management and accessibility.
**Action:** Implement the `role="img"` pattern for rating groups and ensure 1:1 label-to-input mapping in all interactive modals.
