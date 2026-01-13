
import { isIP } from 'node:net';

/**
 * Security utility functions
 */

/**
 * Validates if a URL is safe to fetch (prevents SSRF).
 * Blocks:
 * - Non-HTTP/HTTPS protocols
 * - Localhost and Loopback addresses
 * - Private IP ranges (RFC 1918)
 * - Link-local addresses (RFC 3927)
 * - AWS/Cloud Metadata services
 * - IPv4-mapped IPv6 addresses
 *
 * @param urlStr The URL string to validate
 * @returns true if the URL is considered safe
 */
export function isSafeUrl(urlStr: string): boolean {
    try {
        const url = new URL(urlStr);

        // 1. Protocol Check
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }

        const hostname = url.hostname;

        // 2. Hostname Blocks
        if (hostname === 'localhost') return false;

        // Check if it's an IP address
        const ipType = isIP(hostname.replace('[', '').replace(']', ''));

        if (ipType === 0) {
            // Not an IP address (domain name)
            // Note: This does not prevent DNS rebinding, but blocks explicit IP usage.
            // Domains starting with numbers like "10.com" are safe here.
            return true;
        }

        // 3. IP Address Checks
        // Remove brackets from IPv6 for checking
        const cleanHost = hostname.replace('[', '').replace(']', '');

        // Block 0.0.0.0 (Any)
        if (cleanHost === '0.0.0.0') return false;

        // Basic IPv4 checks
        if (cleanHost.match(/^127\./)) return false; // Loopback
        if (cleanHost.match(/^10\./)) return false; // Private Class A
        if (cleanHost.match(/^192\.168\./)) return false; // Private Class C
        if (cleanHost.match(/^169\.254\./)) return false; // Link-local / Metadata

        // Private Class B (172.16.0.0 - 172.31.255.255)
        const parts = cleanHost.split('.');
        if (parts.length === 4 && parts[0] === '172') {
            const second = parseInt(parts[1], 10);
            if (second >= 16 && second <= 31) {
                return false;
            }
        }

        // Basic IPv6 checks
        if (cleanHost === '::1') return false; // Loopback
        if (cleanHost.match(/^fc00:/) || cleanHost.match(/^fd00:/)) return false; // Unique Local Address
        if (cleanHost.match(/^fe80:/)) return false; // Link-local
        if (cleanHost.match(/^::ffff:/)) return false; // IPv4-mapped IPv6

        return true;
    } catch {
        return false; // Invalid URL parsing
    }
}
