## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhancing Interaction Safety and Keyboard Visibility

**Learning:** Destructive actions like deleting items should always have a confirmation step to prevent accidental data loss. Furthermore, actions hidden behind hover states (using Tailwind `group-hover`) are inaccessible to keyboard users unless explicitly handled with `group-focus-within`.

**Action:** Implement `window.confirm()` in deletion handlers. For hover-based actions, add `group-focus-within:opacity-100` and associated transition classes to ensure elements become visible when a child button receives focus via tabbing.
