## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Focus Management and Keyboard Shortcuts in Global Components

**Learning:** Floating or transient UI components like a global chatbot benefit significantly from auto-focusing their primary input upon opening and providing an "Escape" key shortcut to close. This creates a more "app-like" and accessible experience. Additionally, using a short delay (e.g., 400ms) for auto-focus ensures the element is ready after entry animations.

**Action:** Implement `Escape` key listeners for all transient/modal-like UI and use `useEffect` with a `ref` and a small delay to focus primary inputs when these components become visible.
