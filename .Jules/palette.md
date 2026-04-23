## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Auto-focus with Entry Animations

**Learning:** When auto-focusing an input within a component that has an entry animation (like those using `motion.div`), a direct `focus()` call may fail or happen too early. A short delay (e.g., 300ms) ensures the element is fully rendered and ready to receive focus.

**Action:** Wrap programmatic focus logic in a `setTimeout` with a duration that matches or slightly exceeds the component's entry transition time.
