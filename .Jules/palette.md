## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-06-15 - Global Chatbot Keyboard and A11y Enhancements

**Learning:** Enhancing small persistent UI elements like floating chatbots with `Escape` key support and auto-focus significantly improves keyboard-only efficiency. Programmatic focus should use a short delay (e.g., 300ms) to ensure it triggers after entry animations complete.

**Action:** Implement `Escape` key listeners for all transient UI components and ensure primary inputs are auto-focused upon opening to align with user expectations for interactive widgets.
