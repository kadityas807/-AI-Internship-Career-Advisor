## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - React Hook Integrity with Conditional Returns

**Learning:** Implementing early returns for route-based component visibility (e.g., `if (pathname === '/mentor') return null`) before declaring all React Hooks violates the 'Rules of Hooks' and causes lint/build failures.

**Action:** Ensure all React Hooks (`useState`, `useEffect`, `useRef`) are called at the top level of the component before any conditional logic that might return early from the render function.
