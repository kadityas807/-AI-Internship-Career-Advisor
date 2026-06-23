## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Micro-UX and Accessibility in Skills Ledger

**Learning:** Interactive cards with hidden hover actions (like Edit/Delete) were completely inaccessible to keyboard users and lacked context for screen readers. Star ratings provided no textual information for a11y.

**Action:** Add `group-focus-within` to reveal hover actions when tabbing into cards. Use dynamic `aria-label` for item-specific actions (e.g., "Delete React skill"). Wrap visual ratings in a container with `role="img"` and a descriptive `aria-label`.
