## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Clean Hook Patterns for Route-Based Components

**Learning:** Implementing conditional early returns based on `pathname` (e.g., hiding a global widget on specific routes) before calling hooks violates the "Rules of Hooks" and triggers linting errors.

**Action:** Refactor such components into a container that performs the route check and a child implementation component that contains all state and Hooks. This ensures hooks are called unconditionally and prevents background resource consumption on excluded pages.
