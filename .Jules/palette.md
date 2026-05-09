## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-22 - Proper Hook Ordering for Route-Based Visibility

**Learning:** Placing a route-based conditional return (e.g., `if (pathname === '/mentor') return null`) before Hook declarations in a global component like `GlobalChatbot` violates the "Rules of Hooks" and can cause runtime errors or linting failures when the component re-renders on different routes.

**Action:** Always ensure all Hooks (useState, useEffect, useRef) are called at the top level of the component before any conditional returns. Move route-based visibility logic inside Hooks where necessary or use the condition after all Hooks are defined to maintain a stable Hook call order.
