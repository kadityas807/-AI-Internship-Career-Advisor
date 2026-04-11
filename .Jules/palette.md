## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - React Rules of Hooks and Global UI Accessibility
**Learning:** Placing conditional returns (e.g., based on `pathname`) before Hook declarations in global components like `GlobalChatbot` violates the Rules of Hooks and causes runtime errors. Additionally, floating action buttons and icon-only controls in the chat widget often miss ARIA labels and focus indicators.
**Action:** Always ensure all Hooks are called at the top level of the component before any conditional returns. Consistently apply `aria-label` and `focus-visible:ring` to interactive floating elements.
