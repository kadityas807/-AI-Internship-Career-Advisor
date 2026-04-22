## 2025-05-15 - React Hook Integrity in Global Components
**Learning:** Placing conditional returns (e.g., route-based visibility) before hook declarations (useEffect, useRef) violates React's Rules of Hooks and causes inconsistent render cycles. In global components like 'GlobalChatbot', visibility logic must follow all hook initializations.
**Action:** Always ensure all Hooks are called at the top level of the component before any conditional early returns.
