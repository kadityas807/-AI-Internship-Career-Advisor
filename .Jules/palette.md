## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Optimizing Interactive Components for Motion and Lint Compliance

**Learning:** When using Next.js 15 with Motion v12, 'motion/react' is the preferred import for build stability. Additionally, route-based state updates (like closing a sidebar) can trigger cascading render lint errors; using `requestAnimationFrame` allows these updates to happen safely in the next frame.

**Action:** Use 'motion/react' for all animation components in this project. When closing navigation overlays via `useEffect` on route change, wrap the state update in `requestAnimationFrame` to maintain performance and satisfy ESLint rules.
