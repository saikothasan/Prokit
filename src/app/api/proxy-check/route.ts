import { NextRequest, NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as net from 'node:net';
import * as tls from 'node:tls';

// FIX: Use 'nodejs' runtime to access node:net/tls via Cloudflare's nodejs_compat layer
//export const runtime = 'nodejs';

interface ProxyCheckBody {
  proxies: string[];
  timeout?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ProxyCheckBody;
    const { proxies, timeout = 5000 } = body;

    if (!proxies || !Array.isArray(proxies)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const results = await Promise.all(
      proxies.map(async (proxyStr) => {
        const start = Date.now();
        // Standardize protocol
        const formattedProxy = proxyStr.includes('://') ? proxyStr : `http://${proxyStr}`;

        try {
          // 1. Create the Agent
          // This uses 'node:net' which is supported in nodejs_compat
          const agent = new HttpsProxyAgent(formattedProxy);

          // 2. Perform a check using the global fetch with the agent
          // We use a lightweight target (Google Gen 204)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const response = await fetch('https://www.google.com/generate_204', {
            method: 'HEAD',
            // @ts-ignore - Next.js fetch types don't officially support 'agent' but the runtime does
            agent: agent, 
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok || response.status === 204) {
            return { 
              proxy: proxyStr, 
              status: 'Active', 
              latency: Date.now() - start, 
              healthy: true 
            };
          } else {
             throw new Error(`Status: ${response.status}`);
          }

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
    console.error('Proxy check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
