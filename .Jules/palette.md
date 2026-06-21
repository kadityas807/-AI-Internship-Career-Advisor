## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhanced safety and keyboard visibility for action buttons

**Learning:** Action buttons (like Edit/Delete) that are only visible on hover (e.g., using `group-hover:opacity-100`) are inaccessible to keyboard users unless explicitly handled. Destructive actions without confirmation pose a significant UX risk for data loss.

**Action:** Use `group-focus-within:opacity-100` and `group-focus-within:translate-y-0` (combined with a base `opacity-0 translate-y-2`) to ensure buttons become visible when a user tabs into the container. Always implement a `window.confirm()` dialog for deletions, including the item's name for clarity.
