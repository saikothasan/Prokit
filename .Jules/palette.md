## 2024-05-22 - Missing Form Wrappers
**Learning:** Several interactive tools (like BinChecker) use inputs and buttons without a surrounding `<form>` tag. This prevents "Enter" key submission and degrades keyboard accessibility.
**Action:** Always wrap input/button groups in a `<form>` with an `onSubmit` handler, even for client-side only interactions.
