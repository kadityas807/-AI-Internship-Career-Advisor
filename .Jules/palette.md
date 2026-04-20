## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-04-20 - Global Chatbot Accessibility and Focus Management

**Learning:** Transient UI components like floating chatbots benefit significantly from "Escape" key listeners for easy dismissal and automatic focus management. However, when using entry animations (like `motion.div`), a short delay (e.g., 400ms) for `ref.current.focus()` ensures the element is ready to receive focus without disrupting the animation.

**Action:** Implement `Escape` key listeners and auto-focus with a tactical delay for all modal/drawer-like components to enhance keyboard-only productivity.
