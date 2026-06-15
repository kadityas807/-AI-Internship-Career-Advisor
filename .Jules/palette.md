## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Micro-UX and A11y in Skills Ledger

**Learning:** Destructive actions like deleting a skill lacked a confirmation step, risking data loss. Additionally, hover-only action buttons were inaccessible to keyboard users, and form inputs lacked programmatic label associations.

**Action:** Implement `window.confirm` for deletions. Use `group-focus-within` and `focus-visible` classes to ensure action buttons are visible and clear during keyboard navigation. Always use `id` and `htmlFor` for form accessibility.
