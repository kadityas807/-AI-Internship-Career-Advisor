## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Micro-UX and Build Stability
**Learning:** Combining small accessibility fixes (ARIA labels, keyboard visibility) with critical build-breaking fixes (incorrect library imports, Rules of Hooks violations) ensures a polished and functional user experience. Always verify that global widgets follow React standards to avoid runtime errors during route transitions.
**Action:** Prioritize safety confirmations for destructive actions and ensure all interactive elements are reachable and descriptive for keyboard and screen reader users.
