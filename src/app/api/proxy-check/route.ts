import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { connect } from 'cloudflare:sockets';


export async function POST(req: NextRequest) {
  try {
    const { proxies, timeout = 3000 } = await req.json();
    
    if (!proxies || !Array.isArray(proxies)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Process batch
    const results = await Promise.all(
      proxies.map(async (proxyStr: string) => {
        const start = performance.now();
        const [ip, portStr] = proxyStr.split(':');
        const port = parseInt(portStr);

        if (!ip || isNaN(port)) {
          return { proxy: proxyStr, status: 'Invalid', latency: 0, healthy: false };
        }

        try {
          // Attempt TCP Connection
          const socket = connect({ hostname: ip, port });
          const writer = socket.writable.getWriter();
          const reader = socket.readable.getReader();

          const connectionPromise = new Promise<void>(async (resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('Timeout')), timeout);
            
            try {
              // Lightweight Handshake
              const handshake = new TextEncoder().encode("HEAD / HTTP/1.1\r\nHost: www.google.com\r\n\r\n");
              await writer.write(handshake);
              
              clearTimeout(timeoutId);
              resolve();
            } catch (e) {
              clearTimeout(timeoutId);
              reject(e);
            }
          });

          await connectionPromise;
          
          // Cleanup
          try { await writer.close(); } catch {}
          try { await reader.cancel(); } catch {}

          const end = performance.now();
          return { 
            proxy: proxyStr, 
            status: 'Active', 
            latency: Math.round(end - start), 
            healthy: true 
          };

        } catch (error) {
          return { 
            proxy: proxyStr, 
            status: 'Dead', 
            latency: 0, 
            healthy: false 
          };
        }
      })
    );

    return NextResponse.json({ results });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
