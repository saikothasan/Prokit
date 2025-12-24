import { connect } from 'node:tls';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get('host');
  
  if (!host) {
    return NextResponse.json({ error: 'Host is required' }, { status: 400 });
  }

  const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0];

  return new Promise<NextResponse>((resolve) => {
    try {
      const timeoutId = setTimeout(() => {
        resolve(NextResponse.json({ error: 'Connection timed out' }, { status: 504 }));
      }, 5000);

      const socket = connect(443, cleanHost, { servername: cleanHost, rejectUnauthorized: false }, () => {
        clearTimeout(timeoutId);
        
        const cert = socket.getPeerCertificate(true);
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();
        socket.end();

        const validTo = cert.valid_to ? new Date(cert.valid_to).getTime() : 0;
        const daysRemaining = validTo ? Math.floor((validTo - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

        resolve(NextResponse.json({
          subject: cert.subject,
          issuer: cert.issuer,
          valid_from: cert.valid_from,
          valid_to: cert.valid_to,
          days_remaining: daysRemaining,
          serialNumber: cert.serialNumber,
          fingerprint: cert.fingerprint,
          cipher: cipher ? `${cipher.name} (${cipher.version})` : 'Unknown',
          protocol: protocol
        }));
      });

      socket.on('error', (err) => {
        clearTimeout(timeoutId);
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'An error occurred';
        resolve(NextResponse.json({ error: message }, { status: 500 }));
    }
  });
}
