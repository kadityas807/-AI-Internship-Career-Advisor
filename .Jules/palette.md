## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-05-22 - Optimizing Global Components for Accessibility and Hook Safety

**Learning:** Global components like chatbots that use route-based exclusion (e.g., hiding on specific pages) can violate the "Rules of Hooks" if early returns are placed before state/hook declarations. Furthermore, these components often lack the refined keyboard support and ARIA context required for complex interactions.

**Action:** Refactor global components into a container for route-checking and a widget for implementation to ensure Hook stability. Always implement 'Escape' key listeners for transient UI, use 'role="log"' for dynamic message streams, and ensure focus is programmatically moved to inputs upon opening to delight keyboard users.
