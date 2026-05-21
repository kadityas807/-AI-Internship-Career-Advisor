## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Keyboard Accessibility and Focus Management in Global Chatbot

**Learning:** Interactive widgets like floating chatbots must support the 'Escape' key for closing and provide programmatic focus to the primary input when opened to ensure a seamless experience for keyboard and screen reader users. Delaying focus (e.g., 400ms) allows entry animations to complete, preventing focus loss or jarring transitions.

**Action:** Implement `Escape` key listeners for all transient UI components. Use `useRef` and `useEffect` with a slight `setTimeout` to manage focus transitions during animations.
