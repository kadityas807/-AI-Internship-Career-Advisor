## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-04-19 - Focus Management in Animated Components
**Learning:** Programmatic focus (e.g., `input.focus()`) can fail or be interrupted when triggered simultaneously with entry animations. A slight delay matching or slightly exceeding the animation duration (e.g., 400ms) ensures reliable focus placement.
**Action:** Always use a `setTimeout` within a `useEffect` when auto-focusing elements inside `AnimatePresence` or `motion` components.
