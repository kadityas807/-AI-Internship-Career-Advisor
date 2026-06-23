## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Action Button Visibility and Contextual Confirmations
**Learning:** Action buttons hidden behind hover states (using `group-hover:opacity-100`) are inaccessible to keyboard users unless `group-focus-within:opacity-100` is also used. Additionally, generic confirmation dialogs like "Are you sure?" are less helpful than contextual ones that name the item being deleted.
**Action:** Always pair hover-based visibility with `group-focus-within` to support keyboard navigation. When implementing `window.confirm`, include specific item details (e.g., company name or profile type) to provide clear context for the destructive action.
