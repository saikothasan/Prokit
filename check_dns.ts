import dns from 'node:dns';

try {
  dns.lookup('google.com', (err, address, family) => {
    if (err) {
      console.error('DNS Lookup failed:', err);
    } else {
      console.log('DNS Lookup success:', address, family);
    }
  });
} catch (e) {
  console.error('DNS module error:', e);
}
