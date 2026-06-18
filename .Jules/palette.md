## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-06-18 - Confirmation Dialogs and Keyboard Visibility in Data Tables

**Learning:** Destructive actions like deleting application records should always have a confirmation dialog to prevent accidental data loss. Furthermore, action buttons hidden behind hover states (common in data tables) must be explicitly made visible when a keyboard user tabs into them using the `group-focus-within` class.

**Action:** Implement `window.confirm` for delete handlers and add `group-focus-within:opacity-100` to action containers to ensure accessibility for non-mouse users.
