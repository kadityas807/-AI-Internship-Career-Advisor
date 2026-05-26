## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-24 - Enhancing Global Chatbot Accessibility and Interaction

**Learning:** Interactive floating widgets like the Global Chatbot require specific keyboard and screen reader considerations: auto-focusing inputs after animations, supporting the 'Escape' key for closing, and using `role="log"` for message streams.

**Action:** Implement `setTimeout` focus management for animated entry, global 'Escape' listeners for modal-like components, and semantic ARIA roles (`role="log"`, `aria-live="polite"`) to ensure real-time updates are accessible.
