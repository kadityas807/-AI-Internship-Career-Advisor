## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Keyboard Accessibility and Focus Management in Global Chatbot

**Learning:** Transient UI components like floating chat widgets significantly benefit from 'Escape' key support for dismissal and delayed auto-focus on primary inputs (300ms) to ensure the element is ready after entry animations, improving the experience for keyboard and screen reader users.

**Action:** Implement 'Escape' key listeners for all overlay or floating components. Use a 300ms delay in a `useEffect` for auto-focusing inputs inside animated containers to ensure focus is reliably captured.
