## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Holistic Accessibility pass for Global Chatbot and Modals

**Learning:** Interactive elements hidden until hover (like application action buttons) are unreachable for keyboard users unless explicitly handled with 'group-focus-within'. Additionally, standard UI patterns like closing modals with 'Escape' or auto-focusing inputs in newly opened containers significantly reduce cognitive load and improve the flow for assistive technology.

**Action:** Consistently use 'group-focus-within' for hover-revealed actions. Always implement 'Escape' key listeners for global overlays and manage focus programmatically (with appropriate timing for animations) when transitioning user context.
