import { connect, type TLSSocket } from 'node:tls';
import { NextRequest, NextResponse } from 'next/server';

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
  const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];

  return new Promise<NextResponse>((resolve) => {
    // FIX: Use proper type TLSSocket instead of 'any' to satisfy strict linting
    let socket: TLSSocket | null = null;
    let isResolved = false;

    // Safety timeout wrapper
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        if (socket && !socket.destroyed) {
          socket.destroy();
        }
        resolve(NextResponse.json({ error: 'Connection timed out' }, { status: 504 }));
      }
    }, 5000);

    try {
      // Cloudflare Workers node:tls is strict. We cannot pass 'rejectUnauthorized: false'.
      // This means we can only successfully inspect VALID certificates.
      const options = {
        servername: cleanHost,
      };

      socket = connect(443, cleanHost, options, () => {
        if (isResolved || !socket) return;
        clearTimeout(timeoutId);

        // 'true' ensures we get the full certificate chain if available
        const cert = socket.getPeerCertificate(true);
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();

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
          .map((s: string) => s.trim().replace('DNS:', ''))
          .filter((s: string) => s.length > 0);

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

      socket.on('error', (err: Error) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          // If the error is SSL related, it implies the certificate is invalid/untrusted
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
