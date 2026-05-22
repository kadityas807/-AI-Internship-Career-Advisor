## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Micro-UX and Accessibility in Global Chatbot

**Learning:** Global floating widgets (like the AI Mentor) often lack standard keyboard interaction patterns. Users expect the 'Escape' key to dismiss transient overlays and for focus to be automatically placed in the primary interaction field (the chat input) upon opening.

**Action:** Implement an 'Escape' key listener for all floating widgets and auto-focus the main input with a slight delay (e.g., 400ms) to account for entry animations, ensuring a seamless transition for keyboard users.
