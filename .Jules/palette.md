## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhancing GlobalChatbot with Accessibility and Rules of Hooks

**Learning:** Global UI widgets often lack essential accessibility cues (like ARIA labels for icon-only buttons) and keyboard shortcuts (like Escape to close). Additionally, placing conditional early returns before hooks in React components can lead to "Rules of Hooks" violations and state inconsistencies across route transitions.

**Action:** Consistently add ARIA labels to interactive elements and implement keyboard listeners for common dismiss actions. Ensure all React hooks are declared before any conditional return statements to maintain a stable hook execution order and preserve internal state during route-based UI changes.
