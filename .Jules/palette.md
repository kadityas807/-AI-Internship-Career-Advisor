## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2025-05-23 - Synchronizing Focus with Entry Animations

**Learning:** Programmatic focus (e.g., `input.focus()`) fails if triggered while an element is still being rendered or animated into view by libraries like `motion`. A short delay (approx. 400ms) is necessary to ensure the DOM is ready to receive focus after a transition.

**Action:** When auto-focusing elements inside animated containers (like modals or drawers), use a `useEffect` with a `setTimeout` to match the animation duration, ensuring a smooth transition for keyboard users.
