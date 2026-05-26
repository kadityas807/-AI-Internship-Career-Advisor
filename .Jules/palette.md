## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-05-26 - Chatbot Widget Accessibility and React Hook Patterns

**Learning:** Global UI widgets like chatbots often suffer from poor keyboard accessibility (missing Escape-to-close, lack of focus management) and screen reader invisibility. Additionally, placing route-based early returns before Hook declarations (e.g., `useRef`, `useEffect`) violates the "Rules of Hooks" and can lead to inconsistent application state.

**Action:** Implement `Escape` key listeners and auto-focus (with a slight delay for animations) in modal-like widgets. Use `role="log"` and `aria-live="polite"` for dynamic message areas. Always place conditional returns at the bottom of the component, after all Hook declarations, to ensure a stable Hook call order.
