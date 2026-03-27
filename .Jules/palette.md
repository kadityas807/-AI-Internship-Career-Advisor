## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Focus Management in Animated Components

**Learning:** When using entry animations (e.g., `motion.div`), immediate focus calls on internal inputs often fail because the element is not yet fully rendered or ready.

**Action:** Use a short delay (e.g., 300ms) within a `useEffect` to ensure the element is interactive before calling `.focus()`.
