## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhanced Global Component Interaction Patterns

**Learning:** Global UI overlays (like chatbots or sidebars) require consistent keyboard navigation (Escape to close) and focus management (auto-focusing the primary input on open) to feel integrated and accessible. In React, implementing route-based conditional rendering for these components must be done *after* all Hook declarations to avoid Rules of Hooks violations.

**Action:** Use a standardized "overlay interaction" pattern: an `Escape` key listener, a 400ms-delayed auto-focus for entry animations, and ensuring the conditional `return null` is at the bottom of the component function.
