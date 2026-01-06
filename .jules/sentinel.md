# Sentinel's Journal

## 2024-05-22 - [Example Entry]
**Vulnerability:** Found hardcoded JWT secret in `src/utils/auth.ts`.
**Learning:** Developers often hardcode secrets during initial prototyping and forget to move them to env vars.
**Prevention:** Add a pre-commit hook to scan for high-entropy strings or potential secrets.
