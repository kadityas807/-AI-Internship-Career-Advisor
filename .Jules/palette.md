## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Hook Stability in Global Route-Aware Components

**Learning:** Early returns based on route (e.g., `pathname === '/mentor'`) in global components can violate the "Rules of Hooks" if hooks are declared after the return. This causes runtime errors when navigating between routes where the component is shown vs. hidden.

**Action:** Place route-based conditional returns at the bottom of the component function, after all Hook declarations, to ensure Hooks are always called in the same order regardless of whether the component renders its full UI or `null`.
