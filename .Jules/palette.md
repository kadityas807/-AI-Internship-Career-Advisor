## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-04-13 - Global Chatbot Accessibility and React Purity
**Learning:** Floating widgets often lack basic keyboard navigation (Escape to close) and accessibility labels. Additionally, placing conditional returns before hooks violates React's Rules of Hooks, causing issues when components are conditionally hidden (like on the /mentor route).
**Action:** Always implement Escape key listeners and auto-focus for transient UI. Ensure all hooks are called before any conditional return statements to maintain a stable hook order.
