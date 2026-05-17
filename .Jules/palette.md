## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-05-17 - Enhancing Interactive Widgets with Keyboard and Focus Support

**Learning:** Global interactive widgets like the AI Mentor Chatbot require comprehensive keyboard support (e.g., Escape to close) and programmatic focus management (e.g., auto-focusing inputs on open) to ensure a fluid and accessible user experience.

**Action:** Implement Escape key listeners for transient UI elements and use `useEffect` with `setTimeout` to manage focus transitions in animated containers.
