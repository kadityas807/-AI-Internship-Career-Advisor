## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-24 - AI Chatbot UX and Accessibility Enhancements

**Learning:** Global UI widgets like chatbots should strictly follow React's Rules of Hooks by placing all hook declarations before any conditional returns (e.g., hiding on specific routes). They should also provide intuitive keyboard escapes and auto-focus mechanisms to reduce friction, especially when triggered from floating action buttons.

**Action:** Ensure all hooks (useState, useEffect, useRef) are declared at the top level of the component. Use a `setTimeout` (approx. 400ms) within a `useEffect` to manage programmatic focus after entry animations to ensure the target element is ready to receive focus.
