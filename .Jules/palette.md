## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-04-23 - Animated Component Focus Management
**Learning:** Auto-focusing inputs within components that have entry animations (like `motion.div`) can fail or cause jarring visual jumps if triggered immediately. A short delay (e.g., 400ms) ensures the component is fully rendered and the animation is far enough along for a smooth focus transition.
**Action:** Use a `setTimeout` within `useEffect` when auto-focusing elements inside animated containers to ensure a polished user experience.
