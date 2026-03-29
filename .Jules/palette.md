## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Global Chatbot Accessibility and Hook Integrity

**Learning:** Conditionally returning `null` in a React component before all `useEffect` hooks are declared causes `rules-of-hooks` violations. Additionally, transient UI elements like floating widgets require `Escape` key listeners and descriptive `aria-label` attributes to meet basic keyboard and screen reader accessibility standards.

**Action:** Ensure all React hooks (useState, useEffect, etc.) are declared at the top level of the component before any conditional returns. Implement `Escape` key listeners for modal-like components and provide `aria-label` for all icon-only interactive elements.
