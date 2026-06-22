## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-22 - Safety and Accessibility in Destructive Actions

**Learning:** Destructive UI actions (like deleting applications or profiles) require explicit user confirmation to prevent accidental data loss. Additionally, buttons hidden behind hover states must be made accessible to keyboard users using `group-focus-within`.

**Action:** Implement `window.confirm` for delete operations and use `group-focus-within:opacity-100` alongside `group-hover:opacity-100` to ensure action visibility for all users.
