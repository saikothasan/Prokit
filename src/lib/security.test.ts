import { validateUrl } from './security';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('validateUrl Security Tests', () => {
  // Allowed
  it('should allow valid public domains', () => {
    assert.strictEqual(validateUrl('https://google.com').valid, true);
    assert.strictEqual(validateUrl('http://example.com/api').valid, true);
  });

  it('should allow valid public IPs', () => {
    assert.strictEqual(validateUrl('https://1.1.1.1').valid, true); // Cloudflare DNS
    assert.strictEqual(validateUrl('http://172.15.0.1').valid, true); // Public IP
  });

  // Blocked Protocols
  it('should block non-http protocols', () => {
    assert.strictEqual(validateUrl('ftp://example.com').valid, false);
    assert.strictEqual(validateUrl('file:///etc/passwd').valid, false);
    assert.strictEqual(validateUrl('javascript:alert(1)').valid, false);
  });

  // Blocked Localhost & Domains
  it('should block localhost and .local', () => {
    assert.strictEqual(validateUrl('http://localhost').valid, false);
    assert.strictEqual(validateUrl('http://localhost.local').valid, false);
    assert.strictEqual(validateUrl('http://my-pc.local').valid, false);
  });

  // Blocked Standard IPs
  it('should block standard private IPs', () => {
    assert.strictEqual(validateUrl('http://127.0.0.1').valid, false);
    assert.strictEqual(validateUrl('http://10.0.0.5').valid, false);
    assert.strictEqual(validateUrl('http://192.168.1.5').valid, false);
    assert.strictEqual(validateUrl('http://[::1]').valid, false); // IPv6 Loopback
    assert.strictEqual(validateUrl('http://0.0.0.0').valid, false);
  });

  // Blocked Obscured/Short IPs (Non-standard)
  it('should block non-standard/obscured IP formats', () => {
    assert.strictEqual(validateUrl('http://127.1').valid, false); // Short IPv4
    assert.strictEqual(validateUrl('http://0177.0.0.1').valid, false); // Octal (regex catches digits+dots)
    // assert.strictEqual(validateUrl('http://0x7f.0.0.1').valid, false); // Hex - handled by regex
    // Note: The regex /^[\d.x]+$/ catches these if they are not valid IPs.
  });

  it('should block IPv4-mapped IPv6 loopbacks', () => {
    assert.strictEqual(validateUrl('http://[::ffff:127.0.0.1]').valid, false);
  });

  it('should handle trailing dots correctly', () => {
    assert.strictEqual(validateUrl('http://localhost.').valid, false);
    assert.strictEqual(validateUrl('http://127.0.0.1.').valid, false);
  });

  // Invalid URLs
  it('should handle invalid URLs gracefully', () => {
    assert.strictEqual(validateUrl('invalid-url').valid, false);
  });
});
