## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Enhancing Transient UI Components (AI Mentor Chatbot)

**Learning:** Transient UI components like floating chat widgets significantly benefit from keyboard-first interactions. Specifically, implementing an 'Escape' key listener for closing and auto-focusing the primary input upon entry (with a 300ms delay to account for motion animations) creates a "just works" feel for power users. Additionally, moving early return statements below all React hooks is critical to prevent 'react-hooks/rules-of-hooks' errors.

**Action:** For all future modals, drawers, or floating widgets, always include an 'Escape' key handler and auto-focus the most relevant interactive element. Ensure all hooks are declared at the top level of the component, before any conditional logic or early returns.
