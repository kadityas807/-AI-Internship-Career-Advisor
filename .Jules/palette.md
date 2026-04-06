## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-04-06 - Purity and Performance in Dynamic Components

**Learning:** Using impure functions like `Date.now()` during render or triggering state updates in `useEffect` based on route changes (like closing a sidebar) can cause hydration mismatches or expensive cascading renders.

**Action:** Stabilize dynamic values using `useState` initializers (e.g., `const [now] = useState(() => Date.now())`). For navigation UI like mobile sidebars, prefer closing the menu directly in the `Link` component's `onClick` handler rather than a global `useEffect` to ensure immediate and stable state transitions.
