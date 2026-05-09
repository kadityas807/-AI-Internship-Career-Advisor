## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhanced Global Chatbot Accessibility and Interaction

**Learning:** Floating widgets like the `GlobalChatbot` require extra attention to keyboard navigation and accessibility beyond basic ARIA labels. Users expect these widgets to be closable via the 'Escape' key and for the input to be focused immediately upon opening. Additionally, loading states should be programmatically announced.

**Action:** Always implement 'Escape' to close for global overlays. Use a slight delay (e.g., 400ms) for auto-focusing inputs within animated containers to ensure the element is ready. Use `role="status"` and `aria-live="polite"` for transient loading indicators.
