## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-22 - Enhanced Interaction and Accessibility in Skills Ledger

**Learning:** For destructive actions like deleting skills, a `window.confirm` dialog provides a critical safety net. For visual-only groups like star ratings, wrapping them in a container with `role="img"` and a descriptive `aria-label` ensures screen readers convey the meaning without redundant noise. Additionally, using `group-focus-within` ensures that action buttons hidden behind hover states are accessible to keyboard users.

**Action:** Implement confirmation dialogs for all destructive operations. Use ARIA `role="img"` with descriptive labels for non-textual indicators. Ensure hover-only controls are also visible on focus using `group-focus-within`.
