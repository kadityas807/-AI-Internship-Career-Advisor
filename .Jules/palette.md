## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Architectural Patterns for Route-Based UX Components

**Learning:** Implementing global UI components (like chatbots) that need to be excluded on specific routes can lead to "Rules of Hooks" violations if early returns are used before Hook declarations. Additionally, transient UI elements often lack intuitive keyboard-based closing mechanisms.

**Action:** Refactor route-conditional components into a wrapper (for the route check) and a child implementation (for state/Hooks). Always include an `Escape` key listener for modal-like widgets to provide a consistent keyboard-friendly closing interaction.
