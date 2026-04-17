## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-04-17 - React Hook Compliance and Interactive Focus in Widgets
**Learning:** Placing route-based conditional returns before Hook declarations violates React's 'Rules of Hooks' and causes linting errors. Additionally, auto-focusing inputs within animated components requires a short delay (e.g., 400ms) to ensure the element is painted and ready to receive focus.
**Action:** Always declare all Hooks at the top of the component before any conditional logic. Use a 'setTimeout' within a 'useEffect' to manage programmatic focus for elements with entry animations.
