import ipaddr from 'ipaddr.js';

/**
 * Security utility functions to protect against common vulnerabilities.
 */

/**
 * Validates a URL to prevent Server-Side Request Forgery (SSRF).
 * Uses ipaddr.js for robust IP parsing and range checking.
 *
 * @param urlString The URL to validate
 * @returns Object containing valid status and error message if invalid
 */
export function validateUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    // 1. Check Protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' };
    }

    // 2. Resolve Hostname
    // URL parser handles hex/octal/etc automatically for IPv4 if they are valid,
    // but sometimes it leaves them as strings. ipaddr.js is stricter.
    let hostname = url.hostname;

    // Normalize hostname
    // Remove trailing dot if present (DNS root)
    if (hostname.endsWith('.')) {
      hostname = hostname.slice(0, -1);
    }

    // Check for explicit localhost
    if (hostname === 'localhost' || hostname.endsWith('.local')) {
      return { valid: false, error: 'Access to local resources is denied.' };
    }

    // Remove brackets from IPv6 for ipaddr.js parsing
    let cleanHostname = hostname;
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      cleanHostname = hostname.slice(1, -1);
    }

    // Try to parse as IP
    if (ipaddr.isValid(cleanHostname)) {
      const addr = ipaddr.parse(cleanHostname);
      const range = addr.range();

      // Block Private Ranges
      if (['private', 'loopback', 'linkLocal', 'uniqueLocal', 'unspecified', 'carrierGradeNat'].includes(range)) {
         return { valid: false, error: 'Access to private network addresses is denied.' };
      }

      // Additional check for IPv4 mapped IPv6
      if (addr.kind() === 'ipv6') {
        if ((addr as ipaddr.IPv6).isIPv4MappedAddress()) {
           const ipv4 = (addr as ipaddr.IPv6).toIPv4Address();
           const rangeTv4 = ipv4.range();
           if (['private', 'loopback', 'linkLocal', 'carrierGradeNat'].includes(rangeTv4)) {
             return { valid: false, error: 'Access to private network addresses is denied.' };
           }
        }
      }
    } else {
        // Domain name or non-standard IP format check

        // Block suspicious "IP-like" hostnames that ipaddr.js considers invalid but browsers/fetch might resolve
        // e.g. "127.1" (short IPv4), "0177.0.0.1" (octal), "0x7f.0.0.1" (hex)
        // If it starts with a digit and contains only digits, dots, or 'x' (for hex), it's suspicious.
        // A real domain like '1.1.1.1.domain.com' is fine, but '127.1' is risky.
        // Simple heuristic: if it looks entirely like a numeric/hex pattern and isn't a valid standard IP, reject it.
        if (/^[\d.x]+$/.test(cleanHostname)) {
             return { valid: false, error: 'Access to potential non-standard IP addresses is denied.' };
        }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }
}
