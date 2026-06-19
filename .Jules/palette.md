## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Hover-Only Actions and Keyboard Visibility

**Learning:** Interactive elements that only appear on hover (using `opacity-0 group-hover:opacity-100`) are inaccessible to keyboard users as they remain invisible even when focused.

**Action:** Use `group-focus-within:opacity-100` alongside `group-hover:opacity-100` to ensure action containers become visible when any internal element receives focus via keyboard navigation.
