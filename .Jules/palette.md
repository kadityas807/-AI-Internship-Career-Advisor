## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-05-08 - Enhancing Global Components for Keyboard and Screen Reader Accessibility
**Learning:** Global floating widgets like chatbots often lack standard accessibility features like 'Escape' key closure and descriptive ARIA labels for icon-only buttons. Moving route-based conditional returns after hook declarations is also essential for maintaining React Hook rules.
**Action:** Always implement 'Escape' key listeners for overlays and provide ARIA labels for all interactive icons. Ensure all hooks are called before any conditional return in functional components.
