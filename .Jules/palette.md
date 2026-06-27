## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Confirmation Dialogs for Destructive Actions
**Learning:** Destructive actions like deleting applications or removing social profiles were previously executed immediately upon click, leading to accidental data loss. Using contextual confirmation dialogs improves data safety and user confidence.
**Action:** Implement `window.confirm()` with a contextual message (including the item's name) for all destructive actions.
