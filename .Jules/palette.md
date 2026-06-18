## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Global Chatbot Accessibility and Keyboard UX

**Learning:** Floating transient UI components like chatbots must support standard keyboard patterns, such as the `Escape` key to close and automatic focus management on open, to ensure they don't become keyboard traps or create extra tab stops for users.

**Action:** Implement `Escape` key listeners and programmatic focus (`ref.focus()`) with a slight delay (to account for animations) when opening modals or floating widgets. Ensure all icon-only controls have clear `aria-label` and `focus-visible` styles.
