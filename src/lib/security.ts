export function isSafeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);

    // 1. Protocol check
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    const hostname = url.hostname;

    // 2. Block Localhost explicitly
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return false;
    }

    // 3. IPv4 Checks (Robust Parsing)
    // Attempt to parse as IPv4. If successful, check if private.
    const ipv4 = parseIPv4(hostname);
    if (ipv4 !== null) {
      if (isPrivateIPv4(ipv4)) return false;
    }

    // 4. IPv6 Checks
    // Basic checks for IPv6 loopback and private ranges
    // URL.hostname for IPv6 is enclosed in brackets like [::1] usually, but let's handle both
    const cleanIPv6 = hostname.replace(/^\[|\]$/g, '');

    // Loopback
    if (cleanIPv6 === '::1') return false;
    // Unspecified
    if (cleanIPv6 === '::') return false;
    // Unique Local (fc00::/7) - fc or fd
    if (/^[fF][cCdD]/.test(cleanIPv6)) return false;
    // Link Local (fe80::/10)
    if (/^[fF][eE][89abAB]/.test(cleanIPv6)) return false;
    // IPv4-mapped IPv6 (::ffff:127.0.0.1)
    if (cleanIPv6.toLowerCase().startsWith('::ffff:')) {
        // Extract the last part
        const parts = cleanIPv6.split(':');
        const lastPart = parts[parts.length - 1];
        // If it looks like IPv4, check it
        const mappedIp = parseIPv4(lastPart);
        if (mappedIp !== null && isPrivateIPv4(mappedIp)) return false;
    }

    return true;
  } catch {
    return false; // Invalid URL
  }
}

// Parses an IPv4 hostname (decimal, octal, hex, dotted) into a 32-bit unsigned integer.
// Returns null if it's not a valid IPv4 format.
function parseIPv4(hostname: string): number | null {
  // If it contains characters not allowed in IP representations (digits, dots, x, a-f)
  // strict check is hard because domains can have these too.
  // But generally, if it parses as IP, we treat it as IP.

  const parts = hostname.split('.');
  if (parts.length > 4) return null;

  // Basic character check: strictly allow only hex/octal/decimal chars
  if (!/^[\d\.a-fA-FxX]+$/.test(hostname)) return null;

  const values: number[] = [];
  try {
    for (const part of parts) {
      if (!part) return null; // Empty part
      let val: number;
      if (part.startsWith('0x') || part.startsWith('0X')) {
        val = parseInt(part, 16);
      } else if (part.startsWith('0') && part.length > 1) {
        val = parseInt(part, 8); // Octal
      } else {
        val = parseInt(part, 10);
      }
      if (isNaN(val)) return null;
      values.push(val);
    }
  } catch {
    return null;
  }

  // Validate part values
  // Only the last part can be > 255 (if it covers multiple bytes)
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] > 255) return null;
  }
  // The last part must fit in the remaining bytes
  const remainingBytes = 4 - (values.length - 1); // 1 to 4
  const maxLastPart = Math.pow(2, remainingBytes * 8) - 1;
  if (values[values.length - 1] > maxLastPart) return null;

  // Calculate 32-bit integer
  let ip = 0;
  // Process all but last part
  for (let i = 0; i < values.length - 1; i++) {
    // values[i] is at byte position (3 - i) from right (0-indexed)
    // i=0 (1st part) -> shift 24 (3 bytes)
    // i=1 (2nd part) -> shift 16 (2 bytes)
    ip += values[i] * Math.pow(256, 3 - i);
  }
  // Add last part
  ip += values[values.length - 1];

  return ip >>> 0;
}

function isPrivateIPv4(ip: number): boolean {
  const ipLong = ip;

  // 0.0.0.0/8
  if ((ipLong >>> 24) === 0) return true;

  // 10.0.0.0/8
  if ((ipLong >>> 24) === 10) return true;

  // 127.0.0.0/8
  if ((ipLong >>> 24) === 127) return true;

  // 169.254.0.0/16
  if ((ipLong >>> 16) === 0xA9FE) return true; // 169.254

  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if ((ipLong >>> 24) === 172) {
    const second = (ipLong >>> 16) & 0xFF;
    if (second >= 16 && second <= 31) return true;
  }

  // 192.168.0.0/16
  if ((ipLong >>> 16) === 0xC0A8) return true; // 192.168

  // 255.255.255.255
  if (ipLong === 0xFFFFFFFF) return true;

  return false;
}
