## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Global Chatbot Accessibility & Focus Management

**Learning:** Global floating widgets (like chatbots) require explicit keyboard handling (Escape to close) and focus management (auto-focusing input on open) to provide a smooth, accessible experience. Additionally, using `role="log"` on the message container ensures screen readers announce new incoming messages automatically.

**Action:** When implementing overlay or drawer components, include a global keyboard listener for the 'Escape' key and manage focus programmatically. Use appropriate ARIA roles like `log` for live message feeds and `status` for transient states like "Thinking...".
