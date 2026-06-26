## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Progressive Disclosure and Safety in Skills Ledger

**Learning:** Interactive elements hidden behind hover states (like Edit/Delete buttons on skill cards) are inaccessible to keyboard users unless explicitly handled with focus-within triggers. Additionally, destructive actions without confirmation pose a data loss risk.

**Action:** Use `group-focus-within` in combination with hover states to ensure action buttons are visible to keyboard users. Always implement `window.confirm` for deletions and wrap abstract visual indicators (like star ratings) in `role="img"` with descriptive `aria-label`s.
