## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Micro-UX and Accessibility in Global Chat Widget

**Learning:** Floating transient components like chatbots require explicit keyboard exit paths (Escape key) and proactive focus management. Auto-focusing inputs during entry animations (e.g., motion.div) can fail if executed too early; a short delay (300ms) ensures the element is ready to receive focus, significantly smoothing the "Open and Type" flow.

**Action:** Implement 'Escape' key listeners and auto-focus with a 300ms delay for all transient UI overlays to enhance keyboard accessibility and interaction speed.
