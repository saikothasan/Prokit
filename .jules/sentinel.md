# Sentinel's Journal

## 2026-01-07 - SSRF Vulnerability in CURL Tool
**Vulnerability:** The `/api/curl` endpoint allowed arbitrary URL fetching, exposing the server to Server-Side Request Forgery (SSRF). Attackers could scan local network ports or access cloud metadata services.
**Learning:** General-purpose proxy endpoints are inherently risky.
**Prevention:** Always validate user-supplied URLs against a whitelist of protocols and block private/local IP ranges. Use a "fail-secure" approach for ambiguous IP formats.
