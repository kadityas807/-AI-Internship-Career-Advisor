## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-03 - Global Chatbot Accessibility and Keyboard UX

**Learning:** Global floating widgets like chatbots require specialized focus management (auto-focus with delay for animations) and keyboard escape listeners to be truly accessible and intuitive for power users and those using assistive technology. Adding role="log" and aria-live="polite" to the message container ensures new AI responses are announced without interrupting the user's current task.

**Action:** Implement Escape key listeners and delayed auto-focus for all modal-like floating widgets. Ensure message logs have appropriate ARIA live region attributes to support real-time interaction feedback.
