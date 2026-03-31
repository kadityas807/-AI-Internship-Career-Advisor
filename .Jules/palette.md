## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - React Hook Integrity and Component UX Polished

**Learning:** Placing conditional returns (e.g., `if (pathname === '/mentor') return null;`) before React Hooks violates the 'rules-of-hooks' and can cause runtime instability. Additionally, complex interactive widgets like floating chatbots require explicit keyboard listeners (`Escape` key) and auto-focus logic to meet modern accessibility and UX standards.

**Action:** Always declare all Hooks at the top level of a component before any conditional logic. For transient UI components, implement 'Escape' key listeners and use `useRef` with a short delay (e.g., 300ms) to auto-focus primary inputs upon opening.
