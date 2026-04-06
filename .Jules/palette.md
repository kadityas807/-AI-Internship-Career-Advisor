## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Keyboard Accessibility and Focus Management in Floating Components

**Learning:** Transient UI components like the floating chatbot lacked keyboard navigation support (Escape key to close) and did not automatically focus primary inputs upon opening, creating friction for keyboard and screen reader users. Additionally, auto-focusing elements during entry animations requires a slight delay (e.g., 300ms) to ensure the DOM is ready to receive focus.

**Action:** Implement 'Escape' key listeners for all transient UI overlays. For components with entry animations, use a `setTimeout` within a `useEffect` to manage programmatic focus on the primary input.
