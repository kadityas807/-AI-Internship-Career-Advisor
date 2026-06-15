## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-15 - Enhancing Card Interactions and Data Safety

**Learning:** Hidden action buttons in list/card items (e.g., hover-only Edit/Delete) are inaccessible to keyboard users unless explicitly handled with `group-focus-within`. Additionally, destructive actions without confirmation leads to poor UX and accidental data loss.

**Action:** Use `group-focus-within:opacity-100` to reveal hidden actions when any element within the card receives focus. Always implement `window.confirm` for deletion tasks, including the item name for clarity.
