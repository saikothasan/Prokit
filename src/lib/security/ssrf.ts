
import { isIP } from 'node:net';

/**
 * Validates if a URL is safe for Server-Side Request Forgery (SSRF) protection.
 * Blocks:
 * - Non-HTTP/HTTPS protocols
 * - Localhost and .local domains
 * - Private IPv4 and IPv6 ranges
 * - Non-standard IP formats (e.g., short-hand, hex, octal) to prevent bypasses
 */
export function isSafeUrl(url: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(url);

    // 1. Check Protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { safe: false, reason: 'Invalid protocol. Only http and https allowed.' };
    }

    // 2. Check Hostname for 'localhost'
    // URL.hostname is always lowercased by the URL parser
    let hostname = parsed.hostname;

    // Remove brackets from IPv6 if present (URL parser usually does this, but good to be safe)
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      hostname = hostname.slice(1, -1);
    }

    if (hostname === 'localhost' || hostname.endsWith('.local')) {
      return { safe: false, reason: 'Access to localhost is forbidden.' };
    }

    // 3. Check for Private IP Addresses
    if (isPotentialIP(hostname)) {
       // If it is a standard IP, check ranges
       if (isIP(hostname) !== 0) {
           if (isPrivateIP(hostname)) {
              return { safe: false, reason: 'Access to private IP addresses is forbidden.' };
           }
       } else {
           // It looks like an IP but isn't standard (e.g. 127.1, 0x7f...).
           // We block ALL non-standard IP formats to be safe (Fail Secure).
           return { safe: false, reason: 'Ambiguous IP format blocked.' };
       }
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid URL format.' };
  }
}

// Heuristic to check if a hostname is likely an IP address
function isPotentialIP(hostname: string): boolean {
    if (isIP(hostname) !== 0) return true; // Standard IP check

    // Check for Integer/Hex/Octal formats (IPv4 obfuscation)
    if (/^[\d\.x]+$/.test(hostname)) return true;

    return false;
}

function isPrivateIP(hostname: string): boolean {
  const ipType = isIP(hostname);

  if (ipType === 4) {
      return isPrivateIPv4(hostname);
  }

  if (ipType === 6) {
      return isPrivateIPv6(hostname);
  }

  return false;
}

function isPrivateIPv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 127) return true; // Loopback
    if (parts[0] === 10) return true; // Private
    if (parts[0] === 192 && parts[1] === 168) return true; // Private
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // Private
    if (parts[0] === 169 && parts[1] === 254) return true; // Link-local
    if (parts[0] === 0) return true; // Current network
    return false;
}

function isPrivateIPv6(ip: string): boolean {
    const normalized = ip.toLowerCase();

    if (normalized === '::1') return true;
    if (normalized === '0:0:0:0:0:0:0:1') return true;

    // fc00::/7 (Unique Local) -> fc.., fd..
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

    // fe80::/10 (Link Local) -> fe8., fe9., fea., feb.
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;

    return false;
}
