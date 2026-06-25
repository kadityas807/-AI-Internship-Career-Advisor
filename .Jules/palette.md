## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-25 - Contextual Confirmations and Keyboard Visibility for Card Actions

**Learning:** Destructive actions like deletions benefit from contextual confirmation messages (e.g., including the item name). Additionally, card-based action buttons hidden behind hover states must be made visible on focus (using `group-focus-within`) to support keyboard navigation.

**Action:** Update deletion handlers to accept the item name for use in `window.confirm`. For card actions, use `group-focus-within:opacity-100` on the container and ensure all icon-only buttons have `aria-label` and `focus-visible` ring styles.
