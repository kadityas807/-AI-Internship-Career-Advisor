## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-04-07 - Optimization and React Hook Integrity in GlobalChatbot
**Learning:** Placing route-based early returns after Hook declarations but before expensive data processing (like .filter) ensures compliance with the Rules of Hooks while maintaining component performance.
**Action:** In GlobalChatbot.tsx, always ensure Hooks (useState, useEffect) are at the top, followed by the route visibility check, and then the final rendering logic.
