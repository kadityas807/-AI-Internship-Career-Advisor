## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-24 - Enhancing Global Chatbot Accessibility and Focus Management
**Learning:** Floating components with entry animations require a short delay (e.g., 300ms) before auto-focusing internal inputs to ensure the element is fully interactive. Additionally, route-based visibility checks must be placed after all React Hook declarations to prevent 'rules-of-hooks' violations.
**Action:** Always wrap auto-focus logic in a `useEffect` with a timeout when animations are involved, and place conditional early returns at the end of the Hook block.
