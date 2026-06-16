## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-02-14 - Interactive Feedback and Keyboard Visibility

**Learning:** Interactive elements hidden behind hover states (like table action buttons) are completely inaccessible to keyboard users unless they are also revealed on focus. Additionally, destructive actions without confirmation dialogs pose a significant risk of accidental data loss.

**Action:** Use `group-focus-within:opacity-100` to ensure action containers become visible when any child element receives focus. Always implement `window.confirm()` for delete actions, including the item name for clarity.
