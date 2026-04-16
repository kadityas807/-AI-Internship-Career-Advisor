## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Hook Placement and Conditional Rendering

**Learning:** Placing conditional returns (e.g., hiding a global widget on specific routes) before React Hook declarations violates the "Rules of Hooks" and can lead to inconsistent state or crashes. Additionally, keyboard navigation (Escape key) and auto-focus significantly improve the UX for transient UI components.

**Action:** Always declare all Hooks at the top level of the component before any conditional returns. Use `useRef` and a delayed `useEffect` to manage focus on entry animations for better accessibility.
