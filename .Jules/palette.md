## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Interactive Micro-UX in Skills Ledger

**Learning:** Destructive actions like deleting skills benefit from a `window.confirm` dialog to prevent accidents. Furthermore, elements hidden by `group-hover:opacity-0` must be made visible via `group-focus-within:opacity-100` to remain accessible to keyboard-only users who tab through the interface.

**Action:** Implement `window.confirm()` for all delete operations. For any UI elements that appear on hover, ensure they also appear on focus using Tailwind's `group-focus-within` utility.
