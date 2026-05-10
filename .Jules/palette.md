## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Accessibility and Focus Management in Global Chatbot
**Learning:** Transient UI components like the floating chatbot require careful focus management; auto-focusing the input after the entry animation (using a 400ms delay) and providing an 'Escape' key listener significantly improves the experience for keyboard users.
**Action:** Always implement 'Escape' to close for global widgets and use `setTimeout` to synchronize programmatic focus with CSS/Motion animations.
