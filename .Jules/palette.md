## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-13 - Focus Management in Animated Global Widgets

**Learning:** Programmatic focus (e.g., `.focus()`) on elements within animated containers (like the `GlobalChatbot`) can fail or cause jank if triggered before the entry animation completes. Additionally, global UI widgets should always support the 'Escape' key for rapid dismissal.

**Action:** When auto-focusing an input in an animated component, use a `setTimeout` (approx. 400ms) within a `useEffect` hook to ensure the container is stable and visible. Always implement a global 'Escape' key listener for transient UI elements to maintain high usability for keyboard-centric workflows.
