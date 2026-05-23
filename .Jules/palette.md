## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Micro-UX and Accessibility in Global Chatbot

**Learning:** When implementing global widgets like a chatbot that should be excluded on certain routes, refactoring into a wrapper component and an implementation component avoids "Rules of Hooks" violations and ensures accessibility features (ARIA labels, auto-focus, keyboard listeners) can be safely implemented using standard React Hooks.

**Action:** For route-based component exclusion, always use a wrapper for the conditional check and move all Hook logic into a child implementation component. Ensure interactive elements have ARIA labels and support keyboard navigation (e.g., Escape to close).
