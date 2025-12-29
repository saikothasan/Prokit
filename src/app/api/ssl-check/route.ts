import { connect, TLSSocket } from 'node:tls';
import { NextRequest, NextResponse } from 'next/server';

// Define strict return type for clarity
interface SslCheckResponse {
  isValid: boolean;
  validationError: string | null;
  subject: { CN: string; O?: string; OU?: string };
  issuer: { CN: string; O?: string; C?: string };
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  serialNumber: string;
  fingerprint: string;
  cipher: string;
  protocol: string;
  sans: string[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get('host');

  if (!host) {
    return NextResponse.json({ error: 'Host is required' }, { status: 400 });
  }

  // Robust cleaning: remove protocol, paths, and query params
  // e.g., "https://google.com/search" -> "google.com"
  const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];

  return new Promise<NextResponse>((resolve) => {
    let socket: TLSSocket | null = null;
    let isResolved = false;

    // Safety timeout wrapper
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        if (socket) socket.destroy(); // Crucial: Kill the socket
        resolve(NextResponse.json({ error: 'Connection timed out' }, { status: 504 }));
      }
    }, 5000);

    try {
      const options = {
        servername: cleanHost, // SNI support
        rejectUnauthorized: false, // Allow connection to inspect bad certs
        requestCert: true,
      };

      socket = connect(443, cleanHost, options, () => {
        if (isResolved || !socket) return;
        clearTimeout(timeoutId);

        // 'true' ensures we get the full certificate chain if available
        const cert = socket.getPeerCertificate(true);
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();

        // Check if the certificate is actually trusted by the root store
        const isAuthorized = socket.authorized;
        const authError = socket.authorizationError;

        socket.end(); // Graceful shutdown

        if (!cert || Object.keys(cert).length === 0) {
          isResolved = true;
          resolve(NextResponse.json({ error: 'No certificate presented' }, { status: 404 }));
          return;
        }

        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        // Parse Subject Alternative Names (SANs)
        const subjectaltname = cert.subjectaltname || '';
        const sans = subjectaltname
          .split(',')
          .map((s) => s.trim().replace('DNS:', ''))
          .filter((s) => s.length > 0);

        const responseData: SslCheckResponse = {
          isValid: isAuthorized,
          validationError: authError ? authError.message : null,
          subject: {
            CN: cert.subject.CN || 'Unknown',
            O: cert.subject.O,
            OU: cert.subject.OU,
          },
          issuer: {
            CN: cert.issuer.CN || 'Unknown',
            O: cert.issuer.O,
            C: cert.issuer.C,
          },
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysRemaining,
          serialNumber: cert.serialNumber,
          fingerprint: cert.fingerprint,
          cipher: cipher ? `${cipher.name} (${cipher.version})` : 'Unknown',
          protocol: protocol || 'Unknown',
          sans,
        };

        isResolved = true;
        resolve(NextResponse.json(responseData));
      });

      socket.on('error', (err) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          resolve(NextResponse.json({ error: `Connection failed: ${err.message}` }, { status: 500 }));
        }
      });

    } catch (e: unknown) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        const message = e instanceof Error ? e.message : 'An internal error occurred';
        resolve(NextResponse.json({ error: message }, { status: 500 }));
      }
    }
  });
}
