## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Interactive Chatbot Enhancements and Keyboard-Accessible Tooltips

**Learning:** Global UI widgets like the AI Mentor chatbot benefit significantly from small interactive touches: auto-focusing the input field after the entry animation completes and providing an 'Escape' key listener to close the widget. Additionally, Tailwind tooltips that rely on 'group-hover' are inaccessible to keyboard users unless 'group-focus-within' is also applied.

**Action:** When implementing floating widgets, always include a 400ms-delayed auto-focus on the primary input and an Escape key listener. For any hover-triggered visibility (like tooltips), consistently add 'group-focus-within' to ensure visibility during keyboard navigation.
