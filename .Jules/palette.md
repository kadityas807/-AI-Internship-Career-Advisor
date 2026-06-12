## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Global Widget Accessibility and Focus Management
**Learning:** Global floating widgets (like the GlobalChatbot) often lack standard keyboard interaction (Escape key to close) and initial focus. Additionally, placing early returns for route-based exclusion (e.g., hiding on /mentor) before Hook declarations violates React's Rules of Hooks.
**Action:** Use a useEffect hook to manage focus and Escape key listeners when a widget opens. Always place conditional returns after all Hook declarations to ensure consistent render order.
