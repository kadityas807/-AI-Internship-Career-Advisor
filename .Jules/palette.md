## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Keyboard Interaction for Transient UI
**Learning:** Transient UI components like the floating chatbot widget lacked essential keyboard shortcuts (Escape to close) and entry focus (auto-focusing the input field), making them cumbersome for keyboard-only users to interact with and dismiss.
**Action:** Implement an 'Escape' key listener for all overlay/modal-like components. Use a slight delay (e.g., 400ms) with a useEffect to auto-focus the primary input field after entry animations to ensure the element is ready to receive focus.
