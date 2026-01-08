# Palette's Journal

## 2024-05-22 - Header Accessibility
**Learning:** Icon-only buttons in the header (mobile menu, social links) are a common pattern that often misses `aria-label`, making navigation impossible for screen readers.
**Action:** Always check `Header` components for icon-only buttons and add descriptive `aria-label`s. Ensure toggle buttons have `aria-expanded` state.
