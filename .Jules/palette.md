## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Cognitive Load and Friction in Multi-step Onboarding

**Learning:** Onboarding flows without progress indicators or auto-focusing inputs increase user anxiety and interaction friction. Users feel more oriented when they see "Step X of Y" and can proceed using the keyboard (Enter key) without manually clicking "Next".

**Action:** For multi-step wizards, always include a visual progress bar and step counter. Use React `useRef` and `useEffect` to auto-focus the primary input on each step (with a slight delay for entry animations) and wrap fields in `<form>` elements to enable keyboard-driven navigation, while respecting `textarea` new-line behavior.
