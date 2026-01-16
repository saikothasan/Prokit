import { isSafeUrl } from './security';

const testCases = [
  // Safe URLs
  { url: 'https://google.com', expected: true },
  { url: 'http://example.com/foo', expected: true },
  { url: 'https://1.1.1.1', expected: true }, // Cloudflare public DNS
  { url: 'https://8.8.8.8', expected: true }, // Google public DNS

  // Unsafe URLs (Localhost)
  { url: 'http://localhost', expected: false },
  { url: 'https://localhost:3000', expected: false },
  { url: 'http://sub.localhost', expected: false },

  // Unsafe URLs (Standard Private IPv4)
  { url: 'http://127.0.0.1', expected: false },
  { url: 'http://127.0.0.99', expected: false },
  { url: 'http://10.0.0.1', expected: false },
  { url: 'http://192.168.1.1', expected: false },
  { url: 'http://172.16.0.1', expected: false },
  { url: 'http://169.254.169.254', expected: false },
  { url: 'http://0.0.0.0', expected: false },

  // Bypass Attempts (Obscure Formats)
  { url: 'http://127.1', expected: false },             // 127.0.0.1
  { url: 'http://0x7f000001', expected: false },        // 127.0.0.1 (Hex)
  { url: 'http://0x7f.0.0.1', expected: false },        // 127.0.0.1 (Mixed Hex)
  { url: 'http://0177.0.0.1', expected: false },        // 127.0.0.1 (Octal)
  { url: 'http://2130706433', expected: false },        // 127.0.0.1 (Decimal)
  { url: 'http://012.0.0.1', expected: false },         // 10.0.0.1 (Octal)
  { url: 'http://0xA.0.0.1', expected: false },         // 10.0.0.1 (Hex)

  // IPv6
  { url: 'http://[::1]', expected: false },
  { url: 'http://[::ffff:127.0.0.1]', expected: false }, // Mapped IPv4
  { url: 'http://[fc00::1]', expected: false },
  { url: 'http://[fe80::1]', expected: false },

  // Edge cases (Private IPv4 but outside range)
  { url: 'http://172.15.0.1', expected: true },
  { url: 'http://172.32.0.1', expected: true },

  // Invalid Protocols
  { url: 'ftp://example.com', expected: false },
  { url: 'file:///etc/passwd', expected: false },
  { url: 'javascript:alert(1)', expected: false },
];

let passed = 0;
let failed = 0;

console.log('Running security tests...\n');

testCases.forEach(({ url, expected }) => {
  const result = isSafeUrl(url);
  if (result === expected) {
    passed++;
    console.log(`✅ PASS: ${url} -> ${result}`);
  } else {
    failed++;
    console.error(`❌ FAIL: ${url} -> Expected ${expected}, got ${result}`);
  }
});

console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);
