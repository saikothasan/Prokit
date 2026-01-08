# Sentinel's Journal

## 2024-05-22 - SSRF Vulnerability in CURL Proxy
**Vulnerability:** The `/api/curl` endpoint allowed arbitrary URLs to be fetched, exposing the server to Server-Side Request Forgery (SSRF). Attackers could probe internal networks or loopback interfaces.
**Learning:** Custom regex-based IP validation is brittle and often fails against obscured IP formats (hex, octal, etc.). Always use established libraries like `ipaddr.js` for IP parsing and range checking.
**Prevention:** Implement strict input validation on all proxy-like endpoints using robust libraries. Deny by default.
