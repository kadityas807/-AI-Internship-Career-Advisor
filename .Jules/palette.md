## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Accessibility and Keyboard Navigation in Global Chatbot

**Learning:** Global floating widgets like the AI Mentor lacked intuitive keyboard-based exit paths and accessible labels, making them difficult to navigate for non-pointer users. Additionally, placing early returns before Hooks in these widgets can lead to 'Rules of Hooks' violations during route transitions.

**Action:** Implement 'Escape' key listeners for all global floating UI components to provide a standard exit path. Ensure all icon-only buttons have descriptive 'aria-label' attributes and 'focus-visible' ring styles. Always place route-based early returns at the end of the component function to maintain consistent Hook execution.
