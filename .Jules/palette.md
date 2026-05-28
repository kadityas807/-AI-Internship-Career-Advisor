## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-05-28 - Hook Safety and Accessibility in Global Components

**Learning:** Global components like `GlobalChatbot` often implemented conditional early returns based on route or state before all Hooks were declared, violating the "Rules of Hooks" and causing linting errors. Additionally, interactive floating widgets were missing basic keyboard navigation (Escape to close) and focus management.

**Action:** Always place conditional returns at the bottom of the component after all Hook declarations. For floating or modal-like components, implement a `setTimeout` (400ms) within a `useEffect` to manage programmatic focus after animations complete, and ensure global keyboard listeners are cleaned up properly.
