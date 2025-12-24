import { connect } from 'node:tls';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get('host');
  
  if (!host) {
    return NextResponse.json({ error: 'Host is required' }, { status: 400 });
  }

  // Basic cleaning of host (remove protocol if present)
  const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0];

  return new Promise((resolve) => {
    try {
      const socket = connect(443, cleanHost, { servername: cleanHost, rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate(true); // true = detailed
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();
        socket.end();

        resolve(NextResponse.json({
          subject: cert.subject,
          issuer: cert.issuer,
          valid_from: cert.valid_from,
          valid_to: cert.valid_to,
          days_remaining: cert.valid_to ? Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
          serialNumber: cert.serialNumber,
          fingerprint: cert.fingerprint,
          cipher: `${cipher.name} (${cipher.version})`,
          protocol: protocol
        }));
      });

      socket.on('error', (err) => {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      });

      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve(NextResponse.json({ error: 'Connection timed out' }, { status: 504 }));
      });
    } catch (e: any) {
        resolve(NextResponse.json({ error: e.message }, { status: 500 }));
    }
  });
}
