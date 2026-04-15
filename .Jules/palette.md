## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Interactive Chat Widget Enhancements

**Learning:** When implementing floating or modal-like interactive components, users expect standard keyboard shortcuts (like `Escape` to close) and immediate focus on primary actions (like auto-focusing the chat input). Additionally, React Hook order must be strictly preserved even when using route-based conditional visibility.

**Action:** Implement `Escape` key listeners for transient UI components. Use a small delay (e.g., 400ms) when auto-focusing inputs within components that have entry animations to ensure they are ready to receive focus. Always place conditional returns after all hook declarations.
