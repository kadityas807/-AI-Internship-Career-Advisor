## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Focus Management in Animated Components

**Learning:** When auto-focusing an input inside a component with entry animations (e.g., `motion.div`), a direct `.focus()` call in `useEffect` may fail or be ignored if the element isn't yet fully interactive or visible. Adding a short delay (e.g., 400ms) ensures the transition is far enough along for the focus to take hold.

**Action:** Use a `setTimeout` within `useEffect` when programmatically focusing elements inside animated containers to ensure reliable focus management.
