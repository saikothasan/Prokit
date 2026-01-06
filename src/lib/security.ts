
// Private IP ranges (IPv4)
const PRIVATE_RANGES = [
  /^127\./,           // 127.0.0.0/8      (Loopback)
  /^10\./,            // 10.0.0.0/8       (Private)
  /^192\.168\./,      // 192.168.0.0/16   (Private)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (Private)
  /^0\./,             // 0.0.0.0/8        (Current network)
  /^169\.254\./,      // 169.254.0.0/16   (Link-local / Cloud metadata)
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./ // 100.64.0.0/10 (Carrier-grade NAT)
];

// IPv6 Private/Local ranges (Simplified)
const IPV6_PRIVATE_RANGES = [
  /^::1$/,             // Loopback
  /^fc00:/,            // Unique Local
  /^fe80:/,            // Link-local
];

export function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    // Basic IPv6 check
    return IPV6_PRIVATE_RANGES.some(regex => regex.test(ip));
  }
  return PRIVATE_RANGES.some(regex => regex.test(ip));
}

export function isSafeUrl(url: string): { safe: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // 1. Check Protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { safe: false, error: 'Only HTTP/HTTPS protocols are allowed.' };
    }

    // 2. Check Hostname
    const hostname = parsed.hostname;

    // Reject localhost explicitly
    if (hostname === 'localhost') {
      return { safe: false, error: 'Localhost access is restricted.' };
    }

    // Check for IP address format
    // Simple regex to check if it looks like an IP
    // Note: URL(..) handles decoding, so we get raw hostname
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      if (isPrivateIp(hostname)) {
        return { safe: false, error: 'Access to private IP addresses is restricted.' };
      }
    }

    if (hostname.startsWith('[') && hostname.endsWith(']')) {
       // IPv6 literal
       const ip = hostname.slice(1, -1);
       if (isPrivateIp(ip)) {
         return { safe: false, error: 'Access to private IP addresses is restricted.' };
       }
    }

    return { safe: true };

  } catch {
    return { safe: false, error: 'Invalid URL format.' };
  }
}
