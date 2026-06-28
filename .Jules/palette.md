## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-24 - Interactive Card Accessibility and Destructive Action Safety
**Learning:** Elements that reveal action buttons only on hover (using `group-hover`) are inaccessible to keyboard users unless `group-focus-within` is also used. Additionally, destructive actions like 'Delete' should always have a contextual confirmation to prevent data loss.
**Action:** Use `group-focus-within:opacity-100` alongside `group-hover` for hidden controls. Implement `window.confirm` with the item's name in deletion handlers to provide clear, accessible warnings.
