## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhancing Transient UI Accessibility and Delight

**Learning:** Auto-focusing inputs within animated components (e.g., `motion.div`) requires a slight delay (~300-400ms) to ensure the element is interactive upon render. Furthermore, adding an `Escape` key listener and descriptive `aria-label` attributes for icon-only buttons is critical for providing a seamless experience for keyboard and screen-reader users in floating widgets.

**Action:** Implement auto-focus with a short timeout in animated components and always provide a keyboard-based close mechanism for transient UI.
