## 2025-05-22 - Accessibility and Keyboard Navigation in Application Tracker

**Learning:** Form inputs and icon-only buttons in the application tracking interface were missing programmatic associations (label `htmlFor` to input `id`) and explicit focus states, hindering screen reader and keyboard-only users.

**Action:** Always ensure every form input has a unique `id` linked to its `<label>` via `htmlFor`. For icon-only buttons, consistently provide a descriptive `aria-label` and clear `focus-visible:ring` styles to support accessible interactions.

## 2026-06-29 - Comprehensive UX and Accessibility Audit of Skills Ledger

**Learning:** Combining safety confirmations (`window.confirm`), ARIA labels for icon buttons, keyboard-triggered visibility (`group-focus-within`), and semantic star rating groups (`role="img"` with dynamic `aria-label`) provides a significantly more robust and inclusive user experience for data-heavy management pages.

**Action:** Implement this "accessibility bundle" (Safety + ARIA + Keyboard visibility + Semantic groups) as a standard pattern when building or refactoring management interfaces for projects, applications, or skills.
