## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhanced GlobalChatbot Accessibility and UX

**Learning:** Global UI components like chatbots benefit significantly from three small touches: programmatic focus management (auto-focusing the input after a 400ms delay to wait for entry animations), an 'Escape' key listener for quick keyboard dismissal, and a container/implementation refactor to avoid Hook violations when the component is conditionally excluded from certain routes.

**Action:** Use the container/implementation pattern for route-based conditional rendering. Always include 'Escape' listeners and timed auto-focus for transient interactive widgets.
