## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhancing Conversational UI Accessibility

**Learning:** Global floating widgets like chatbots often suffer from poor discoverability for screen readers and lack keyboard-centric shortcuts. Implementing auto-focus for the primary input upon opening and adding an 'Escape' key listener significantly improves the efficiency of interaction for power users and those relying on assistive technologies.

**Action:** For all transient or overlay components (modals, chatbots, sidebars), implement an 'Escape' key listener to close and use `useRef` to auto-focus the primary interactive element after a brief delay to account for entry animations.
