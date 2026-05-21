## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Global Chatbot Focus and Keyboard Management

**Learning:** Transient UI components like global chatbots require explicit keyboard-based closing mechanisms (Escape key) and proactive focus management (auto-focusing the input) to meet user expectations and accessibility standards (WCAG 2.1).

**Action:** Implement 'Escape' key listeners for all transient/modal widgets and use a short `setTimeout` (matching transition durations) to programmatically focus the primary input field upon opening.
