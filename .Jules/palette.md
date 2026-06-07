## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.
## 2025-05-14 - [A11y & UX: Global Chatbot Enhancements]
**Learning:** Adding keyboard listeners (Escape to close) and auto-focus for inputs in modal-like widgets significantly improves the experience for keyboard-only users. Additionally, ensuring the input is not disabled when attempting to focus it is critical; if the input is disabled during a "loading" state, the focus attempt will fail.
**Action:** Always check the 'disabled' state of an element before attempting programmatic focus, and use setTimeout to ensure focus happens after entry animations complete.
