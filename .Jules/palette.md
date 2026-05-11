## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.
## 2025-05-14 - [A11y/UX] Global Chatbot Accessibility and Focus Management
**Learning:** Transient UI components like floating chatbots often lack basic keyboard accessibility (Escape to close) and focus management (auto-focusing the input). Additionally, placing conditional returns (e.g., hiding the widget on specific routes) before React Hooks violates the "Rules of Hooks" and can lead to runtime instability.
**Action:** Always implement an Escape key listener and auto-focus the primary input (with a slight delay for animations) when opening modal-like widgets. Ensure all route-based conditional returns are placed after all hook declarations.
