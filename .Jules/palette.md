## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhanced Global Chatbot Accessibility and Interaction
**Learning:** Programmatic focus management and keyboard listeners (like the 'Escape' key) significantly improve the "feel" and accessibility of floating UI widgets. When using 'motion/react' for entry animations, a small delay (300ms) is necessary before calling '.focus()' to ensure the element is interactable.
**Action:** Always implement 'Escape' to close for transient overlays and ensure primary inputs are auto-focused upon opening using a slight delay for animated components.
