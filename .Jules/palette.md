## 2024-05-23 - Accessibility in Async Forms
**Learning:** Async forms often fail to announce errors to screen readers because the error message appears dynamically without `aria-live` regions or focus management.
**Action:** Always wrap error containers in `role="alert"` or `aria-live="assertive"` and link inputs to errors using `aria-describedby` so users know *which* field failed and *why*.
