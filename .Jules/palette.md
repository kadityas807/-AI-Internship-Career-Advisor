## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Chatbot Focus Management and ARIA Live Regions

**Learning:** Global floating components like chatbots often suffer from "focus loss" where a keyboard user opens the widget but focus remains on the triggering button. Additionally, new messages may not be announced if the container lacks proper ARIA live roles.

**Action:** Implement  focus management (400ms for animations) on widget mount/open. Use  and  for message containers to ensure sequential announcements of new content. Always include a global  key listener for closing modal-like floating widgets.

## 2025-05-23 - Chatbot Focus Management and ARIA Live Regions

**Learning:** Global floating components like chatbots often suffer from "focus loss" where a keyboard user opens the widget but focus remains on the triggering button. Additionally, new messages may not be announced if the container lacks proper ARIA live roles.

**Action:** Implement focus management (400ms for animations) on widget mount/open. Use `role="log"` and `aria-live="polite"` for message containers to ensure sequential announcements of new content. Always include a global `Escape` key listener for closing modal-like floating widgets.
