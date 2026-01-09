# Sentinel's Journal

## 2025-01-09 - SSRF Protection in Proxy Endpoint
**Vulnerability:** The `/api/curl` endpoint allowed arbitrary URL fetching, exposing the application to Server-Side Request Forgery (SSRF) attacks against local or private network resources.
**Learning:** Cloudflare Workers `fetch` API is powerful but requires strict validation when processing user-supplied URLs. Standard URL parsing can help, but explicit blocklists for local/private IPs are necessary.
**Prevention:** Implemented `isSafeUrl` utility to block non-HTTP protocols, localhost, and private IP ranges. This utility should be reused for any future URL-fetching features.
