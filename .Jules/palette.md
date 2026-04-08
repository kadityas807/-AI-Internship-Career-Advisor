## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-04-08 - Widget Focus Management and Modal Keyboard Listeners

**Learning:** Floating widgets and modals that lack an 'Escape' key listener and immediate focus trapping create a fragmented experience for keyboard-only users. Using a short delay (e.g. 400ms) within a `useEffect` for auto-focusing elements inside entry animations ensures the input is ready to receive focus after the animation completes.

**Action:** Implement `Escape` key listeners for all transient UI elements and use a timed `ref.current?.focus()` pattern for inputs inside animated entry components to enhance accessibility and interaction flow.
