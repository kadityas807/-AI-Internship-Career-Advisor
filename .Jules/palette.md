## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhancing Floating Chatbot Accessibility and Keyboard Flow
**Learning:** For transient floating components like chatbots, users expect seamless keyboard integration. Auto-focusing the primary input after the entry animation and allowing the component to be closed with the Escape key creates a more "native" and accessible experience.
**Action:** When implementing new overlays or widgets, always include an Escape key listener for closure and manage focus programmatically to guide the user to the most likely next interaction.
