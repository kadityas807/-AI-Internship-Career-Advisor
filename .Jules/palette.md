## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Accessibility and Keyboard UX in Floating Chat Widget
**Learning:** Floating/transient UI components like the Global Chatbot often lack proper keyboard focus management (auto-focus on open, Escape to close) and ARIA labels for icon-only toggles, creating barriers for keyboard and screen reader users.
**Action:** When implementing transient UI, always include an Escape key listener, auto-focus the primary input (with a slight delay for animations), and provide descriptive ARIA labels/titles for all interactive icons.
