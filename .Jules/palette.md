## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-24 - Route-based Component Exclusion and Rules of Hooks

**Learning:** When a component requires exclusion on specific routes (e.g., hiding a global chatbot on a dedicated mentor page) while also using Hooks (state, effects), placing an early `pathname` return above Hook declarations violates the "Rules of Hooks".

**Action:** Refactor such components into a lightweight container that performs the route check and a separate implementation component containing all state and Hooks. This ensures Hooks are called consistently and prevents background resource consumption on excluded pages.
