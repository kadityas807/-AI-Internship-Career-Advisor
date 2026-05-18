## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-22 - Global Chatbot Accessibility and Hooks Compliance
**Learning:** Refactored the floating chatbot to resolve 'Rules of Hooks' violations and improved accessibility with ARIA labels, keyboard support (Escape to close), and programmatic focus management. Using `motion/react` instead of `framer-motion` is necessary to avoid module resolution errors during Next.js 15 builds in this repository.
**Action:** Always separate route-based conditional returns into a container component to ensure implementation hooks execute in a consistent order. Use a 400ms `setTimeout` for focusing inputs within animated containers to ensure the element is interactable after entry.
