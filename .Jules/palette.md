## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-03-28 - Animation-Aware Auto-Focus and Hook Safety in Chat Widgets

**Learning:** Auto-focusing inputs within components that use entry animations (like `AnimatePresence`) often fails if triggered immediately on mount, as the element may not be fully interactive or visible. Additionally, placing conditional early returns before hook declarations violates React's "Rules of Hooks" and can lead to runtime instability.

**Action:** When implementing auto-focus for animated UI elements, use a short `useEffect` timeout (e.g., 300ms) to ensure the animation is sufficiently progressed. Always declare all React Hooks (useState, useEffect, useRef) before any conditional returns in a component to maintain a consistent hook call order.
