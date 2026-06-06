## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-06 - Global Widget Rules of Hooks and Animation Imports

**Learning:** Implementing conditional early returns in global widgets (like chatbots) to hide them on specific routes can violate the "Rules of Hooks" if the return occurs before other Hook declarations. Additionally, using 'motion/react' in Motion v12 can fail if the package is not explicitly registered in 'package.json'.

**Action:** Always place route-based conditional returns at the very end of the component body, after all Hook declarations. Stick to 'framer-motion' imports unless 'motion/react' is verified as a dependency to ensure build stability.
