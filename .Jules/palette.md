## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-13 - Enhancing Action Visibility and Data Safety

**Learning:** Buttons hidden on hover (e.g., `group-hover:opacity-100`) are inaccessible to keyboard users unless they also respond to focus. Additionally, destructive actions without confirmation lead to poor UX and accidental data loss.

**Action:** Use `group-focus-within:opacity-100` alongside hover states to ensure action buttons are visible when tabbing through containers. Always implement `window.confirm()` for delete actions to provide a safety net for users.
