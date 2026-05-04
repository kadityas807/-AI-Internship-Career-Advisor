## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-24 - AI Mentor Chatbot Accessibility and React Hook Rules
**Learning:** Transient UI components like the GlobalChatbot should implement an Escape key listener and auto-focus for better keyboard UX. Additionally, early returns in components must be placed after all Hook declarations to avoid 'react-hooks/rules-of-hooks' violations.
**Action:** Implement Escape key closing and delayed auto-focus for floating widgets. Always ensure pathname-based early returns occur after all useEffects and other hooks.
