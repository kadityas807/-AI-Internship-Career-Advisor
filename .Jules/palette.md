## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Progressive Visibility and Safety in Lists

**Learning:** Hover-only actions (using `group-hover:opacity-100`) in tables are inaccessible to keyboard users and lack safety for destructive operations.

**Action:** Add `group-focus-within:opacity-100` to action containers to reveal them on focus. Always wrap destructive actions (delete/remove) in `window.confirm()` with contextual details (e.g., item name) to prevent accidental data loss.
