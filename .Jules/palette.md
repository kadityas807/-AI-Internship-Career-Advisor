## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - React Hooks Compliance in Global Components

**Learning:** Placing route-based conditional returns (e.g., `if (pathname === '/mentor') return null;`) before hook declarations in global components like `GlobalChatbot.tsx` violates the "Rules of Hooks" and can cause runtime errors during navigation.

**Action:** Always declare all React Hooks (useState, useEffect, useRef, etc.) at the top level of the component and place any conditional early returns immediately before the JSX `return` statement.
