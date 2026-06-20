## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-06-20 - Enhanced Safety and Keyboard Accessibility in Skills Ledger

**Learning:** Destructive actions like deleting skills lacked confirmation, leading to potential data loss. Additionally, action buttons hidden by hover were inaccessible to keyboard-only users.

**Action:** Implement `window.confirm` for destructive actions with contextual item names. Use `group-focus-within` to reveal hover-only actions when tabbing, and provide descriptive `aria-label` attributes for icon-only buttons. When using `aria-label` on visual containers (e.g., star ratings), add `role="img"` for better screen reader support.
