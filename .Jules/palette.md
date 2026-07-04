## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-07-04 - Enhancing Micro-UX in Skills Ledger

**Learning:** Adding confirmation dialogs for destructive actions like deleting skills improves user confidence. Combining this with enhanced keyboard visibility (using `group-focus-within`) ensures that action buttons hidden behind hover states are accessible to all users.

**Action:** Consistently implement `window.confirm` for deletions and use `group-focus-within` alongside `group-hover` for action buttons to maintain a clean UI without sacrificing accessibility.
