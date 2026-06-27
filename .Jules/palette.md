## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Accessible Visualization of Rating Components

**Learning:** Visual-only rating displays (like star ratings) are often skipped by screen readers or read as a confusing series of icons. Wrapping the group in a container with `role="img"` and a dynamic `aria-label` providing the current state (e.g., "3 out of 5 stars") makes the information accessible.

**Action:** For all non-interactive rating visualizations, use `role="img"` on the container with a descriptive `aria-label`, and mark individual icons as `aria-hidden="true"`.
